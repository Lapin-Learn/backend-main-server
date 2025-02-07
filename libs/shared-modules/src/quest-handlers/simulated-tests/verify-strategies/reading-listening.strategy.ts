import { SkillTestSession } from "@app/database";
import { InfoTextResponseDto } from "@app/types/dtos/simulated-tests";
import { VerifySkillStrategy } from "@app/types/interfaces";
import { plainToInstance } from "class-transformer";

export class VerifyReadingListening implements VerifySkillStrategy {
  private readonly DEFAULT_REQUIRED_ANSWER = 80;

  verify(session: SkillTestSession, requirements?: number): boolean {
    requirements = requirements ?? this.DEFAULT_REQUIRED_ANSWER;
    const responses = plainToInstance(InfoTextResponseDto, session.responses as Array<any>);
    const numberOfAnswers = responses.filter((r) => r.answer != null).length;
    return numberOfAnswers / responses.length >= requirements / 100;
  }
}
