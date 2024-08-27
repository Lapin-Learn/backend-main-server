import { IsNumber } from "class-validator";

export class SetTargetStreak {
  @IsNumber()
  target: number;
}
