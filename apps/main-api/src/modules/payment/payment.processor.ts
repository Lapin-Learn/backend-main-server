import { PAYMENT_CRON_JOB, REVOKE_EXPIRED_TRANSACTION_JOB } from "@app/types/constants";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { PaymentCancellationReasonEnum } from "@app/types/enums";
import { Transaction } from "@app/database";
import { PaymentService } from "./payment.service";
import { Job } from "bullmq";

@Processor(PAYMENT_CRON_JOB)
export class PaymentProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentProcessor.name);
  constructor(private readonly paymentService: PaymentService) {
    super();
  }

  async process(job: Job) {
    try {
      if (job.name === REVOKE_EXPIRED_TRANSACTION_JOB) return this.revokeExpiredTransactionsJob();
    } catch (err) {
      this.logger.error(`Fail ${job.name} job: `, err);
      throw err;
    }
  }

  private async revokeExpiredTransactionsJob() {
    const expiredTransactions = await Transaction.getExpiredTransactions();
    if (expiredTransactions.length > 0) {
      const { fulfilled, rejected } = await this.paymentService.cancelListOfTransactions(
        expiredTransactions,
        PaymentCancellationReasonEnum.EXPIRED
      );
      this.logger.log(`Revoked ${fulfilled} transactions, ${rejected} transactions failed`);
    }
    return expiredTransactions;
  }
}
