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

@Entity("notification_tokens")
export class NotificationToken extends BaseEntity implements INotificationToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "account_id", type: "uuid", nullable: false })
  accountId: string;

  @Column({ name: "token", type: "varchar", nullable: true })
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

  static async getTokensByLearnerProfileIds(learnerProfileIds: string[]): Promise<NotificationToken[]> {
    return this.createQueryBuilder("notification_tokens")
      .leftJoinAndSelect("notification_tokens.account", "account")
      .leftJoinAndSelect("account.learnerProfile", "learnerProfile")
      .leftJoinAndSelect("learnerProfile.streak", "streaks")
      .where("account.learner_profile_id IN (:...learnerProfileIds)", { learnerProfileIds })
      .andWhere("notification_tokens.token IS NOT NULL")
      .getMany();
  }
}
