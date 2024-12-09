import { ApiProperty } from "@nestjs/swagger";

export class PaginationResponseDto<T> {
  items: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  page: number;
}
