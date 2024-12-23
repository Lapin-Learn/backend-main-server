import { AccountRoleEnum, GenderEnum } from "@app/types/enums";
import { IAccount, ILearnerProfile } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { LearnerProfile } from "./learner-profile.entity";
import { Bucket } from "@app/database/entities/bucket.entity";
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

  @Column({ name: "learner_profile_id", type: "uuid", nullable: true, default: null })
  learnerProfileId: string;

  @Column({ name: "avatar_id", type: "uuid", nullable: true, default: null })
  avatarId: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamp", nullable: true })
  deletedAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @OneToOne(() => LearnerProfile)
  @JoinColumn({ name: "learner_profile_id", referencedColumnName: "id" })
  learnerProfile: ILearnerProfile;

  @OneToOne(() => Bucket)
  @JoinColumn({ name: "avatar_id", referencedColumnName: "id" })
  readonly avatar: Bucket;

  static async createAccount(data: Partial<IAccount>, isVerified: boolean) {
    if (isVerified) {
      data.learnerProfile = await LearnerProfile.createNewProfile();
    }
    return await this.save({ ...data });
  }
}
