import { SkillTestSession } from "@app/database";
import { InfoTextResponseDto } from "@app/types/dtos/simulated-tests";
import { VerifySkillStrategy } from "@app/types/interfaces";
import { plainToInstance } from "class-transformer";

export class VerifySpeaking implements VerifySkillStrategy {
  verify(session: SkillTestSession, requirements?: number): boolean {
    const responses = plainToInstance(InfoTextResponseDto, session.responses as Array<any>);
    const { partsDetail } = session.skillTest;
    if (partsDetail) {
      if (!requirements) {
        requirements = partsDetail[partsDetail.length - 1].endQuestionIndex;
      }
      const numberOfQuestions = requirements;
      return responses.length >= numberOfQuestions;
    }
    return false;
  }
}
