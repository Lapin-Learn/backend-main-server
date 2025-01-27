import { SkillTestSession } from "@app/database";
import { QuestHandler } from "@app/types/abstracts";
import { InfoSpeakingResponseDto, InfoTextResponseDto } from "@app/types/dtos/simulated-tests";
import { SkillEnum } from "@app/types/enums";
import { ILearnerProfile } from "@app/types/interfaces";
import { Logger } from "@nestjs/common";
import { plainToInstance } from "class-transformer";

export interface VerifyStrategy {
  verifiy(session: SkillTestSession): boolean;
}

export class ReadingListeningVerify implements VerifyStrategy {
  private readonly REQUIRED_ANSWER = 0.8;
  verifiy(session: SkillTestSession): boolean {
    const responses = plainToInstance(InfoTextResponseDto, session.responses as Array<any>);
    const numberOfAnswers = responses.filter((r) => r.answer != null).length;
    return numberOfAnswers / responses.length >= this.REQUIRED_ANSWER;
  }
}

export class WritingStrategy implements VerifyStrategy {
  private readonly REQUIRED_WORDS = 100;
  verifiy(session: SkillTestSession): boolean {
    const responses = plainToInstance(InfoTextResponseDto, session.responses as Array<any>);
    let count = 0;
    for (const part of responses) {
      const cleanedText = part.answer.replace(/<\/?[^>]+(>|$)/g, " ");
      const words = cleanedText.trim().split(/\s+/);
      if (words.length > this.REQUIRED_WORDS) {
        return true;
      } else {
        count += words.length;
      }
    }
    return count >= this.REQUIRED_WORDS;
  }
}

export class SpeakingStrategy implements VerifyStrategy {
  verifiy(session: SkillTestSession): boolean {
    const responses = plainToInstance(InfoSpeakingResponseDto, session.responses as Array<any>);
    const { partsDetail } = session.skillTest;
    const numberOfQuestions = partsDetail[partsDetail.length - 1].endQuestionIndex;
    return responses.length == numberOfQuestions;
  }
}

export class CompleteASessionHandler extends QuestHandler {
  private strategy: VerifyStrategy;
  private readonly serviceLogger = new Logger(CompleteASessionHandler.name);

  async checkQuestCompleted(_: number, learner: ILearnerProfile): Promise<void> {
    try {
      const session = await SkillTestSession.getAFinishedSessionCurrentDate(learner.id);
      session ?? this.setCompletedStatus(this.verifySession(session));
    } catch (error) {
      this.serviceLogger.error(error);
      throw error;
    }
  }

  setHandlerLogic(session: SkillTestSession) {
    const { skill } = session.skillTest;
    if (skill === SkillEnum.SPEAKING) {
      this.setStrategy(new SpeakingStrategy());
    } else if (skill === SkillEnum.WRITING) {
      this.setStrategy(new WritingStrategy());
    } else {
      this.setStrategy(new ReadingListeningVerify());
    }
  }

  setStrategy(strategy: VerifyStrategy) {
    this.strategy = strategy;
  }

  verifySession(session: SkillTestSession): boolean {
    return session ? this.strategy.verifiy(session) : false;
  }
}
