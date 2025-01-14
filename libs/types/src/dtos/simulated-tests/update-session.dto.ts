import { SkillEnum, TestSessionStatusEnum } from "@app/types/enums";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from "class-validator";

class TestSessionResponseDto {
  @IsEnum(SkillEnum)
  skill: SkillEnum;
}

export class InfoSpeakingResponseDto {
  @IsNumber()
  questionNo: number;

  @IsNumber()
  partNo: number;
}

export class InfoTextResponseDto {
  @IsInt()
  questionNo: number;

  @IsOptional()
  answer: string | null;
}

export class TextResponseDto extends TestSessionResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InfoTextResponseDto)
  info: InfoTextResponseDto[];
}

export class SpeakingResponseDto extends TestSessionResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InfoSpeakingResponseDto)
  info: InfoSpeakingResponseDto[];
}

export class UpdateSessionDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  elapsedTime: number;

  @ApiProperty({ enum: TestSessionStatusEnum })
  @IsOptional()
  @IsEnum(TestSessionStatusEnum)
  status: TestSessionStatusEnum;

  @ApiProperty({ type: [TestSessionResponseDto] })
  @IsNotEmpty()
  @Type(() => TestSessionResponseDto, {
    discriminator: {
      property: "skill",
      subTypes: [
        { value: SpeakingResponseDto, name: SkillEnum.SPEAKING },
        { value: TextResponseDto, name: SkillEnum.WRITING },
        { value: TextResponseDto, name: SkillEnum.READING },
        { value: TextResponseDto, name: SkillEnum.LISTENING },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  response: SpeakingResponseDto | TextResponseDto;
}
