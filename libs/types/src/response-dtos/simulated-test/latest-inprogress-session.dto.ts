import { ApiProperty } from "@nestjs/swagger";
import { SkillEnum, TestSessionStatusEnum } from "@app/types/enums";

export class LatestInprogressSessionDto {
  @ApiProperty()
  sessionId: number;

  @ApiProperty()
  mode: string;

  @ApiProperty({ enum: TestSessionStatusEnum })
  status: TestSessionStatusEnum;

  @ApiProperty({ isArray: true, type: Number })
  parts: number[];

  @ApiProperty()
  skillTestId: number;

  @ApiProperty({ enum: SkillEnum })
  skill: SkillEnum;

  @ApiProperty()
  testName: string;

  @ApiProperty()
  testCollectionName: string;
}
