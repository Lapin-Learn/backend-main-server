import { Provider, Module } from "@nestjs/common";
import {
  DistinctSkillsHandler,
  ExceedLearningStreak,
  PercentageScoreHandler,
  RequiredDurationHandler,
} from "./daily-lessons";
import {
  CompleteDistinctedSkillsHandler,
  CompleteDistinctSkillTestsHandler,
  CompleteSkillSessionHandler,
} from "./simulated-tests";
import { MissionCategoryNameEnum, SkillEnum } from "@app/types/enums";
import { QuestHandler } from "@app/types/abstracts";
import { QuestHandlerContainer } from "./quest-handler.container";
import {
  COMPLETE_LISTENING_SESSION_PROVIDER,
  COMPLETE_READING_SESSION_PROVIDER,
  COMPLETE_SPEAKING_SESSION_PROVIDER,
  COMPLETE_WRITING_SESSION_PROVIDER,
  EXCEED_LEARNING_STREAK_PROVIDER,
  EXCEED_LEARNING_STREAK_WITHOUT_BREAK_PROVIDER,
  QUEST_HANDLERS_MAP,
} from "@app/types/constants";

const ExceedLearningStreakProvider: Provider = {
  provide: EXCEED_LEARNING_STREAK_PROVIDER,
  useFactory: () => new ExceedLearningStreak(true),
};

const ExceedLearningStreakWithoutBreakProvider: Provider = {
  provide: EXCEED_LEARNING_STREAK_WITHOUT_BREAK_PROVIDER,
  useFactory: () => new ExceedLearningStreak(false),
};

const CompleteSpeakingSessionProvider: Provider = {
  provide: COMPLETE_SPEAKING_SESSION_PROVIDER,
  useFactory: () => new CompleteSkillSessionHandler(SkillEnum.SPEAKING),
};

const CompleteListeningSessionProvider: Provider = {
  provide: COMPLETE_LISTENING_SESSION_PROVIDER,
  useFactory: () => new CompleteSkillSessionHandler(SkillEnum.LISTENING),
};

const CompleteReadingSessionProvider: Provider = {
  provide: COMPLETE_READING_SESSION_PROVIDER,
  useFactory: () => new CompleteSkillSessionHandler(SkillEnum.READING),
};

const CompleteWritingSessionProvider: Provider = {
  provide: COMPLETE_WRITING_SESSION_PROVIDER,
  useFactory: () => new CompleteSkillSessionHandler(SkillEnum.WRITING),
};

export const QuestHandlerProvider: Provider = {
  provide: QUEST_HANDLERS_MAP,
  useFactory: (
    percentageScoreHandler: PercentageScoreHandler,
    requiredDurationHandler: RequiredDurationHandler,
    distinctSkillsHandler: DistinctSkillsHandler,
    exceedLearningStreak: ExceedLearningStreak,
    exceedLearningStreakWithoutBreak: ExceedLearningStreak,
    completeSpeakingSession: CompleteSkillSessionHandler,
    completeListeningSession: CompleteSkillSessionHandler,
    completeReadingSession: CompleteSkillSessionHandler,
    completeWritingSession: CompleteSkillSessionHandler,
    completeDistinctedSkillsHandler: CompleteDistinctedSkillsHandler,
    completeDistinctSkillTestsHandler: CompleteDistinctSkillTestsHandler
  ) => {
    const handlers = new Map<MissionCategoryNameEnum, QuestHandler>();
    handlers.set(MissionCategoryNameEnum.COMPLETE_LESSON_WITH_PERCENTAGE_SCORE, percentageScoreHandler);
    handlers.set(MissionCategoryNameEnum.TOTAL_DURATION_OF_LEARN_DAILY_LESSON, requiredDurationHandler);
    handlers.set(MissionCategoryNameEnum.COMPLETE_LESSON_WITH_DIFFERENT_SKILLS, distinctSkillsHandler);
    handlers.set(MissionCategoryNameEnum.EXCEED_LEARNING_STREAK, exceedLearningStreak);
    handlers.set(MissionCategoryNameEnum.EXCEED_LEARNING_STREAK_WITHOUT_BREAK, exceedLearningStreakWithoutBreak);
    handlers.set(MissionCategoryNameEnum.COMPLETE_SPEAKING_SESSION, completeSpeakingSession);
    handlers.set(MissionCategoryNameEnum.COMPLETE_LISTENING_SESSION, completeListeningSession);
    handlers.set(MissionCategoryNameEnum.COMPLETE_READING_SESSION, completeReadingSession);
    handlers.set(MissionCategoryNameEnum.COMPLETE_WRITING_SESSION, completeWritingSession);
    handlers.set(MissionCategoryNameEnum.COMPLETE_DISTINCT_SKILL_SESSION, completeDistinctedSkillsHandler);
    handlers.set(MissionCategoryNameEnum.COMPLETE_DISTINCT_SKILL_TEST_SESSION, completeDistinctSkillTestsHandler);
    return handlers;
  },
  inject: [
    PercentageScoreHandler,
    RequiredDurationHandler,
    DistinctSkillsHandler,
    EXCEED_LEARNING_STREAK_PROVIDER,
    EXCEED_LEARNING_STREAK_WITHOUT_BREAK_PROVIDER,
    COMPLETE_SPEAKING_SESSION_PROVIDER,
    COMPLETE_LISTENING_SESSION_PROVIDER,
    COMPLETE_READING_SESSION_PROVIDER,
    COMPLETE_WRITING_SESSION_PROVIDER,
    CompleteDistinctedSkillsHandler,
    CompleteDistinctSkillTestsHandler,
  ],
};

@Module({
  providers: [
    QuestHandlerProvider,
    QuestHandlerContainer,
    PercentageScoreHandler,
    RequiredDurationHandler,
    DistinctSkillsHandler,
    ExceedLearningStreakProvider,
    ExceedLearningStreakWithoutBreakProvider,
    CompleteDistinctedSkillsHandler,
    CompleteDistinctSkillTestsHandler,
    CompleteSpeakingSessionProvider,
    CompleteListeningSessionProvider,
    CompleteReadingSessionProvider,
    CompleteWritingSessionProvider,
  ],
  exports: [QuestHandlerContainer],
})
export class QuestHandlerModule {}
