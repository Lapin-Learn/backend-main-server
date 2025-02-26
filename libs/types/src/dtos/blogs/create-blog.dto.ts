import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateBlogDto {
  @ApiProperty({
    example: "Example Title",
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: "Example Content",
  })
  @IsString()
  content: string;

  // For Swagger only
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "Upload an image or file for the blog post",
  })
  file: any;
}
