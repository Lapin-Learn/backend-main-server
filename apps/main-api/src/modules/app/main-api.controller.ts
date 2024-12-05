import { Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { MainApiService } from "./main-api.service";
import { join } from "path";

@Controller()
export class MainApiController {
  constructor(private readonly mainApiService: MainApiService) {}

  @Get("health")
  getHello(): string {
    return this.mainApiService.getHello();
  }

  @Get("/")
  getLandingPage(@Res() res: Response, @Query("lang") lang?: string) {
    if (!lang || (lang != "en" && lang != "vn")) {
      return res.redirect(`/?lang=vn`);
    }
    return res.sendFile(join(__dirname, "public", `${lang}.html`));
  }
}
