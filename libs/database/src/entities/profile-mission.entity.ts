import { ProfileMissionStatusEnum } from "@app/types/enums";
import { IProfileMission } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { LearnerProfile } from "./learner-profile.entity";
import { Mission } from "./mission.entity";

@Entity({ name: "profile_missions" })
export class ProfileMission extends BaseEntity implements IProfileMission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "profile_id", type: "uuid", nullable: false })
  profileId: string;

  @Column({ name: "mission_id", type: "uuid", nullable: false })
  missionId: string;

  @Column({
    name: "status",
    type: "enum",
    enum: ProfileMissionStatusEnum,
    nullable: false,
    default: ProfileMissionStatusEnum.ASSIGNED,
  })
  status: ProfileMissionStatusEnum;

  @Column({ name: "current", type: "int", nullable: false, default: 0 })
  current: number;

  @Column({ type: "int", nullable: false, default: 0 })
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
  @ManyToOne(() => LearnerProfile, (profile) => profile.id)
  @JoinColumn({ name: "profile_id", referencedColumnName: "id" })
  profile: LearnerProfile;

  @ManyToOne(() => Mission, (mission) => mission.id, { eager: true })
  @JoinColumn({ name: "mission_id", referencedColumnName: "id" })
  mission: Mission;

  public async handMissionComplete(): Promise<void> {
    this.current += 1;
    if (this.current >= this.mission.quest.quantity) {
      this.status = ProfileMissionStatusEnum.COMPLETED;
    }
    await this.save();
  }
}
