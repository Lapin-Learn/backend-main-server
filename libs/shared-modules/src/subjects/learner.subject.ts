import { Injectable } from "@nestjs/common";
import { LearnerProfile, Lesson, LessonProcess } from "@app/database";
import { MileStonesEnum } from "@app/types/enums";
import { MileStonesObserver } from "../observers";
import { NextBandScoreMap } from "@app/utils/maps";
import { REQUIRE_CORRECT_PERCENTAGE } from "@app/types/constants";

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

  async checkDoneJumpBandTest(learner: LearnerProfile, correctPercentage: number, currentLesson: Lesson) {
    if (correctPercentage >= REQUIRE_CORRECT_PERCENTAGE) {
      const questionTypeProcess = await LessonProcess.findOne({
        where: { learnerProfileId: learner.id, questionTypeId: currentLesson.questionTypeId },
      });
      const nextBandScore = NextBandScoreMap.get(currentLesson.bandScore);
      if (nextBandScore) {
        if (questionTypeProcess) {
          questionTypeProcess.bandScore = nextBandScore;
          questionTypeProcess.currentLessonId = currentLesson.id;
          await questionTypeProcess.save();
        } else {
          await LessonProcess.create({
            learnerProfileId: learner.id,
            bandScore: nextBandScore,
            questionTypeId: currentLesson.questionTypeId,
            currentLessonId: currentLesson.id,
            xp: [],
          }).save();
        }
        this.notify(MileStonesEnum.IS_BAND_SCORE_QUESTION_TYPE_UP, nextBandScore);
        return;
      }
    }
    return;
  }
}
