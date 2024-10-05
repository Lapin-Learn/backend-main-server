import { ActionNameEnum, MileStonesEnum, RankEnum } from "@app/types/enums";
import { ILearnerProfile, ILearnerProfileInfo, IMileStoneInfo } from "@app/types/interfaces";
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
import { getUTCBeginOfDay, getUTCEndOfDay, newDateUTC } from "@app/utils/time";
import { LessonRecord } from "./lesson-record.entity";
import { LessonProcess } from "./lesson-process.entity";
import { LevelRankMap } from "@app/utils/maps";
import { UpdateResourcesDto } from "@app/types/dtos/learners";
import { Action } from "./action.entity";

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

  @ManyToOne(() => Level, (level) => level.id, { eager: true })
  @JoinColumn({ name: "level_id", referencedColumnName: "id" })
  level: Level;

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

  @OneToMany(() => LessonRecord, (lessonRecord) => lessonRecord.learnerProfile)
  readonly lessonRecords: LessonRecord[];

  @OneToMany(() => LessonProcess, (lessonProcess) => lessonProcess.learnerProfile)
  readonly lessonProcesses: LessonProcess[];

  private async getMileStones(): Promise<IMileStoneInfo[]> {
    const milestones: IMileStoneInfo[] = [];
    const isLevelUp = await this.isLevelUp();
    const isRankUp = this.isRankUp();
    const isAchieveDailyStreak = await this.isAchieveDailyStreakOrCreate();
    await this.save();
    isLevelUp && milestones.push({ type: MileStonesEnum.IS_LEVEL_UP, newValue: this.level });
    isRankUp && milestones.push({ type: MileStonesEnum.IS_RANK_UP, newValue: this.rank });
    isAchieveDailyStreak && milestones.push({ type: MileStonesEnum.IS_DAILY_STREAK, newValue: this.streak.current });
    return milestones;
  }

  private async isLevelUp(): Promise<boolean> {
    if (this.xp >= this.level.xp) {
      const nextLevel = await Level.findOne({ where: { id: this.levelId + 1 } });
      if (nextLevel) {
        this.xp -= this.level.xp;
        this.level = nextLevel;
        return true;
      }
    }
    return false;
  }

  private isRankUp(): boolean {
    const newRank = LevelRankMap.get(this.level.id);
    if (newRank && newRank !== this.rank) {
      this.rank = newRank;
      return true;
    }
    return false;
  }

  private async isAchieveDailyStreakOrCreate(): Promise<boolean> {
    const bonusStreakPoint = await Activity.getBonusStreakPoint(this.id);
    if (bonusStreakPoint > 0) {
      const action = await Action.findOne({ where: { name: ActionNameEnum.DAILY_STREAK } });
      await Activity.save({
        profileId: this.id,
        actionId: action.id,
      });

      this.streak.current += bonusStreakPoint;
      this.streak.record = Math.max(this.streak.record, this.streak.current);
      await this.streak.save();

      return true;
    }
    return false;
  }

  public async updateResources(newBonusResources: UpdateResourcesDto): Promise<IMileStoneInfo[]> {
    const { bonusCarrot = 0, bonusXP = 0 } = newBonusResources;
    this.carrots += bonusCarrot;
    this.xp += bonusXP;

    //save new data
    await this.save();

    //return milestones
    return await this.getMileStones();
  }

  // Active Record Pattern
  static async getBrokenStreakProfiles() {
    // Midnight yesterday in UTC
    const beginOfYesterday = getUTCBeginOfDay(newDateUTC(), -1);

    // 23:59:59 yesterday in UTC
    const endOfYesterday = getUTCEndOfDay(newDateUTC(), -1);

    const rawValidLearnerProfileIds = await this.createQueryBuilder("learnerProfiles")
      .leftJoinAndSelect("learnerProfiles.activities", "activities")
      .leftJoinAndSelect("activities.action", "actions")
      .where("activities.finishedAt BETWEEN :beginOfYesterday AND :endOfYesterday", {
        beginOfYesterday,
        endOfYesterday,
      })
      .andWhere("actions.name = :actionName", { actionName: ActionNameEnum.DAILY_STREAK })
      .select("learnerProfiles.id")
      .getMany();

    const validLearnerProfileIds = rawValidLearnerProfileIds.map((profile) => profile.id);

    return await this.createQueryBuilder("learnerProfiles")
      .where(validLearnerProfileIds.length > 0 ? "learnerProfiles.id NOT IN (:...validLearnerProfileIds)" : "1=1", {
        validLearnerProfileIds,
      })
      .leftJoinAndSelect("learnerProfiles.streak", "streaks")
      .getMany();
  }

  static async getLearnerProfileById(id: string): Promise<ILearnerProfileInfo> {
    const profile: ILearnerProfile = await this.createQueryBuilder("learnerProfile")
      .where("learnerProfile.id = :id", { id })
      .leftJoinAndSelect("learnerProfile.level", "levels")
      .leftJoinAndSelect("learnerProfile.streak", "streaks")
      .leftJoinAndSelect("learnerProfile.profileBadges", "profileBadges")
      .leftJoinAndSelect("learnerProfile.profileMissions", "profileMissions")
      .leftJoinAndSelect("learnerProfile.profileItems", "profileItems")
      .leftJoinAndSelect("profileItems.item", "items")
      .getOneOrFail();

    const currentItems = profile.profileItems.map((profileItem) => {
      const { quantity, expAt } = profileItem;
      return { ...profileItem.item, quantity, expAt };
    });

    return { ...profile, currentItems };
  }

  static async getDailyStreakActivities(profileId: string, startDate: Date, endDate: Date) {
    const data = await this.createQueryBuilder("learnerProfile")
      .leftJoinAndSelect("learnerProfile.activities", "activity")
      .leftJoinAndSelect("activity.action", "action")
      .where("learnerProfile.id = :profileId", { profileId })
      .andWhere("action.name = :actionName", { actionName: ActionNameEnum.DAILY_STREAK })
      .andWhere("activity.finishedAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .getOne();

    return data?.activities || [];
  }
}
