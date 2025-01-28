import { ILearnerProfile } from "@app/types/interfaces";
import { SimulatedTestQuestHandler } from "./simulated-test.handler";
import { SkillTestSession } from "@app/database";
import { Logger } from "@nestjs/common";

export class CompleteASessionHandler extends SimulatedTestQuestHandler {
  private readonly serviceLogger = new Logger(CompleteASessionHandler.name);

  constructor() {
    super();
  }

  async checkQuestCompleted(_: number, learner: ILearnerProfile): Promise<void> {
    try {
      const session = await SkillTestSession.getAFinishedSessionCurrentDate(learner.id);
      this.setVerifyStrategy(session);
      this.setCompletedStatus(this.verifySession(session));
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }
}
