import { SkillTestSession } from "@app/database";
import { QuestHandler } from "@app/types/abstracts";
import { SkillEnum } from "@app/types/enums";
import { ILearnerProfile } from "@app/types/interfaces";
import { VerifyReadingListening, VerifyWriting, VerifySpeaking } from "./verify-strategies";
import { VerifyContext } from "./verify-strategies/verify.context";

export abstract class SimulatedTestQuestHandler extends QuestHandler {
  private readonly verifyContext: VerifyContext;

  constructor() {
    super();
    this.verifyContext = new VerifyContext();
  }

  abstract checkQuestCompleted(requirements: number, learner: ILearnerProfile): Promise<void>;

  setVerifyStrategy(session: SkillTestSession) {
    const { skill } = session.skillTest;
    if (skill === SkillEnum.SPEAKING) {
      this.verifyContext.setStrategy(new VerifySpeaking());
    } else if (skill === SkillEnum.WRITING) {
      this.verifyContext.setStrategy(new VerifyWriting());
    } else {
      this.verifyContext.setStrategy(new VerifyReadingListening());
    }
  }

  verifySession(session: SkillTestSession, requirements?: number): boolean {
    return session ? this.verifyContext.verify(session, requirements) : false;
  }

  filterSessions(sessions: SkillTestSession[]): SkillTestSession[] {
    return sessions.filter((session) => {
      this.setVerifyStrategy(session);
      return this.verifySession(session);
    });
  }
}
