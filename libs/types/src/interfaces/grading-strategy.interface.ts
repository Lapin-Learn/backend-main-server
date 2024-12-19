import { SkillEnum } from "../enums";
import { IBandScoreRange } from "./band-score-range.interface";

export interface IGradingStrategy {
  ranges: IBandScoreRange[];
  setRange(skill: SkillEnum): void;
  evaluateBandScore(input: boolean[] | string[]): number;
}
