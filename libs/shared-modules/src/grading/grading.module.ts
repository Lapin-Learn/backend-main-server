import { Module } from "@nestjs/common";
import { GradingContext } from "./grading.context";

@Module({
  providers: [GradingContext],
  exports: [GradingContext],
})
export class GradingModule {}
