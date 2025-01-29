import { QuestHandler } from "@app/types/abstracts";
import { MissionCategoryNameEnum, SkillEnum } from "@app/types/enums";
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

export class MissionContainer {
  private static readonly handlers: Map<MissionCategoryNameEnum, QuestHandler> = new Map();

  static init() {
    this.register(MissionCategoryNameEnum.COMPLETE_LESSON_WITH_PERCENTAGE_SCORE, new PercentageScoreHandler());
    this.register(MissionCategoryNameEnum.TOTAL_DURATION_OF_LEARN_DAILY_LESSON, new RequiredDurationHandler());
    this.register(MissionCategoryNameEnum.COMPLETE_LESSON_WITH_DIFFERENT_SKILLS, new DistinctSkillsHandler());
    this.register(MissionCategoryNameEnum.EXCEED_LEARNING_STREAK_WITHOUT_BREAK, new ExceedLearningStreak());
    this.register(
      MissionCategoryNameEnum.COMPLETE_SPEAKING_SESSION,
      new CompleteSkillSessionHandler(SkillEnum.SPEAKING)
    );
    this.register(
      MissionCategoryNameEnum.COMPLETE_LISTENING_SESSION,
      new CompleteSkillSessionHandler(SkillEnum.LISTENING)
    );
    this.register(MissionCategoryNameEnum.COMPLETE_READING_SESSION, new CompleteSkillSessionHandler(SkillEnum.READING));
    this.register(MissionCategoryNameEnum.COMPLETE_WRITING_SESSION, new CompleteSkillSessionHandler(SkillEnum.WRITING));
    this.register(MissionCategoryNameEnum.COMPLETE_DISTINCT_SKILL_SESSION, new CompleteDistinctedSkillsHandler());
    this.register(
      MissionCategoryNameEnum.COMPLETE_DISTINCT_SKILL_TEST_SESSION,
      new CompleteDistinctSkillTestsHandler()
    );
  }

  static register(category: MissionCategoryNameEnum, handler: QuestHandler) {
    this.handlers.set(category, handler);
  }

  static resolve(category: MissionCategoryNameEnum): QuestHandler {
    const handler = this.handlers.get(category);
    if (!handler) throw new Error("Invalid category name");
    return handler;
  }
}
