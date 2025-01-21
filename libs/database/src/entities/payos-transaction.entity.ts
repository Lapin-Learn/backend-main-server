import { PaymentStatusEnum } from "@app/types/enums";
import { IPayOSTransaction } from "@app/types/interfaces";
import {
  Entity,
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from "typeorm";
import { Transaction } from "./transaction.entity";

@Entity("payos_transactions")
export class PayOSTransaction extends BaseEntity implements IPayOSTransaction {
  @PrimaryColumn()
  id: string; // id webhook

  @Column({
    name: "transaction_id",
  })
  // Foreign key to Transaction table
  // also the order code sent to PayOS
  transactionId: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({
    name: "status",
    type: "varchar",
    default: PaymentStatusEnum.PENDING,
  })
  status: PaymentStatusEnum; // e.g., cancelled, pending

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>; // Raw response from PayOS

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt: Date;

  @OneToOne(() => Transaction, (transaction) => transaction.id)
  @JoinColumn({ name: "transaction_id", referencedColumnName: "id" })
  readonly transaction: Transaction;
}
