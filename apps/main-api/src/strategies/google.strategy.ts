import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-custom";
import { FirebaseAuthService } from "@app/shared-modules/firebase";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google-jwt") {
  constructor(private firebaseService: FirebaseAuthService) {
    super();
  }

  async validate(request: Request, done) {
    const authHeader = String(request.headers["authorization"] || "");

    if (!authHeader.startsWith("Bearer ")) {
      return false;
    }

    if (authHeader.startsWith("Bearer ") && authHeader.length <= 7) {
      return false;
    }

    const token = authHeader.substring(7, authHeader.length);
    try {
      const payload = await this.firebaseService.verifyGoogleToken(token);
      done(null, payload);
    } catch (error) {
      return false;
    }
  }
}
