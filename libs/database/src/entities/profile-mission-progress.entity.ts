import { IntervalTypeEnum, ProfileMissionProgressStatusEnum } from "@app/types/enums";
import { IProfileMissionProgress } from "@app/types/interfaces";
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

@Entity({ name: "profile_missions_progress" })
export class ProfileMissionProgress extends BaseEntity implements IProfileMissionProgress {
  constructor(newMissionProgress?: Partial<IProfileMissionProgress>) {
    super();
    if (newMissionProgress) {
      Object.assign(this, newMissionProgress);
    }
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "profile_id", type: "uuid", nullable: false })
  profileId: string;

  @Column({ name: "mission_id", type: "uuid", nullable: false })
  missionId: string;

  @Column({
    name: "status",
    type: "enum",
    enum: ProfileMissionProgressStatusEnum,
    nullable: false,
    default: ProfileMissionProgressStatusEnum.ASSIGNED,
  })
  status: ProfileMissionProgressStatusEnum;

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

  // Active Record Pattern
  static async getMissions(learnerProfileId: string) {
    return this.createQueryBuilder("profile_missions_progress")
      .leftJoinAndSelect("profile_missions_progress.mission", "mission")
      .leftJoinAndSelect("mission.quest", "quest")
      .where("profile_missions_progress.profileId = :profileId", { profileId: learnerProfileId })
      .andWhere(
        `(
          DATE(profile_missions_progress.created_at) = CURRENT_DATE AND 
          mission.types = :daily
        )
        OR 
        (
          EXTRACT(MONTH FROM profile_missions_progress.created_at) = EXTRACT(MONTH FROM CURRENT_DATE) AND
          EXTRACT(YEAR FROM profile_missions_progress.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) AND
          mission.types = :monthly
        )`,
        {
          daily: IntervalTypeEnum.DAILY,
          monthly: IntervalTypeEnum.MONTHLY,
        }
      )
      .getMany();
  }
}
