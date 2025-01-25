import { LearnerProfile } from "@app/database";
import { MileStonesEnum } from "@app/types/enums";
import { MileStonesObserver } from "./milestone.observer";

export class LearnerProfileSubject {
  private readonly learner: LearnerProfile;
  private readonly observer: MileStonesObserver;
  constructor(learner: LearnerProfile, observer: MileStonesObserver) {
    this.learner = learner;
    this.observer = observer;
  }

  private notify(type: MileStonesEnum, newValue: any) {
    this.observer.update(type, newValue);
  }

  async checkLevelUp() {
    const isLevelUp = await this.learner.isLevelUp();
    if (isLevelUp) {
      await this.learner.save();
      this.notify(MileStonesEnum.IS_LEVEL_UP, this.learner.level);
    }
  }

  async checkRankUp() {
    const isRankUp = this.learner.isRankUp();
    if (isRankUp) {
      await this.learner.save();
      this.notify(MileStonesEnum.IS_RANK_UP, this.learner.rank);
    }
  }

  async checkAchieveDailyStreak() {
    const isAchieveDailyStreak = await this.learner.isAchieveDailyStreakOrCreate();
    if (isAchieveDailyStreak) {
      this.notify(MileStonesEnum.IS_DAILY_STREAK, this.learner.streak.current);
    }
  }

  async checkProfileChange(): Promise<void> {
    await Promise.all([this.checkLevelUp(), this.checkRankUp(), this.checkAchieveDailyStreak()]);
  }

  async checkAfterFinishLesson(xp: number, duration: number, completedLessonId: number, questionTypeId: number) {
    const isBandScoreUp = await this.learner.isBandScoreQuestionTypeUp(xp, duration, completedLessonId, questionTypeId);
    if (isBandScoreUp) {
      await this.learner.save();
      this.notify(
        MileStonesEnum.IS_BAND_SCORE_QUESTION_TYPE_UP,
        this.learner.lessonProcesses.find((lesson) => lesson.questionTypeId === questionTypeId).bandScore
      );
    }
  }
}
