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
} from "typeorm";
import { Account } from "./account.entity";

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
}
