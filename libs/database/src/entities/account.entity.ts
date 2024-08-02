import { AccountRoleEnum, GenderEnum } from "@app/types/enums";
import { IAccount, ILearnerProfile } from "@app/types/interfaces";
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
import { LearnerProfile } from "./learner-profile.entity";

@Entity("accounts")
export class Account extends BaseEntity implements IAccount {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "provider_id", type: "varchar", length: 36, nullable: false })
  providerId: string;

  @Column({ name: "username", type: "varchar", length: 50, nullable: false })
  username: string;

  @Column({ name: "email", type: "varchar", length: 50, nullable: false })
  email: string;

  @Column({ name: "role", type: "enum", enum: AccountRoleEnum, nullable: false, default: AccountRoleEnum.LEARNER })
  role: AccountRoleEnum;

  @Column({ name: "full_name", type: "varchar", length: 50, nullable: true, default: null })
  fullName: string;

  @Column({ name: "dob", type: "date", nullable: true, default: null })
  dob: Date;

  @Column({ name: "gender", type: "enum", enum: GenderEnum, nullable: true, default: null })
  gender: GenderEnum;

  @Column({ name: "learner_profile_id", type: "varchar", length: 36, nullable: true, default: null })
  learnerProfileId: string;

  @CreateDateColumn({ name: "created_on", type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
  createdOn: Date;

  @UpdateDateColumn({
    name: "updated_on",
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedOn: Date;

  @OneToOne(() => LearnerProfile, { eager: true })
  @JoinColumn({ name: "learner_profile_id", referencedColumnName: "id" })
  readonly learnerProfile: ILearnerProfile;
}
