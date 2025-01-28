import { SkillTestSession } from "@app/database";
import { InfoTextResponseDto } from "@app/types/dtos/simulated-tests";
import { VerifySkillStrategy } from "@app/types/interfaces";
import { plainToInstance } from "class-transformer";

export class VerifyWriting implements VerifySkillStrategy {
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
