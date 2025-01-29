import { SkillTestSession } from "@app/database";

export interface VerifySkillStrategy {
  verify(session: SkillTestSession, requirements?: number): boolean;
}
