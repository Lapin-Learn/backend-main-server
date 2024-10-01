import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-custom";
import { FirebaseAuthService } from "@app/shared-modules/firebase";

@Injectable()
export class ProviderStrategy extends PassportStrategy(Strategy, "provider-jwt") {
  constructor(private firebaseService: FirebaseAuthService) {
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
      return await this.firebaseService.verifyProviderToken(token);
    } catch (error) {
      return false;
    }
  }
}
