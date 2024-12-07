import { ApiProperty } from "@nestjs/swagger";

export class SimulatedIeltsTestDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  collectionId: number;

  @ApiProperty()
  order: string;

  @ApiProperty()
  testName: string;
}
