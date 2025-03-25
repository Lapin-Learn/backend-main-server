import { Test, TestingModule } from "@nestjs/testing";
import { PayOSService } from "./payos.service";
import { ConfigService } from "@nestjs/config";
import { PayOSTransaction, UnitOfWorkService } from "@app/database";
import { OK_RESPONSE, PAYOS_INSTANCE } from "@app/types/constants";
import { PaymentStatusEnum } from "@app/types/enums";
import PayOS from "@payos/node";
import { CheckoutResponseDataType, PaymentLinkDataType, WebhookDataType } from "@payos/node/lib/type";
import { IPayOSRequestLink } from "@app/types/interfaces";
import { IPayOSWebhook } from "@app/types/interfaces/payment/payos-webhook.interface";

describe("PayOSService", () => {
  let service: PayOSService;
  let mockPayOS: jest.Mocked<PayOS>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockUnitOfWork: jest.Mocked<UnitOfWorkService>;
  let mockManager: any;

  beforeEach(async () => {
    mockPayOS = {
      createPaymentLink: jest.fn(),
      getPaymentLinkInformation: jest.fn(),
      cancelPaymentLink: jest.fn(),
      verifyPaymentWebhookData: jest.fn(),
      confirmWebhook: jest.fn(),
    } as unknown as jest.Mocked<PayOS>;

    mockConfigService = {
      get: jest.fn().mockReturnValue("mock-checksum-key"),
    } as unknown as jest.Mocked<ConfigService>;

    mockManager = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    mockUnitOfWork = {
      getManager: jest.fn().mockReturnValue(mockManager),
    } as unknown as jest.Mocked<UnitOfWorkService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayOSService,
        { provide: PAYOS_INSTANCE, useValue: mockPayOS },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UnitOfWorkService, useValue: mockUnitOfWork },
      ],
    }).compile();

    service = module.get<PayOSService>(PayOSService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createPaymentLink", () => {
    it("should create a payment link and save the transaction", async () => {
      const mockResponse: CheckoutResponseDataType = {
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

      const mockRequest: IPayOSRequestLink = {
        orderCode: 123,
        amount: 1000,
        description: "LAPIN - SUBSCRIPTION",
        items: [
          {
            name: "LAPIN - SUBSCRIPTION",
            quantity: 1,
            price: 1000,
          },
        ],
        expiredAt: 123456,
        returnUrl: "http://return.com",
        cancelUrl: "http://cancel.com",
      };

      mockPayOS.createPaymentLink.mockResolvedValue(mockResponse);
      mockManager.findOne.mockResolvedValue({ id: "123" }); // Mock existing transaction
      mockManager.save.mockResolvedValue(true);

      const result = await service.createPaymentLink(mockRequest);

      expect(mockPayOS.createPaymentLink).toHaveBeenCalledWith(mockRequest);
      expect(mockManager.save).toHaveBeenCalledWith(
        PayOSTransaction,
        expect.objectContaining({
          id: "link-123",
          transactionId: 123,
          amount: 1000,
          status: PaymentStatusEnum.PENDING,
          metadata: expect.objectContaining({
            ...mockResponse,
            status: PaymentStatusEnum.PENDING,
          }),
        })
      ),
        expect(result).toEqual(mockResponse);
    });

    it("should throw an error if the transaction does not exist", async () => {
      const mockRequest: IPayOSRequestLink = {
        orderCode: 123,
        amount: 1000,
        description: "LAPIN - SUBSCRIPTION",
        items: [
          {
            name: "LAPIN - SUBSCRIPTION",
            quantity: 1,
            price: 1000,
          },
        ],
        expiredAt: 123456,
        returnUrl: "http://return.com",
        cancelUrl: "http://cancel.com",
      };

      mockManager.findOne.mockResolvedValue(null); // No transaction found

      await expect(service.createPaymentLink(mockRequest)).rejects.toThrow("Transaction with ID 123 does not exist");
    });
  });

  describe("cancelPayOSLink", () => {
    it("should cancel a payment link and update the transaction", async () => {
      const mockOrderId = 123;
      const mockCancelDto = { cancellationReason: "User requested" };
      const mockResponse: PaymentLinkDataType = {
        id: "link-123",
        orderCode: 123,
        amount: 1000,
        amountPaid: 0,
        amountRemaining: 1000,
        status: PaymentStatusEnum.CANCELLED.toUpperCase(),
        createdAt: new Date().toISOString(),
        transactions: [],
        cancellationReason: "User requested",
        canceledAt: new Date().toISOString(),
      };

      mockPayOS.cancelPaymentLink.mockResolvedValue(mockResponse);
      mockManager.findOne.mockResolvedValue({ id: "123", metadata: {} });

      const result = await service.cancelPayOSLink(mockOrderId, mockCancelDto);

      expect(mockPayOS.cancelPaymentLink).toHaveBeenCalledWith(mockOrderId, "User requested");
      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: PaymentStatusEnum.CANCELLED,
          metadata: expect.objectContaining({
            status: PaymentStatusEnum.CANCELLED.toUpperCase(),
            cancellationReason: "User requested",
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("handlePayOSWebhook", () => {
    it("should verify and update the transaction based on webhook data", async () => {
      const mockVerifiedWebhookData: WebhookDataType = {
        orderCode: 123,
        amount: 1000,
        description: "LAPIN - SUBSCRIPTION",
        accountNumber: "123456",
        reference: "123",
        transactionDateTime: "2021-09-01T00:00:00Z",
        currency: "VND",
        paymentLinkId: "link-123",
        code: "00",
        desc: "PAID",
        counterAccountBankId: "123",
        counterAccountBankName: "Bank",
        counterAccountName: "John Doe",
        counterAccountNumber: "123456",
        virtualAccountName: "John Doe",
        virtualAccountNumber: "123456",
      };

      const mockWebhookData: IPayOSWebhook = {
        code: "123",
        desc: "PAID",
        success: true,
        data: {
          ...mockVerifiedWebhookData,
          counterAccountBankId: mockVerifiedWebhookData.counterAccountBankId || "",
          counterAccountBankName: mockVerifiedWebhookData.counterAccountBankName || "",
          counterAccountName: mockVerifiedWebhookData.counterAccountName || "",
          counterAccountNumber: mockVerifiedWebhookData.counterAccountNumber || "",
          virtualAccountName: mockVerifiedWebhookData.virtualAccountName || "",
          virtualAccountNumber: mockVerifiedWebhookData.virtualAccountNumber || "",
        },
        signature: "signature",
      };

      mockPayOS.verifyPaymentWebhookData.mockReturnValue(mockVerifiedWebhookData);
      mockManager.findOne.mockResolvedValue(null); // No existing transaction

      const result = await service.handlePayOSWebhook(mockWebhookData);

      expect(mockPayOS.verifyPaymentWebhookData).toHaveBeenCalledWith(mockWebhookData);
      expect(mockManager.save).toHaveBeenCalledWith(
        PayOSTransaction,
        expect.objectContaining({
          id: "link-123",
          transactionId: 123,
          amount: 1000,
          status: PaymentStatusEnum.PAID,
          metadata: expect.objectContaining({
            accountNumber: "123456",
            amount: 1000,
            code: "00",
            counterAccountBankId: "123",
            counterAccountBankName: "Bank",
            counterAccountName: "John Doe",
            counterAccountNumber: "123456",
            currency: "VND",
            desc: "PAID",
            description: "LAPIN - SUBSCRIPTION",
            orderCode: 123,
            paymentLinkId: "link-123",
            reference: "123",
            transactionDateTime: "2021-09-01T00:00:00Z",
            virtualAccountName: "John Doe",
            virtualAccountNumber: "123456",
          }),
        })
      );
      expect(result).toEqual(OK_RESPONSE);
    });
  });
});
