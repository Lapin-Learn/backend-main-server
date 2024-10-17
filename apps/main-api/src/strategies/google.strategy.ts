import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-custom";
import { OAuth2Client } from "google-auth-library";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google-jwt") {
  constructor() {
    super();
  }

  async validate(request: Request) {
    const authHeader = String(request.headers["authorization"] || "");

    if (!authHeader.startsWith("Bearer ")) {
      return false;
    }

    if (authHeader.startsWith("Bearer ") && authHeader.length <= 7) {
      return false;
    }

    const token = authHeader.substring(7, authHeader.length);
    try {
      const googleClient = new OAuth2Client();
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
      });
      return ticket.getPayload();
    } catch (error) {
      return false;
    }
  }
}
