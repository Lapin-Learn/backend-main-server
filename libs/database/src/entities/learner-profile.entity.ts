import { RankEnum } from "@app/types/enums";
import { ILearnerProfile } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Level } from "./level.entity";
import { Streak } from "./streak.entity";
import { Activity } from "./activity.entity";
import { ProfileBadge } from "./profile-badge.entity";
import { ProfileMission } from "./profile-mission.entity";
import { ProfileItem } from "./profile-item.entity";

@Entity("learner_profiles")
export class LearnerProfile extends BaseEntity implements ILearnerProfile {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "rank", type: "enum", enum: RankEnum, nullable: false, default: RankEnum.BRONZE })
  rank: RankEnum;

  @Column({ name: "level_id", type: "int", nullable: false, default: 1 })
  levelId: number;

  @Column({ name: "xp", type: "int", nullable: false, default: 0 })
  xp: number;

  @Column({ name: "carrots", type: "int", nullable: false, default: 0 })
  carrots: number;

  @Column({ name: "streak_id", type: "int", nullable: false })
  streakId: number;

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

  @ManyToOne(() => Level, (level) => level.id)
  @JoinColumn({ name: "level_id", referencedColumnName: "id" })
  readonly level: Level;

  @OneToOne(() => Streak, { eager: true })
  @JoinColumn({ name: "streak_id", referencedColumnName: "id" })
  readonly streak: Streak;

  @OneToMany(() => Activity, (activity) => activity.profile)
  readonly activities: Activity[];

  @OneToMany(() => ProfileBadge, (profileBadge) => profileBadge.profile)
  readonly profileBadges: ProfileBadge[];

  @OneToMany(() => ProfileMission, (profileMission) => profileMission.profile)
  readonly profileMissions: ProfileMission[];

  @OneToMany(() => ProfileItem, (profileItem) => profileItem.profile)
  readonly profileItems: ProfileItem[];
}
