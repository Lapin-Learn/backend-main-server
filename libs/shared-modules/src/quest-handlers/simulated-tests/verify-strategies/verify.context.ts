import { SkillTestSession } from "@app/database";
import { VerifySkillStrategy } from "@app/types/interfaces";

export class VerifyContext {
  private strategy: VerifySkillStrategy;

  setStrategy(strategy: VerifySkillStrategy) {
    this.strategy = strategy;
  }

  verify(session: SkillTestSession): boolean {
    return this.strategy.verifiy(session);
  }
}
