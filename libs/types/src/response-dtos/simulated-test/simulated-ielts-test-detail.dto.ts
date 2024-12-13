import { ApiProperty } from "@nestjs/swagger";
import { SkillTestInfo } from "./skill-test-info.dto";

export class SimulatedIeltsTestDetailDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  testName: string;

  @ApiProperty()
  order: string;

  @ApiProperty({ type: SkillTestInfo, isArray: true })
  skillTests: SkillTestInfo[];
}
