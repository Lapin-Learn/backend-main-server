import { INotificationToken } from "@app/types/interfaces";

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Account } from "./account.entity";

@Entity("notifications")
export class NotificationToken extends BaseEntity implements INotificationToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "account_id", type: "uuid", nullable: false })
  accountId: string;

  @Column({ name: "token", type: "varchar", nullable: false })
  token: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Account)
  @JoinColumn({ name: "account_id", referencedColumnName: "id" })
  readonly account: Account;
}
