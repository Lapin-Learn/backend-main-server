import { PartialType } from "@nestjs/mapped-types";
import { CreateLessonDto } from "./create-lesson.dto";
import { ApiProperty } from "@nestjs/swagger";
import { BandScoreEnum } from "@app/types/enums";

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  @ApiProperty({ type: "string", example: "Lesson 1", required: false })
  name?: string;

  @ApiProperty({ type: "string", enum: BandScoreEnum, required: false })
  bandScore?: BandScoreEnum;

  @ApiProperty({ type: "number", required: false })
  questionTypeId?: number;
}
