import { Type } from "class-transformer";
import { AnswerTypeEnum } from "../enums";
import _ from "lodash";

export abstract class TestAnswerValidation {
  type: AnswerTypeEnum;

  abstract validate(input: string): boolean;
}

export class ExactValidation extends TestAnswerValidation {
  valid: string;

  preprocess(): string {
    return _.isNil(this.valid) ? "" : this.valid.toLowerCase().trim().replace(/\s+/g, " ");
  }

  validate(input: string): boolean {
    this.preprocess();
    return this.valid === input;
  }
}

export class VariantValidation extends TestAnswerValidation {
  variants: string[];

  preprocess() {
    this.variants.map((variant) => (_.isNil(variant) ? "" : variant.toLowerCase().trim().replace(/\s+/g, " ")));
  }

  validate(input: string): boolean {
    this.preprocess();
    return this.variants.includes(input);
  }
}

export class TestAnswer {
  @Type(() => TestAnswerValidation, {
    discriminator: {
      property: "type",
      subTypes: [
        { value: ExactValidation, name: AnswerTypeEnum.EXACT },
        { value: VariantValidation, name: AnswerTypeEnum.VARIANT },
      ],
    },
  })
  validation: ExactValidation | VariantValidation;

  validate(input: string): boolean {
    input = _.isNil(input) ? "" : input.toLowerCase().trim().replace(/\s+/g, " ");
    return this.validation.validate(input);
  }
}

export interface ITestAnswer {
  type: AnswerTypeEnum;
}
