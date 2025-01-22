import { SpeakingEvaluation, WritingEvaluation } from "../dtos/simulated-tests";

export interface IGradingStrategy {
  evaluateBandScore(): void;
  getResults(): boolean[] | SpeakingEvaluation[] | WritingEvaluation[] | null;
  getEstimatedBandScore(): number;
}
