import { Injectable } from "@nestjs/common";
import { LearnerProfile } from "@app/database";
import { MileStonesEnum } from "@app/types/enums";
import { MileStonesObserver } from "../observers";

@Injectable()
export class LearnerProfileSubject {
  constructor(private readonly observer: MileStonesObserver) {}

  private notify(type: MileStonesEnum, newValue: any) {
    this.observer.update(type, newValue);
  }

  private async checkLevelUp(learner: LearnerProfile) {
    const isLevelUp = await learner.isLevelUp();
    if (isLevelUp) {
      await learner.save();
      this.notify(MileStonesEnum.IS_LEVEL_UP, learner.level);
    }
  }

  private async checkRankUp(learner: LearnerProfile) {
    const isRankUp = learner.isRankUp();
    if (isRankUp) {
      await learner.save();
      this.notify(MileStonesEnum.IS_RANK_UP, learner.rank);
    }
  }

  private async checkAchieveDailyStreak(learner: LearnerProfile) {
    const isAchieveDailyStreak = await learner.isAchieveDailyStreakOrCreate();
    if (isAchieveDailyStreak) {
      this.notify(MileStonesEnum.IS_DAILY_STREAK, learner.streak.current);
    }
  }

  async checkProfileChange(learner: LearnerProfile): Promise<void> {
    await Promise.all([this.checkLevelUp(learner), this.checkRankUp(learner), this.checkAchieveDailyStreak(learner)]);
  }

  async checkAfterFinishLesson(
    learner: LearnerProfile,
    xp: number,
    duration: number,
    completedLessonId: number,
    questionTypeId: number
  ) {
    const isBandScoreUp = await learner.isBandScoreQuestionTypeUp(xp, duration, completedLessonId, questionTypeId);
    if (isBandScoreUp) {
      await learner.save();
      this.notify(
        MileStonesEnum.IS_BAND_SCORE_QUESTION_TYPE_UP,
        learner.lessonProcesses.find((lesson) => lesson.questionTypeId === questionTypeId).bandScore
      );
    }
  }
}
