import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateQuestionTypeDto } from "./create-question-type.dto";
import { ArrayNotEmpty, IsInt, IsOptional, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class ReoderLessonDto {
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
  @ApiProperty({ type: [ReoderLessonDto] })
  @IsOptional()
  @ArrayNotEmpty({ message: "Reorder lessons must not be empty" })
  @ValidateNested({ each: true })
  @Type(() => ReoderLessonDto)
  reorderLessons: ReoderLessonDto[];
}
