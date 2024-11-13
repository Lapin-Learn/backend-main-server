import { ApiProperty } from "@nestjs/swagger";
import { BucketResponseDto } from "../buckets";

export class GetItemsInShopResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({
    description: "Return the popular price of the item",
  })
  popular: string;

  @ApiProperty({
    type: Boolean,
  })
  isPopular: boolean;

  @ApiProperty({
    type: "object",
    additionalProperties: {
      type: "number",
    },
  })
  price: Record<string, number>;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  imageId: string;

  @ApiProperty({
    type: BucketResponseDto,
  })
  image: BucketResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
