import { CEFRLevelEum, ContentTypeEnum } from "@app/types/enums";
import { IsEnum, IsNumber, IsOptional, Min } from "class-validator";

export class QueryParamQuestionDto {
  @IsOptional()
  @IsEnum(ContentTypeEnum, { each: true })
  listContentTypes: ContentTypeEnum[];

  @IsOptional()
  @IsEnum(CEFRLevelEum)
  cerfLevel: CEFRLevelEum;

  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: "Offset must be a number" })
  @Min(0, { message: "Offset must be greater than or equal to 0" })
  offset: number;

  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: "Limit must be a number" })
  @Min(1, { message: "Limit must be greater than or equal to 1" })
  limit: number;
}
