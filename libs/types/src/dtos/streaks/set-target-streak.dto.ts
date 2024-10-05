import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class SetTargetStreak {
  @IsNumber()
  @ApiProperty({ type: Number, example: 5 })
  target: number;
}
