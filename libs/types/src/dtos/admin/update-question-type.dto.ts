import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateQuestionTypeDto } from "./create-question-type.dto";
import { ArrayNotEmpty, IsEnum, IsInt, IsOptional, Min, ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BandScoreEnum } from "@app/types/enums";

class ReorderLessonDto {
  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  @Min(1, { message: "Lesson ID must be positive" })
  lessonId: number;

  @ApiProperty({ type: Number, example: 1 })
  @IsInt()
  @Min(1, { message: "Order must be positive" })
  order: number;
}

export class UpdateQuestionTypeDto extends PartialType(CreateQuestionTypeDto) {
  @ApiProperty({ type: [ReorderLessonDto] })
  @IsOptional()
  @ArrayNotEmpty({ message: "Reorder lessons must not be empty" })
  @ValidateNested({ each: true })
  @Type(() => ReorderLessonDto)
  reorderLessons: ReorderLessonDto[];

  @ApiProperty({ type: "string", enum: BandScoreEnum, example: "5.0", nullable: true })
  @ValidateIf((dto) => dto.bandScore || (dto.reorderLessons && dto.reorderLessons.length > 0))
  @IsEnum(BandScoreEnum, { message: "Invalid band score" })
  bandScore: BandScoreEnum;
}
