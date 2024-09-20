import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseListStringEnumPipe implements PipeTransform {
  constructor(
    private readonly enumType: object,
    private readonly separator: string
  ) {}

  transform(value: any) {
    const values = value.split(this.separator);

    if (values.length === 0) {
      throw new BadRequestException("Invalid value");
    }

    return values.map((item: string) => {
      if (!Object.values(this.enumType).includes(item)) {
        throw new BadRequestException(`Invalid value: ${item}`);
      }
      return item;
    });
  }
}
