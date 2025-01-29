import { SkillTestSession } from "@app/database";
import { VerifySkillStrategy } from "@app/types/interfaces";

export class VerifyContext {
  private strategy: VerifySkillStrategy;

  setStrategy(strategy: VerifySkillStrategy) {
    this.strategy = strategy;
  }

  verify(session: SkillTestSession, requirements?: number): boolean {
    return this.strategy.verify(session, requirements);
  }
}
