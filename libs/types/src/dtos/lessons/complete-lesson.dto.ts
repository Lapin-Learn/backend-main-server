import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, Min } from "class-validator";

export class CompleteLessonDto {
  @IsInt({ message: "Lesson ID must be an integer" })
  @Min(1, { message: "Lesson ID must be positive" })
  @ApiProperty({
    example: 1,
  })
  lessonId: number;

  @IsInt({ message: "Correct answers must be an integer" })
  @Min(0, { message: "Correct answers must be greater than or equal to 0" })
  @ApiProperty({
    example: 5,
  })
  correctAnswers: number;

  @IsInt({ message: "Wrong answers must be an integer" })
  @Min(0, { message: "Wrong answers must be greater than or equal to 0" })
  @ApiProperty({
    example: 5,
  })
  wrongAnswers: number;

  @IsInt({ message: "Duration must be an integer" })
  @Min(0, { message: "Duration must be greater than or equal to 0" })
  @ApiProperty({
    example: 60,
  })
  duration: number; // in seconds

  @IsOptional()
  @IsBoolean({ message: "Jump band process must be boolean" })
  isJumpBand: boolean = false;
}
