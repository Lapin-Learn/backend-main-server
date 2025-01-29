import { SkillTestSession } from "@app/database";
import { InfoTextResponseDto } from "@app/types/dtos/simulated-tests";
import { VerifySkillStrategy } from "@app/types/interfaces";
import { plainToInstance } from "class-transformer";

export class VerifyWriting implements VerifySkillStrategy {
  private readonly DEFAULT_REQUIRED_WORDS = 100;

  verify(session: SkillTestSession, requirements?: number): boolean {
    requirements = requirements ?? this.DEFAULT_REQUIRED_WORDS;
    const responses = plainToInstance(InfoTextResponseDto, session.responses as Array<any>);
    let count = 0;
    for (const part of responses) {
      const cleanedText = part.answer.replace(/<\/?[^>]+(>|$)/g, " ");
      const words = cleanedText.trim().split(/\s+/);
      if (words.length > requirements) {
        console.log("count: ", words.length);
        return true;
      } else {
        count += words.length;
      }
    }
    return count >= requirements;
  }
}
