import { Injectable } from "@nestjs/common";
import * as Handlebars from "handlebars";

@Injectable()
export class HandlebarsHelperService {
  constructor() {
    this.registerHelpers();
  }

  private registerHelpers() {
    Handlebars.registerHelper("isStatus", function (value, status, options) {
      if (value === status) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });

    Handlebars.registerHelper("add", function (value1, value2) {
      return parseInt(value1) + parseInt(value2);
    });
  }
}
