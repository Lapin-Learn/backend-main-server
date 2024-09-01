import { SkillEnum } from "@app/types/enums";
import { IsEnum, ValidateIf } from "class-validator";
import * as _ from "lodash";

export class QueryQuestionTypesDto {
  @ValidateIf((object, value) => !_.isNil(value))
  @IsEnum(SkillEnum, { message: "Invalid skill value" })
  skill: SkillEnum;
}
