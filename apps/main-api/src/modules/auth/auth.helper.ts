import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthHelper {
  constructor() {}

  async buildTokenResponse(accessToken: string, refreshToken?: string) {
    return { accessToken, refreshToken };
  }
}
