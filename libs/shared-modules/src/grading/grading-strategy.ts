import { SkillEnum } from "@app/types/enums";
import { IBandScoreRange, IGradingStrategy } from "@app/types/interfaces";
import { bandScoreRangeMap } from "@app/utils/maps";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RangeGradingStrategy implements IGradingStrategy {
  ranges: IBandScoreRange[];

  setRange(skill: SkillEnum): void {
    this.ranges = bandScoreRangeMap.get(skill);
  }
  evaluateBandScore(input: boolean[]): number {
    const correctAnswer = input.filter((value) => value === true).length;
    let left = 0;
    let right = this.ranges.length - 1;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const { min, max, band } = this.ranges[mid];

      if (correctAnswer >= min && correctAnswer <= max) {
        return band;
      } else if (correctAnswer < min) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return 2.5;
  }
}

@Injectable()
export class AIGradingStrategy implements IGradingStrategy {
  ranges: IBandScoreRange[];

  setRange(skill: SkillEnum): void {
    this.ranges = bandScoreRangeMap.get(skill);
  }
  evaluateBandScore(input: string[]) {
    console.log(`AI will evaluate band score for your answer, which is: ${input}`);
    return null;
  }
}
