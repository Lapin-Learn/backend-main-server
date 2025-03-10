import { ActionNameEnum, BandScoreEnum, ItemName, ProfileItemStatusEnum, RankEnum } from "@app/types/enums";
import { IActivity, ILearnerProfile, ILearnerProfileInfo } from "@app/types/interfaces";
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
  SelectQueryBuilder,
  UpdateDateColumn,
} from "typeorm";
import { Level } from "./level.entity";
import { Streak } from "./streak.entity";
import { Activity } from "./activity.entity";
import { ProfileBadge } from "./profile-badge.entity";
import { ProfileMissionProgress } from "./profile-mission-progress.entity";
import { ProfileItem } from "./profile-item.entity";
import { LessonRecord } from "./lesson-record.entity";
import { LessonProcess } from "./lesson-process.entity";
import { LevelRankMap, NextBandScoreMap } from "@app/utils/maps";
import { UpdateResourcesDto } from "@app/types/dtos/learners";
import { Action } from "./action.entity";
import { Lesson } from "@app/database/entities/lesson.entity";
import { QuestionType } from "@app/database/entities/question-type.entity";
import moment from "moment-timezone";
import { getBeginOfOffsetDay, getEndOfOffsetDay } from "@app/utils/time";
import { BandScoreOrder, VN_TIME_ZONE } from "@app/types/constants";
import { SkillTestSession } from "./test-sessions.entity";
import { BadRequestException } from "@nestjs/common";

@Entity("learner_profiles")
export class LearnerProfile extends BaseEntity implements ILearnerProfile {
  constructor(newProfile?: Partial<ILearnerProfile>) {
    super();
    if (newProfile) {
      Object.assign(this, newProfile);
    }
  }

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

  @OneToMany(() => ProfileMissionProgress, (profileMissionProgress) => profileMissionProgress.profile, { eager: true })
  readonly profileMissionsProgress: ProfileMissionProgress[];

  @OneToMany(() => ProfileItem, (profileItem) => profileItem.profile, { eager: true })
  readonly profileItems: ProfileItem[];

  @OneToMany(() => LessonRecord, (lessonRecord) => lessonRecord.learnerProfile)
  readonly lessonRecords: LessonRecord[];

  @OneToMany(() => LessonProcess, (lessonProcess) => lessonProcess.learnerProfile, { eager: true })
  readonly lessonProcesses: LessonProcess[];

  @OneToMany(() => SkillTestSession, (skillTestSession) => skillTestSession.learnerProfile)
  skillTestSessions: SkillTestSession[];

  public async updateResources(newBonusResources: UpdateResourcesDto): Promise<UpdateResourcesDto> {
    const { bonusCarrot = 0, bonusXP = 0 } = newBonusResources;
    let isDoubleXP = false;
    this.carrots += bonusCarrot;
    const ultimateTime = this.profileItems.find((item) => item.item.name === ItemName.ULTIMATE_TIME);
    if (ultimateTime) {
      await ultimateTime.resetItemStatus();
      isDoubleXP = ultimateTime.status === ProfileItemStatusEnum.IN_USE;
    }
    this.xp += bonusXP * (isDoubleXP ? 2 : 1);
    await this.save();
    return {
      bonusXP: bonusXP * (isDoubleXP ? 2 : 1),
      bonusCarrot,
    };
  }

  async isLevelUp(): Promise<boolean> {
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

  isRankUp(): boolean {
    const newRank = LevelRankMap.get(this.level.id);
    if (newRank && newRank !== this.rank) {
      this.rank = newRank;
      return true;
    }
    return false;
  }

  async isAchieveDailyStreakOrCreate(): Promise<boolean> {
    const bonusStreakPoint = await Activity.getBonusStreakPoint(this.id);
    if (bonusStreakPoint == 0) {
      const action = await Action.findByName(ActionNameEnum.DAILY_STREAK);
      await Activity.save({
        profileId: this.id,
        actionId: action.id,
      });
      if (this.streak.extended) {
        await this.streak.increaseStreak();
      } else {
        // If yesterday not learn any new lesson or doing any simualated tests, reset streak to 1
        this.streak.current = 1;
        this.streak.extended = true;
        this.streak.lastDateGainNewStreak = moment().tz(VN_TIME_ZONE).toDate();
        await Streak.save({ ...this.streak });
      }

      return true;
    }
    return false;
  }

  async isBandScoreQuestionTypeUp(
    xp: number,
    duration: number,
    completedLessonId: number,
    questionTypeId: number
  ): Promise<boolean> {
    let currentQuestionTypeProcess = this.lessonProcesses.find(
      (lessonProcess) => lessonProcess.questionTypeId === questionTypeId
    );

    const currentLesson = await Lesson.findOne({ where: { id: completedLessonId } });

    if (currentQuestionTypeProcess === undefined) {
      currentQuestionTypeProcess = new LessonProcess({
        learnerProfile: this,
        questionTypeId: questionTypeId,
        currentLesson,
        questionType: await QuestionType.findOne({ where: { id: questionTypeId } }),
        bandScore: BandScoreEnum.PRE_IELTS,
        xp: [],
      });
      this.lessonProcesses.push(currentQuestionTypeProcess);
    } else if (
      BandScoreOrder.indexOf(currentQuestionTypeProcess.bandScore) < BandScoreOrder.indexOf(currentLesson.bandScore)
    ) {
      throw new BadRequestException("you can not finish the lesson with higher band score level");
    }

    const currentBandScore = currentQuestionTypeProcess.bandScore;
    if (BandScoreOrder.indexOf(currentLesson.bandScore) < BandScoreOrder.indexOf(currentBandScore)) {
      let completedLessonProcess = currentQuestionTypeProcess.xp.find((p) => p.lessonId === completedLessonId);
      if (!completedLessonProcess) {
        completedLessonProcess = {
          lessonId: completedLessonId,
          xp,
          duration,
        };
        currentQuestionTypeProcess.xp.push(completedLessonProcess);
      } else {
        const currentRequiredBandScore = currentQuestionTypeProcess.questionType.bandScoreRequires.find(
          (require) => require.bandScore === currentLesson.bandScore
        );

        completedLessonProcess.xp = Math.max(completedLessonProcess.xp + xp, currentRequiredBandScore.requireXP);
        completedLessonProcess.duration += duration;
      }
      await currentQuestionTypeProcess.save();
      return false;
    }
    await currentQuestionTypeProcess.updateLessonProcessOfLearner(xp, duration, completedLessonId);
    return (
      currentQuestionTypeProcess.bandScore !== currentBandScore &&
      currentQuestionTypeProcess.bandScore == NextBandScoreMap.get(currentBandScore)
    );
  }

  // Active Record Pattern
  static async getBrokenStreakProfiles() {
    const rawValidLearnerProfileIds = await this.createQueryBuilder("learnerProfiles")
      .leftJoinAndSelect("learnerProfiles.activities", "activities")
      .leftJoinAndSelect("activities.action", "actions")
      .where("DATE(activities.finishedAt) = CURRENT_DATE - 1")
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
    const profile: LearnerProfile = await this.createQueryBuilder("learnerProfile")
      .where("learnerProfile.id = :id", { id })
      .leftJoinAndSelect("learnerProfile.level", "levels")
      .leftJoinAndSelect("learnerProfile.streak", "streaks")
      .leftJoinAndSelect("learnerProfile.profileBadges", "profileBadges")
      .leftJoinAndSelect("learnerProfile.profileItems", "profileItems")
      .leftJoinAndSelect("profileItems.item", "items")
      .getOneOrFail();

    const currentItems: ILearnerProfileInfo["currentItems"] = await Promise.all(
      profile.profileItems.map(async (profileItem) => {
        const { quantity, expAt, item } = await profileItem.resetItemStatus();
        return { ...item, quantity, expAt };
      })
    );

    return { ...profile, currentItems };
  }

  static async getDailyStreakActivities(profileId: string, startDate: Date, endDate: Date): Promise<IActivity[]> {
    const data = await this.createQueryBuilder("learnerProfile")
      .leftJoinAndSelect("learnerProfile.activities", "activity")
      .leftJoinAndSelect("activity.action", "action")
      .where("learnerProfile.id = :profileId", { profileId })
      .andWhere("action.name = :actionName", { actionName: ActionNameEnum.DAILY_STREAK })
      .andWhere("activity.finishedAt BETWEEN :startDate AND :endDate", { startDate, endDate })
      .orderBy("DATE_TRUNC('day', activity.finishedAt)", "ASC")
      .distinctOn(["DATE_TRUNC('day', activity.finishedAt)"])
      .getOne();

    return data?.activities || [];
  }

  static async getFreezeStreakActivities(profileId: string, startDate: Date, endDate: Date): Promise<IActivity[]> {
    const modifiedStartDate = getBeginOfOffsetDay(1, startDate);
    const modifiedEndDate = getEndOfOffsetDay(1, endDate);

    const data = await this.createQueryBuilder("learnerProfile")
      .leftJoinAndSelect("learnerProfile.activities", "activity")
      .leftJoinAndSelect("activity.action", "action")
      .where("learnerProfile.id = :profileId", { profileId })
      .andWhere("action.name = :actionName", { actionName: ActionNameEnum.FREEZE_STREAK })
      .andWhere("activity.finishedAt BETWEEN :modifiedStartDate AND :modifiedEndDate", {
        modifiedStartDate,
        modifiedEndDate,
      })
      .orderBy("activity.finishedAt", "ASC")
      .distinctOn(["activity.finishedAt"])
      .getOne();

    return data?.activities || [];
  }

  static async getNotCompleteStreakProfiles() {
    const beginOfToday = getBeginOfOffsetDay(0);

    const subQuery = this.createQueryBuilder("learnerProfiles")
      .leftJoin("learnerProfiles.activities", "activities")
      .leftJoin("activities.action", "actions")
      .where("activities.finishedAt > :beginOfToday", { beginOfToday })
      .andWhere("actions.name = :actionName", { actionName: ActionNameEnum.DAILY_STREAK })
      .select("learnerProfiles.id");

    const profilesWithoutActionsToday = await this.createQueryBuilder("learnerProfiles")
      .leftJoinAndSelect("learnerProfiles.streak", "streaks")
      .where(`learnerProfiles.id NOT IN (${subQuery.getQuery()})`)
      .setParameters(subQuery.getParameters())
      .getMany();
    return profilesWithoutActionsToday;
  }

  static async getUnUpdatedStreakProfiles() {
    const subquery = (qb: SelectQueryBuilder<LearnerProfile>) => {
      return qb
        .select("1")
        .from("activities", "activities")
        .leftJoin("activities.action", "actions")
        .where("activities.profileId = learnerProfiles.id")
        .andWhere("actions.name = :actionName")
        .andWhere("DATE(activities.finishedAt) = CURRENT_DATE");
    };

    return await this.createQueryBuilder("learnerProfiles")
      .leftJoinAndSelect("learnerProfiles.streak", "streaks")
      .where("NOT EXISTS (" + subquery(this.createQueryBuilder()).getQuery() + ")")
      .andWhere("streaks.current > 0")
      .andWhere("streaks.extended = true")
      .setParameter("actionName", ActionNameEnum.DAILY_STREAK)
      .getMany();
  }

  static async getMissingStreakProfiles() {
    return await this.createQueryBuilder("learnerProfiles")
      .leftJoinAndSelect("learnerProfiles.streak", "streaks")
      .where("streaks.current > 0")
      .andWhere("streaks.extended = false")
      .setParameter("actionName", ActionNameEnum.DAILY_STREAK)
      .getMany();
  }

  static async getProfileAchiveStreakMilestone() {
    return await this.createQueryBuilder("learnerProfiles")
      .leftJoinAndSelect("learnerProfiles.streak", "streaks")
      .leftJoinAndSelect("learnerProfiles.activities", "activities")
      .where("streaks.current IN (:...milestones)", { milestones: [7, 30, 100] })
      .andWhere("streaks.extended = false")
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select("activity.id")
          .from(Activity, "activity")
          .leftJoin("activity.action", "actions")
          .where("activity.profileId = learnerProfiles.id")
          .andWhere("actions.name = :actionName")
          .andWhere("DATE(activity.finishedAt) = CURRENT_DATE")
          .getQuery();

        return `NOT EXISTS (${subQuery})`;
      })
      .setParameter("actionName", ActionNameEnum.DAILY_STREAK)
      .getMany();
  }

  public static async createNewProfile(): Promise<ILearnerProfile> {
    const streak = await new Streak().save();
    const level = await Level.findOne({ where: { id: 1 } });
    return this.save({ streak, level });
  }
}
