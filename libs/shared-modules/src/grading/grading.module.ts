import { Module } from "@nestjs/common";
import { GradingContext } from "./grading.context";
import { ExactStrategy, SuggestStrategy, VariantStrategy } from "./answer-validator-strategy";
import { AIGradingStrategy, RangeGradingStrategy } from "./grading-strategy";

@Module({
  providers: [GradingContext, ExactStrategy, VariantStrategy, SuggestStrategy, RangeGradingStrategy, AIGradingStrategy],
  exports: [GradingContext],
})
export class GradingModule {}
