import { TestSessionModeEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsNumber } from "class-validator";

export class StartSessionDto {
  @ApiProperty()
  @IsNotEmpty({ message: "Skill test id is required" })
  @IsNumber()
  skillTestId: number;

  @ApiProperty({ enum: TestSessionModeEnum })
  @IsEnum(TestSessionModeEnum, { message: "Invalid test mode" })
  mode: TestSessionModeEnum;

  @ApiProperty({ isArray: true, type: Number })
  @IsNotEmpty({ message: "Parts data is required" })
  @IsArray({ message: "Parts data must be in array" })
  @Type(() => Number)
  parts: number[];
}
