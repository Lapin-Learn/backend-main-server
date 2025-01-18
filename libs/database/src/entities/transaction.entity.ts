import { PaymentStatusEnum } from "@app/types/enums";
import { ITransaction } from "@app/types/interfaces";
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { Account } from "./account.entity";
import { PayOSTransaction } from "./payos-transaction.entity";

@Entity("transactions")
export class Transaction extends BaseEntity implements ITransaction {
  @PrimaryGeneratedColumn("increment")
  id: number; // order code sent to PayOS

  @Column({ name: "account_id" })
  accountId: string; // Link to the account, not learner_profile

  @Column({
    name: "status",
    type: "varchar",
    default: PaymentStatusEnum.PENDING,
  })
  status: PaymentStatusEnum; // e.g., paid, canceled, pending

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Account, (account) => account.id)
  @JoinColumn({ name: "account_id", referencedColumnName: "id" })
  readonly account: Account;

  @OneToOne(() => PayOSTransaction, (payosTransaction) => payosTransaction.transaction)
  payosTransactions: PayOSTransaction[];

  static async getTransactionHistory(accountId: string, offset: number, limit: number) {
    const queryBuilder = Transaction.createQueryBuilder("transaction")
      .leftJoin("transaction.payosTransactions", "payos_transactions")
      .addSelect([
        "payos_transactions.amount",
        "payos_transactions.status",
        "payos_transactions.id",
        "payos_transactions.createdAt",
        "payos_transactions.updatedAt",
      ])
      .where("transaction.accountId = :accountId", { accountId })
      .orderBy("transaction.updatedAt", "DESC")
      .skip(offset)
      .take(limit);

    const [transactions, total] = await queryBuilder.getManyAndCount();

    return { transactions, total };
  }
}
