import { Injectable } from "@nestjs/common";
import { ILearnerProfile } from "@app/types/interfaces";
import { SimulatedTestQuestHandler } from "./simulated-test.handler";
import { SkillTestSession } from "@app/database";
import { Logger } from "@nestjs/common";
import { SkillEnum } from "@app/types/enums";

@Injectable()
export class CompleteSkillSessionHandler extends SimulatedTestQuestHandler {
  private readonly serviceLogger = new Logger(CompleteSkillSessionHandler.name);
  private currentSessionsOfSkill: number = 0;
  private readonly skill: SkillEnum;

  constructor(skill: SkillEnum) {
    super();
    this.skill = skill;
  }

  async checkQuestCompleted(requirements: number, learner: ILearnerProfile): Promise<void> {
    try {
      const sessions = await SkillTestSession.getSessionsOfSkill(this.skill, learner.id);
      let countValidSession = 0;
      for (const session of sessions) {
        this.setVerifyStrategy(session);
        if (this.verifySession(session, requirements)) {
          countValidSession++;
        }
      }
      this.currentSessionsOfSkill = countValidSession;
      this.setCompletedStatus(countValidSession > 0);
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }

  override async getUpdatedProgress(): Promise<number> {
    return this.currentSessionsOfSkill;
  }
}
