import { SkillTestSession } from "@app/database";
import { InfoTextResponseDto } from "@app/types/dtos/simulated-tests";
import { VerifySkillStrategy } from "@app/types/interfaces";
import { plainToInstance } from "class-transformer";

export class VerifyReadingListening implements VerifySkillStrategy {
  private readonly REQUIRED_ANSWER = 0.8;

  verifiy(session: SkillTestSession): boolean {
    const responses = plainToInstance(InfoTextResponseDto, session.responses as Array<any>);
    const numberOfAnswers = responses.filter((r) => r.answer != null).length;
    return numberOfAnswers / responses.length >= this.REQUIRED_ANSWER;
  }
}
