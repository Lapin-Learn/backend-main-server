import { BandScoreEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";

export class CreateLessonDto {
  @ApiProperty({ type: "string", example: "Lesson 1" })
  @IsNotEmpty({ message: "Name is required" })
  name: string;

  @ApiProperty({ type: "string", enum: BandScoreEnum, example: BandScoreEnum.BAND_4_5 })
  @IsEnum(BandScoreEnum, { message: "Invalid band score" })
  bandScore: BandScoreEnum;

  @ApiProperty({ type: "number", example: 1 })
  @IsNumber({ allowInfinity: false, allowNaN: false }, { message: "Invalid question type id" })
  questionTypeId: number;
}
