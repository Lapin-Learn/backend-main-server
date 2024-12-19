import { Module } from "@nestjs/common";
import { GradingContext } from "./grading.context";
import { ExactStrategy, SuggetStrategy, VariantsStrategy } from "./answer-validator-strategy";

@Module({
  providers: [GradingContext, ExactStrategy, VariantsStrategy, SuggetStrategy],
  exports: [GradingContext],
})
export class GradingModule {}
