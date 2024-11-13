import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsUUID } from "class-validator";

export class AssignQuestionsToLessonDto {
  @ApiProperty({ type: "array", items: { type: "string" }, example: ["00000000-0000-0000-0000-000000000000"] })
  @IsArray({ message: "Questions must be an array of its id" })
  @ArrayNotEmpty({ message: "Question array must not be empty" })
  @IsUUID("4", { each: true, message: "Question ID must be UUID" })
  questions: string[];
}
