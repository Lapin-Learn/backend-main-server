import { CEFRLevelEum, ContentTypeEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class CreateQuestionDto {
  @ApiProperty({ type: "string", enum: ContentTypeEnum, example: ContentTypeEnum.MULTIPLE_CHOICE })
  @IsEnum(ContentTypeEnum, { message: "Invalid content type" })
  contentType: ContentTypeEnum;

  @ApiProperty({ type: "object" })
  @IsNotEmpty({ message: "Content is required" })
  content: object;

  @ApiProperty({ type: "string", nullable: true })
  @IsOptional()
  @IsUUID(4, { message: "Invalid image id" })
  imageId: string | null;

  @ApiProperty({ type: "string", nullable: true })
  @IsOptional()
  @IsUUID(4, { message: "Invalid audio id" })
  audioId: string | null;

  @ApiProperty({ type: "string", enum: CEFRLevelEum, example: CEFRLevelEum.A1 })
  @IsEnum(CERFLevelEum, { message: "Invalid CEFR level" })
  cefrLevel: CEFRLevelEum;

  @ApiProperty({ type: "string", example: "This is an explanation" })
  @IsNotEmpty({ message: "Explanation is required" })
  explanation: string;
}
