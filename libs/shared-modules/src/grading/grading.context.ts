import { IGradingStrategy } from "@app/types/interfaces";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GradingContext {
  private strategy: IGradingStrategy;

  setGradingStrategy(strategy: IGradingStrategy) {
    this.strategy = strategy;
  }

  getResults() {
    return this.strategy.getResults();
  }

  evaluateBandScore() {
    this.strategy.evaluateBandScore();
  }

  getEstimatedScore() {
    return this.strategy.getEstimatedBandScore();
  }
}
