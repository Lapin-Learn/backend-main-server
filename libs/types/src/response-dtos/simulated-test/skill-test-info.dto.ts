import { SkillEnum, TestSessionStatusEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";

export class PartDetailDto {
  @ApiProperty({ isArray: true, type: String })
  questionTypes: string[];
}

export class SkillTestInfo {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: SkillEnum })
  skill: SkillEnum;

  @ApiProperty({ type: PartDetailDto, isArray: true })
  partsDetail: PartDetailDto;

  @ApiProperty({ type: Number, nullable: true })
  estimatedBandScore: number;

  @ApiProperty({ enum: TestSessionStatusEnum })
  status: TestSessionStatusEnum;
}
