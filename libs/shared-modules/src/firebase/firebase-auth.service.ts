import { genericHttpConsumer } from "@app/utils/axios";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosInstance } from "axios";
import { AppOptions } from "firebase-admin";
import { App, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { OAuth2Client, TokenPayload } from "google-auth-library";

@Injectable()
export class FirebaseAuthService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly app: App;
  private readonly apiKey: string;
  private readonly firebaseUrl: string;
  private readonly httpService: AxiosInstance;
  private readonly googleClient: OAuth2Client;

  constructor(
    @Inject("FIREBASE_ADMIN_OPTIONS_TOKEN") readonly options: AppOptions,
    private readonly configService: ConfigService
  ) {
    this.apiKey = this.configService.get("FIREBASE_API_KEY");
    this.firebaseUrl = this.configService.get("FIREBASE_URL");
    this.httpService = genericHttpConsumer();
    this.app = initializeApp(options);
    this.googleClient = new OAuth2Client(this.configService.get("GOOGLE_CLIENT_ID"));
  }

  async createUserByEmailAndPassword(email: string, password: string) {
    const auth = getAuth(this.app);
    return auth.createUser({ email, password });
  }

  async createUserByGoogle(payload: TokenPayload) {
    const auth = getAuth(this.app);
    return auth.createUser({
      uid: payload.sub,
      email: payload.email,
      photoURL: payload.picture,
    });
  }

  async getUserByEmail(email: string, nullIfNotFound?: boolean) {
    try {
      const auth = getAuth(this.app);
      return await auth.getUserByEmail(email);
    } catch (error) {
      if (nullIfNotFound && error.code === "auth/user-not-found") {
        return null;
      }
      throw error;
    }
  }

  async generateCustomToken(uid: string, data: any) {
    const additionalClaims = data ? { data } : {};
    return getAuth(this.app).createCustomToken(uid, additionalClaims);
  }

  async verifyUser(email: string, password: string) {
    try {
      const response = await this.httpService.post(
        `${this.firebaseUrl}/accounts:signInWithPassword?key=${this.apiKey}`,
        {
          email,
          password,
          returnSecureToken: false,
        }
      );
      return response.data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async verifyToken(token: string) {
    try {
      const idToken = await this.getIdToken(token);
      const auth = getAuth(this.app);
      return auth.verifyIdToken(idToken);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async verifyGoogleToken(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get("GOOGLE_CLIENT_ID"),
      });
      return ticket.getPayload();
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getIdToken(token: string) {
    try {
      const response = await this.httpService.post(
        `${this.firebaseUrl}/accounts:signInWithCustomToken?key=${this.apiKey}`,
        {
          token,
          returnSecureToken: true,
        }
      );
      return response.data.idToken;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async changePassword(uid: string, newPassword: string) {
    try {
      const app = getAuth(this.app);
      return app.updateUser(uid, {
        password: newPassword,
      });
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
