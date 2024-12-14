import { IsInt, IsOptional } from "class-validator";

export class UpdateResourcesDto {
  @IsOptional()
  @IsInt()
  bonusXP?: number;

  @IsOptional()
  @IsInt()
  bonusCarrot?: number;
}
