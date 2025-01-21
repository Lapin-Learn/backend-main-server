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
import { IItemTransaction } from "@app/types/interfaces/payment/item-transaction.interface";
import { EXPIRED_TIME } from "@app/types/constants";

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

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  amount: number;

  @Column({ type: "jsonb", nullable: false, default: [] }) // If null, it's a subscription, donate, or testing
  items: IItemTransaction[]; // Items in the transaction

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
  @JoinColumn({ name: "id", referencedColumnName: "transactionId" })
  payosTransaction: PayOSTransaction;

  static async getTransactionHistory(accountId: string, offset: number, limit: number) {
    const queryBuilder = this.createQueryBuilder("transaction")
      .leftJoin("transaction.payosTransaction", "payos_transaction")
      .addSelect([
        "payos_transaction.amount",
        "payos_transaction.status",
        "payos_transaction.id",
        "payos_transaction.createdAt",
        "payos_transaction.updatedAt",
      ])
      .where("transaction.accountId = :accountId", { accountId })
      .orderBy("transaction.updatedAt", "DESC")
      .skip(offset)
      .take(limit);

    const [transactions, total] = await queryBuilder.getManyAndCount();

    return { transactions, total };
  }

  static async getExpiredTransactions() {
    const queryBuilder = this.createQueryBuilder("transaction")
      .leftJoin("transaction.payosTransaction", "payos_transaction")
      .where("transaction.status = :status", { status: PaymentStatusEnum.PENDING })
      .andWhere("transaction.createdAt <= :date", { date: new Date(Date.now() - EXPIRED_TIME) });

    return queryBuilder.getMany();
  }

  static async getDuplicatedTransactions(accountId: string, items: IItemTransaction[]) {
    return this.createQueryBuilder("transaction")
      .where("transaction.accountId = :accountId", { accountId })
      .andWhere("transaction.status = :status", { status: PaymentStatusEnum.PENDING })
      .andWhere(":items @> transaction.items", { items: JSON.stringify(items) })
      .getMany();
  }
}
