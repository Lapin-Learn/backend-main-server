import { SkillTestSession } from "@app/database";

export interface VerifySkillStrategy {
  verifiy(session: SkillTestSession): boolean;
}
