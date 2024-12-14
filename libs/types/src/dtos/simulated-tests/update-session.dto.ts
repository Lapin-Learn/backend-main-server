import { TestSessionStatusEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsEnum, IsInt, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";

class TestSessionResponseDto {
  @ApiProperty()
  @IsInt()
  questionNo: number;

  @ApiProperty({ nullable: true })
  @IsString()
  @ValidateIf((_, value) => value != null)
  answer: string | null;
}

export class UpdateSessionDto {
  @ApiProperty()
  @IsOptional()
  @IsInt()
  elapsedTime: number;

  @ApiProperty({ enum: TestSessionStatusEnum })
  @IsOptional()
  @IsEnum(TestSessionStatusEnum)
  status: TestSessionStatusEnum;

  @ApiProperty({ type: [TestSessionResponseDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TestSessionResponseDto)
  @ArrayNotEmpty()
  responses: TestSessionResponseDto[];
}
