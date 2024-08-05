import { ProfileMissionStatusEnum } from "@app/types/enums";
import { IProfileMission } from "@app/types/interfaces";
import { BaseEntity, Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LearnerProfile } from "./learner-profile.entity";
import { Mission } from "./mission.entity";

export class ProfileMission extends BaseEntity implements IProfileMission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "profile_id", type: "uuid", nullable: false })
  profileId: string;

  @Column({ name: "mission_id", type: "uuid", nullable: false })
  missionId: string;

  @Column({ type: "enum", enum: ProfileMissionStatusEnum, nullable: false, default: ProfileMissionStatusEnum.ASSIGNED })
  status: ProfileMissionStatusEnum;

  // Relations
  @ManyToOne(() => LearnerProfile, (profile) => profile.id)
  @JoinColumn({ name: "profile_id", referencedColumnName: "id" })
  profile: LearnerProfile;

  @ManyToOne(() => Mission, (mission) => mission.id)
  @JoinColumn({ name: "mission_id", referencedColumnName: "id" })
  mission: Mission;
}
