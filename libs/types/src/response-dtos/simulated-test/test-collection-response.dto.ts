import { ISimulatedIeltsTest } from "@app/types/interfaces";
import { ApiProperty } from "@nestjs/swagger";
import { SimulatedIeltsTestDto } from "./simulated-ielts-test-response.dto";

export class TestCollectionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ isArray: true, type: String })
  tags: string[];

  @ApiProperty({ isArray: true, type: SimulatedIeltsTestDto })
  simulatedIeltsTest: ISimulatedIeltsTest[];

  @ApiProperty()
  thumbnail: string;
}
