import { SkillEnum } from "@app/types/enums";
import { IBandScoreRange, IGradingStrategy, TestAnswer } from "@app/types/interfaces";
import { bandScoreRangeMap } from "@app/utils/maps";
import { InfoTextResponseDto } from "@app/types/dtos/simulated-tests";
import { plainToInstance } from "class-transformer";

export class RangeGradingStrategy implements IGradingStrategy {
  private ranges: IBandScoreRange[];
  private estimatedBandScore: number;
  private testAnswers: TestAnswer[];
  private userResponses: InfoTextResponseDto[];
  private results: boolean[];
  private DEFAULT_BAND_SCORE = 2.5;

  constructor(testAnswers: TestAnswer[], userResponses: InfoTextResponseDto[], skill: SkillEnum) {
    this.testAnswers = testAnswers;
    this.userResponses = userResponses;
    this.ranges = bandScoreRangeMap.get(skill);
  }

  setRange(skill: SkillEnum) {
    this.ranges = bandScoreRangeMap.get(skill);
  }
  private validateAnswers() {
    const results: boolean[] = [];
    if (this.testAnswers && this.testAnswers.length > 0) {
      this.userResponses.map((r) => {
        const plainAnswer = this.testAnswers[r.questionNo - 1];
        if (plainAnswer) {
          const validator = plainToInstance(TestAnswer, { validation: { ...plainAnswer } });
          results.push(validator.validate(r.answer));
        }
      });
    }
    return results;
  }

  getResults() {
    return this.results;
  }

  evaluateBandScore() {
    this.results = this.validateAnswers();
    const correctAnswer = this.results.filter((value) => value === true).length;
    this.estimatedBandScore =
      this.ranges.find((s) => correctAnswer >= s.min && correctAnswer <= s.max)?.band ?? this.DEFAULT_BAND_SCORE;
    return;
  }

  getEstimatedBandScore() {
    return this.estimatedBandScore;
  }
}
