import { Test, TestingModule } from "@nestjs/testing";
import { PaymentService } from "./payment.service";
import { PayOSService } from "./payos.service";
import { UnitOfWorkService, Transaction, PayOSTransaction } from "@app/database";
import { Queue } from "bullmq";
import { PaymentStatusEnum, PaymentCancellationReasonEnum, PaymentTypeEnum } from "@app/types/enums";
import { CreatePaymentLinkDto } from "@app/types/dtos/payment";
import { CheckoutResponseDataType, PaymentLinkDataType } from "@payos/node/lib/type";
import { ITransaction } from "@app/types/interfaces";
import { PAYMENT_CRON_JOB, REVOKE_EXPIRED_TRANSACTION_JOB } from "@app/types/constants";

describe("PaymentService", () => {
  let service: PaymentService;
  let mockPayOSService: jest.Mocked<PayOSService>;
  let mockUnitOfWork: jest.Mocked<UnitOfWorkService>;
  let mockManager: any;
  let mockQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    // Mock PayOSService
    mockPayOSService = {
      createPaymentLink: jest.fn(),
      getPaymentLinkInformation: jest.fn(),
      cancelPayOSLink: jest.fn(),
    } as unknown as jest.Mocked<PayOSService>;

    // Mock Entity Manager
    mockManager = {
      save: jest.fn(),
      findOne: jest.fn(),
    };

    // Mock UnitOfWorkService
    mockUnitOfWork = {
      getManager: jest.fn().mockReturnValue(mockManager),
    } as unknown as jest.Mocked<UnitOfWorkService>;

    // Mock Queue
    mockQueue = {
      add: jest.fn(),
    } as unknown as jest.Mocked<Queue>;

    // Mock Transaction Static Methods
    jest.spyOn(Transaction, "getDuplicatedTransactions").mockResolvedValue([]);
    jest.spyOn(Transaction, "getTransactionHistory").mockResolvedValue({
      transactions: [],
      total: 0,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PayOSService, useValue: mockPayOSService },
        { provide: UnitOfWorkService, useValue: mockUnitOfWork },
        { provide: `BullQueue_${PAYMENT_CRON_JOB}`, useValue: mockQueue },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createPaymentTransaction", () => {
    it("should create a payment transaction and call PayOSService", async () => {
      const mockDto: CreatePaymentLinkDto = {
        quantity: 2,
        redirectUrl: "http://example.com",
        type: PaymentTypeEnum.CARROTS,
      };

      const mockTransaction = {
        id: 1,
        accountId: "user-123",
        status: PaymentStatusEnum.PENDING,
        amount: 40,
        items: [
          {
            name: "CARROTS",
            quantity: 2,
            price: 20,
          },
        ],
      };

      const mockPayOSResponse: CheckoutResponseDataType = {
        bin: "123",
        accountNumber: "123456",
        accountName: "John Doe",
        amount: 1000,
        description: "LAPIN - SUBSCRIPTION",
        orderCode: 123,
        currency: "VND",
        paymentLinkId: "link-123",
        status: PaymentStatusEnum.PENDING,
        checkoutUrl: "http://checkout.com",
        qrCode: "http://qr.com",
      };

      jest.spyOn(Transaction, "getDuplicatedTransactions").mockResolvedValue([]); // No duplicated transactions
      mockManager.save.mockResolvedValue(mockTransaction); // Mock saving the transaction
      mockPayOSService.createPaymentLink.mockResolvedValue(mockPayOSResponse); // Mock PayOS response

      const result = await service.createPaymentTransaction(mockDto, "user-123");

      expect(Transaction.getDuplicatedTransactions).toHaveBeenCalledWith("user-123", expect.any(Array));
      expect(mockManager.save).toHaveBeenCalledWith(
        Transaction,
        expect.objectContaining({
          accountId: "user-123",
          status: PaymentStatusEnum.PENDING,
          amount: 40,
        })
      );
      expect(mockPayOSService.createPaymentLink).toHaveBeenCalledWith(
        expect.objectContaining({
          orderCode: mockTransaction.id,
          amount: 40,
          description: "LAPIN - SUBSCRIPTION",
        })
      );
      expect(result).toEqual(mockPayOSResponse);
    });
  });

  describe("getPaymentInformation", () => {
    it("should retrieve payment information and update transaction status", async () => {
      const mockTransaction = {
        id: 1,
        status: PaymentStatusEnum.PAID,
        createdAt: new Date("2025-03-23T15:27:09.630Z"), // 10 seconds ago
      };

      const mockPayOSResponse: PaymentLinkDataType & Partial<PayOSTransaction> = {
        id: "link-123",
        orderCode: 1,
        amount: 1000,
        amountPaid: 1000,
        amountRemaining: 0,
        status: PaymentStatusEnum.PAID,
        transactions: [],
        cancellationReason: null,
        canceledAt: null,
        createdAt: "2025-03-23T15:27:09.630Z" as undefined, // Match the createdAt with mockTransaction
      };

      mockManager.findOne.mockResolvedValue(mockTransaction); // Mock finding the transaction
      mockPayOSService.getPaymentLinkInformation.mockResolvedValue(mockPayOSResponse); // Mock PayOS response
      mockManager.save.mockResolvedValue(true); // Mock saving the transaction

      const result = await service.getPaymentInformation(1);

      expect(mockManager.findOne).toHaveBeenCalledWith(Transaction, { where: { id: 1 } });
      expect(mockPayOSService.getPaymentLinkInformation).toHaveBeenCalledWith(1);
      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({ ...mockTransaction, status: PaymentStatusEnum.PAID })
      );
      expect(result).toEqual(expect.objectContaining({ ...mockPayOSResponse, ...mockTransaction }));
    });
  });

  describe("cancelPayment", () => {
    it("should cancel a payment and update the transaction", async () => {
      const mockTransaction = {
        id: 1,
        status: PaymentStatusEnum.PENDING,
      };

      const mockCancelResponse: PaymentLinkDataType = {
        id: "link-123",
        orderCode: 1,
        amount: 1000,
        amountPaid: 0,
        amountRemaining: 1000,
        status: PaymentStatusEnum.CANCELLED,
        createdAt: new Date().toISOString(),
        transactions: [],
        cancellationReason: PaymentCancellationReasonEnum.EXPIRED,
        canceledAt: new Date().toISOString(),
      };

      mockManager.findOne.mockResolvedValue(mockTransaction); // Mock finding the transaction
      mockPayOSService.cancelPayOSLink.mockResolvedValue(mockCancelResponse); // Mock PayOS response
      mockManager.save.mockResolvedValue(true); // Mock saving the transaction

      const result = await service.cancelPayment(1, { cancellationReason: PaymentCancellationReasonEnum.EXPIRED });

      expect(mockManager.findOne).toHaveBeenCalledWith(Transaction, { where: { id: 1 } });
      expect(mockPayOSService.cancelPayOSLink).toHaveBeenCalledWith(1, {
        cancellationReason: PaymentCancellationReasonEnum.EXPIRED,
      });
      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          status: PaymentStatusEnum.CANCELLED,
        })
      );
      expect(result).toEqual(mockCancelResponse);
    });
  });

  describe("getTransactionHistory", () => {
    it("should retrieve transaction history", async () => {
      const mockHistory: { transactions: Partial<ITransaction>[]; total: number } = {
        transactions: [
          {
            id: 1,
            accountId: "user-123",
            amount: 1000,
            items: [],
            status: PaymentStatusEnum.PAID,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 2,
            accountId: "user-123",
            amount: 1000,
            items: [],
            status: PaymentStatusEnum.CANCELLED,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 2,
      };

      jest.spyOn(Transaction, "getTransactionHistory").mockResolvedValue(mockHistory);

      const result = await service.getTransactionHistory("user-123", 0, 10);

      expect(Transaction.getTransactionHistory).toHaveBeenCalledWith("user-123", 0, 10);
      expect(result).toEqual({
        items: mockHistory.transactions,
        total: mockHistory.total,
      });
    });
  });

  describe("revokeExpiredTransactions", () => {
    it("should add a job to the payment queue", async () => {
      await service.revokeExpiredTransactions();

      expect(mockQueue.add).toHaveBeenCalledWith(
        REVOKE_EXPIRED_TRANSACTION_JOB,
        {},
        {
          jobId: REVOKE_EXPIRED_TRANSACTION_JOB,
          removeOnComplete: true,
          attempts: 1,
        }
      );
    });
  });

  describe("cancelListOfTransactions", () => {
    it("should cancel a list of transactions", async () => {
      const mockTransactions = [
        {
          id: 1,
          accountId: "user-123",
          status: PaymentStatusEnum.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
          amount: 1000,
          items: [],
        },
        {
          id: 2,
          accountId: "user-123",
          status: PaymentStatusEnum.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
          amount: 1000,
          items: [],
        },
      ];

      const mockCancelResponse: PaymentLinkDataType = {
        id: "link-123",
        orderCode: 1,
        amount: 1000,
        amountPaid: 0,
        amountRemaining: 1000,
        status: PaymentStatusEnum.CANCELLED,
        createdAt: new Date().toISOString(),
        transactions: [],
        cancellationReason: PaymentCancellationReasonEnum.DUPLICATED,
        canceledAt: new Date().toISOString(),
      };

      jest.spyOn(service, "cancelPayment").mockResolvedValue(mockCancelResponse);

      const result = await service.cancelListOfTransactions(mockTransactions, PaymentCancellationReasonEnum.DUPLICATED);

      expect(service.cancelPayment).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ fulfilled: 2, rejected: 0 });
    });
  });
});
