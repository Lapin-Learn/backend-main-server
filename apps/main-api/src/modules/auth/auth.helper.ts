import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthHelper {
  constructor() {}

  async buildTokenResponse(accessToken: string) {
    return { accessToken };
  }
}
