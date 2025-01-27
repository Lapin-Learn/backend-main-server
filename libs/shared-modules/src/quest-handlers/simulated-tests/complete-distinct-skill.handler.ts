import { SkillTestSession } from "@app/database";
import { ILearnerProfile } from "@app/types/interfaces";
import { CompleteASessionHandler } from "./complete-a-skill-test.handler";

export class CompleteDistinctedSessionSkillHanlder extends CompleteASessionHandler {
  private currentDistinctSkillSession: number = 0;
  async checkQuestCompleted(_: number, learner: ILearnerProfile): Promise<void> {
    let sessions = await SkillTestSession.getListFinishedSessionsCurrentDate(learner.id);
    sessions = sessions.filter((session) => {
      this.setHandlerLogic(session);
      return this.verifySession(session);
    });
    this.currentDistinctSkillSession = sessions.length;
    this.setCompletedStatus(sessions.length > 0);
  }

  override async getUpdatedProgress(): Promise<number> {
    return this.currentDistinctSkillSession;
  }
}
