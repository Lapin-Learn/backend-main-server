import { BadRequestException, Injectable, Logger, NotAcceptableException } from "@nestjs/common";
import { Account } from "@app/database/entities";
import { FirebaseAuthService } from "@app/shared-modules/firebase";
import { AuthHelper } from "./auth.helper";
import { generate as otpGenerator } from "otp-generator";
import { MailService } from "@app/shared-modules/mail";
import { RedisService } from "@app/shared-modules/redis";
import { ResetPasswordActionEnum } from "@app/types/enums";
import { IAccount, ICurrentUser } from "@app/types/interfaces";
import { EntityNotFoundError } from "typeorm";
import { TokenPayload } from "google-auth-library";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly firebaseService: FirebaseAuthService,
    private readonly mailService: MailService,
    private readonly redisService: RedisService,
    private readonly authHelper: AuthHelper
  ) {}

  async registerUser(email: string, password: string) {
    try {
      let firebaseUser = await this.firebaseService.getUserByEmail(email, true);
      if (firebaseUser) {
        throw new NotAcceptableException("Email has already existed");
      }
      firebaseUser = await this.firebaseService.createUserByEmailAndPassword(email, password);
      const newUser: IAccount = await Account.save({ email, providerId: firebaseUser.uid, username: email });
      const accessToken = await this.firebaseService.generateCustomToken(firebaseUser.uid, {
        userId: newUser.id,
        profileId: newUser.learnerProfileId,
        role: newUser.role,
      });
      return this.authHelper.buildTokenResponse(accessToken);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async signInOrSignUpWithGoogle(payload: TokenPayload) {
    try {
      const { email } = payload;
      let firebaseUser = await this.firebaseService.getUserByEmail(email, true);
      let dbUser: IAccount = await Account.findOne({ where: { email, providerId: firebaseUser?.uid } });
      let claims: ICurrentUser;
      if (!firebaseUser && !dbUser) {
        firebaseUser = await this.firebaseService.createUserByGoogle(payload);
        dbUser = await Account.save({ email, providerId: firebaseUser.uid, username: email });
        claims = {
          userId: dbUser.id,
          profileId: dbUser.learnerProfileId,
          role: dbUser.role,
        };
      } else if (firebaseUser && dbUser) {
        claims = {
          userId: dbUser.id,
          profileId: dbUser.learnerProfileId,
          role: dbUser.role,
        };
      } else {
        throw new BadRequestException("Inconsistency account data");
      }
      return await this.firebaseService.generateCustomToken(dbUser.providerId, claims);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.firebaseService.verifyUser(email, password);
      const dbUser = await Account.findOneOrFail({ where: { providerId: user.localId, email } });
      const accessToken = await this.firebaseService.generateCustomToken(dbUser.providerId, {
        userId: dbUser.id,
        profileId: dbUser.learnerProfileId,
        role: dbUser.role,
      });
      return this.authHelper.buildTokenResponse(accessToken);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException("User is not founded");
      }
      throw new BadRequestException(error);
    }
  }

  async sendOtp(email: string) {
    try {
      const dbUser = await Account.findOne({ where: { email } });
      if (!dbUser) {
        throw new NotAcceptableException("Email not found");
      }
      const otp = otpGenerator(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      const resetPasswordToken = await this.firebaseService.generateCustomToken(dbUser.providerId, {
        uid: dbUser.providerId,
        action: ResetPasswordActionEnum.RESET_PASSWORD,
      });
      const res = await this.mailService.sendMail(email, "Reset password", "reset-password", { otp });
      if (res.accepted.length > 0 && resetPasswordToken) {
        await this.redisService.delete(dbUser.email);
        await this.redisService.set(dbUser.email, { otp, resetPasswordToken });
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async verifyOtp(email: string, otp: string) {
    try {
      const data = await this.redisService.get(email);
      if (!data) {
        throw new NotAcceptableException("OTP expired");
      }

      if (data.otp !== otp) {
        throw new NotAcceptableException("Invalid OTP");
      }

      return data.resetPasswordToken; // attach this token to header for reset password
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async updatePassword(uid: string, newPassword: string) {
    try {
      return await this.firebaseService.changePassword(uid, newPassword);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
