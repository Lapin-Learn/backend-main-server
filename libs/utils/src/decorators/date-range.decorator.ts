import { registerDecorator, ValidationOptions } from "class-validator";
import { DatesValiadationContraints } from "../validators";

export function IsValidDateRange(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: DatesValiadationContraints,
    });
  };
}
