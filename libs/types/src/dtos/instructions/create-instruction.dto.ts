import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateInstructionDto {
  @IsString({ message: "Content must be a string" })
  @ApiProperty({ type: String, example: "Instruction content" })
  content: string;

  @IsInt({ message: "Order must be an integer" })
  @Min(1, { message: "Order must be positive" })
  @ApiProperty({ type: Number, example: 1 })
  order: number;

  @IsOptional()
  @IsUUID(4, { message: "Image ID must be UUID" })
  @ApiProperty({ type: String, example: "00000000-0000-0000-0000-000000000000" })
  imageId: string;

  @IsOptional()
  @IsUUID(4, { message: "Audio ID must be UUID" })
  @ApiProperty({ type: String, example: "00000000-0000-0000-0000-000000000000" })
  audioId: string;

  @IsInt({ message: "Question type ID must be an integer" })
  @Min(1, { message: "Question type ID must be positive" })
  @ApiProperty({ type: Number, example: 1 })
  questionTypeId: number;
}
