import { SkillEnum } from "@app/types/enums";
import { IsEnum, IsNumber } from "class-validator";

export class CreateSkillTestDto {
  @IsNumber()
  testId: number;

  @IsEnum(SkillEnum)
  skill: SkillEnum;
}
