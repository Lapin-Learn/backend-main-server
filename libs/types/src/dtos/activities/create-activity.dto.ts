import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, ArrayNotEmpty, IsInt, ValidateNested } from "class-validator";

export class CreateActivityDto {
  @ArrayNotEmpty({ message: "actionIds array must not be empty" })
  @ArrayMinSize(1, { message: "actionIds array must contain at least one element" })
  @ValidateNested({ each: true })
  @Type(() => Number)
  @IsInt({ each: true, message: "Each actionId must be an integer" })
  @ApiProperty({
    example: [1, 2, 3],
  })
  actionIds: number[];
}
