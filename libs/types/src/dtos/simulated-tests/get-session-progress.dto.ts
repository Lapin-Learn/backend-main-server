import { SkillEnum } from "@app/types/enums";
import { IsValidDateRange } from "@app/utils/decorators";
import { Expose, Transform } from "class-transformer";
import { IsDate, IsEnum, IsOptional, ValidateIf } from "class-validator";

export class GetSessionProgressDto {
  @IsEnum(SkillEnum)
  skill: SkillEnum;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsDate()
  from: Date;

  @IsOptional()
  @Expose()
  @Transform(({ value, obj }) => {
    if (!value && obj.from) {
      const toDate = new Date(obj.from);
      toDate.setMonth(toDate.getMonth() + 3);
      return toDate;
    }

    return value && new Date(value);
  })
  @ValidateIf((value) => value !== undefined)
  @IsDate()
  to: Date;

  @IsValidDateRange()
  dateRange: boolean;
}
