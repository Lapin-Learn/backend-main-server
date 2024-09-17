import { SkillEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, IsUUID } from "class-validator";

export class CreateQuestionTypeDto {
  @ApiProperty({ type: "string", example: "Question type example" })
  @IsString({ message: "Name must be a string" })
  name: string;

  @ApiProperty({ type: "string", enum: SkillEnum, example: SkillEnum.READING })
  @IsEnum(SkillEnum, { message: "Invalid skill" })
  skill: SkillEnum;

  @ApiProperty({ type: "string", example: "00000000-0000-0000-0000-000000000000" })
  @IsUUID(4, { message: "Invalid image id" })
  imageId: string;
}
