import { ValidationArguments, ValidatorConstraintInterface, ValidatorConstraint } from "class-validator";

@ValidatorConstraint({ name: "DatesValidation", async: false })
export class DatesValiadationContraints implements ValidatorConstraintInterface {
  private message: string = "The destionation date can not be smaller than the start date";
  validate(_: any, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
    const { from, to } = validationArguments.object as any;

    if (to && !from) {
      this.setMessage("Required start date for the destination date");
      return false;
    }

    if (from && to) {
      return to > from;
    }

    return true;
  }

  setMessage(message: string) {
    this.message = message;
  }

  defaultMessage(): string {
    return this.message;
  }
}
