import { IGradingStrategy } from "@app/types/interfaces";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GradingContext {
  private strategy: IGradingStrategy;

  setGradingStrategy(strategy: IGradingStrategy) {
    this.strategy = strategy;
  }

  getResults() {
    if (!this.strategy) return null;
    return this.strategy.getResults();
  }

  evaluateBandScore() {
    if (!this.strategy) return;
    this.strategy.evaluateBandScore();
  }

  getEstimatedScore() {
    if (!this.strategy) return null;
    return this.strategy.getEstimatedBandScore();
  }
}
