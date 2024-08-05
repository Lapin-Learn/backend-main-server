import { BadRequestException, Injectable, Logger, NotAcceptableException } from "@nestjs/common";
import { Account } from "@app/database/entities";
import { FirebaseAuthService } from "@app/shared-modules/firebase";
import { AuthHelper } from "./auth.helper";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly firebaseService: FirebaseAuthService,
    private readonly authHelper: AuthHelper
  ) {}

  async registerUser(email: string, password: string) {
    try {
      let firebaseUser = await this.firebaseService.getUserByEmail(email, true);
      if (firebaseUser) {
        throw new NotAcceptableException("Email has already existed");
      }
      firebaseUser = await this.firebaseService.createUserByEmailAndPassword(email, password);
      const newUser = await Account.save({ email, providerId: firebaseUser.uid, username: email });
      const accessToken = await this.firebaseService.generateCustomToken(firebaseUser.uid, {
        userId: newUser.id,
        role: newUser.role,
      });
      return this.authHelper.buildTokenResponse(accessToken);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.firebaseService.verifyUser(email, password);
      const dbUser = await Account.findOne({ where: { providerId: user.localId } });
      const accessToken = await this.firebaseService.generateCustomToken(dbUser.providerId, {
        userId: dbUser.id,
        role: dbUser.role,
      });
      return this.authHelper.buildTokenResponse(accessToken);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
