import { BadRequestException, Injectable, Logger, NotAcceptableException } from "@nestjs/common";
import { Account, Bucket, LearnerProfile } from "@app/database/entities";
import { FirebaseAuthService } from "@app/shared-modules/firebase";
import { AuthHelper } from "./auth.helper";
import { generate as otpGenerator } from "otp-generator";
import { RedisService } from "@app/shared-modules/redis";
import { ActionEnum } from "@app/types/enums";
import { ICurrentUser } from "@app/types/interfaces";
import { EntityNotFoundError } from "typeorm";
import { generateOTPConfig } from "../../config";
import { NovuService } from "@app/shared-modules/novu";
import { APPLE_PROVIDER, RESET_PASSWORD_WORKFLOW, VERIFY_EMAIL_WORKFLOW } from "@app/types/constants";
import { AdditionalInfo } from "@app/types/dtos";
import { BucketService } from "../bucket/bucket.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly firebaseService: FirebaseAuthService,
    private readonly redisService: RedisService,
    private readonly authHelper: AuthHelper,
    private readonly novuService: NovuService,
    private readonly bucketService: BucketService
  ) {}

  async registerUser(email: string, password: string) {
    try {
      const firebaseUser = await this.firebaseService.createUserByEmailAndPassword(email, password, false);
      await Account.createAccount({ email, providerId: firebaseUser.uid, username: email }, false);
      await this.sendOtp(email, ActionEnum.VERIFY_MAIL);
      return "Sign up successfully";
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async loginWithProvider(credential: string, provider: string, additionalInfo: AdditionalInfo) {
    try {
      const firebaseUser = await this.firebaseService.verifyOAuthCredential(credential, provider);
      const user = await this.firebaseService.getUser(firebaseUser.localId);

      const { email } = user;
      let dbUser: Account = await Account.findOne({
        where: { email },
      });

      if (!dbUser) {
        const generatedPassword = otpGenerator(8, generateOTPConfig);
        await this.firebaseService.linkWithProvider(firebaseUser.idToken, user.email, generatedPassword);
        dbUser = Account.create({
          email,
          providerId: user.uid,
          username: user.displayName ?? "",
          fullName: user.displayName ?? "",
        });
      }

      if (dbUser && !dbUser.learnerProfileId) {
        dbUser.learnerProfileId = (await LearnerProfile.createNewProfile()).id;
      }

      if (provider === APPLE_PROVIDER && additionalInfo && !dbUser.fullName) {
        dbUser.fullName = additionalInfo.fullName;
        dbUser.username = additionalInfo.fullName;
      }

      dbUser = await Account.save({ ...dbUser });

      const currentUser: ICurrentUser = { userId: dbUser.id, profileId: dbUser.learnerProfileId, role: dbUser.role };

      if (!dbUser.avatarId && user.photoURL) {
        const isSuccess = await this.bucketService.uploadAvatarFromLink(
          `avatar-${dbUser.id}`,
          user.photoURL,
          currentUser
        );

        if (isSuccess) {
          const bucket = await Bucket.findOne({
            where: {
              name: `avatar-${dbUser.id}`,
            },
          });
          dbUser.avatarId = bucket?.id;
        }
        dbUser = await Account.save({ ...dbUser });
      }

      const accessToken = await this.firebaseService.generateCustomToken(dbUser.providerId, currentUser);
      return this.authHelper.buildTokenResponse(accessToken, firebaseUser.refreshToken);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async login(email: string, password: string) {
    try {
      const firebaseUser = await this.firebaseService.verifyUser(email, password);
      const dbUser = await Account.findOneOrFail({
        where: { providerId: firebaseUser.localId, email },
      });
      if (!dbUser.learnerProfileId) {
        await this.sendOtp(email, ActionEnum.VERIFY_MAIL);
        return "You have not verified email";
      }
      const accessToken = await this.firebaseService.generateCustomToken(dbUser.providerId, {
        userId: dbUser.id,
        profileId: dbUser.learnerProfileId,
        role: dbUser.role,
      });
      return this.authHelper.buildTokenResponse(accessToken, firebaseUser.refreshToken);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException("Invalid email or password");
      }
      throw new BadRequestException(error);
    }
  }

  async sendOtp(email: string, action: ActionEnum) {
    try {
      const dbUser = await Account.findOne({ where: { email } });
      if (!dbUser) {
        throw new NotAcceptableException("Email not found");
      }
      const otp = otpGenerator(6, generateOTPConfig);
      const verifyToken = await this.firebaseService.generateCustomToken(dbUser.providerId, {
        uid: dbUser.providerId,
        action,
      });

      await this.redisService.delete(`OTP-${action}-${dbUser.email}`);
      const saved = await this.redisService.set(`OTP-${action}-${dbUser.email}`, { otp, verifyToken });
      if (saved) {
        const workFlow = action === ActionEnum.RESET_PASSWORD ? RESET_PASSWORD_WORKFLOW : VERIFY_EMAIL_WORKFLOW;
        const res = await this.novuService.sendEmail({ data: { otp } }, dbUser.id, email, workFlow);

        return res.data.acknowledged;
      }
      return false;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async verifyOtp(email: string, otp: string, action: ActionEnum) {
    try {
      const data = await this.redisService.get(`OTP-${action}-${email}`);
      if (!data) {
        throw new NotAcceptableException("OTP expired");
      }

      if (data.otp !== otp) {
        throw new NotAcceptableException("Invalid OTP");
      }

      await this.redisService.delete(`OTP-${action}-${email}`);

      return this.authHelper.buildTokenResponse(data.verifyToken);
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

  async createProfile(uid: string) {
    try {
      const account = await Account.findOneOrFail({
        where: { providerId: uid },
      });
      if (account.learnerProfileId) {
        return "You already have profile";
      }
      await this.firebaseService.setEmailVerifed(uid);
      const newProfile = await LearnerProfile.createNewProfile();
      account.learnerProfile = newProfile;
      await account.save();
      return "Create new profile successfully";
    } catch (error) {
      this.logger.error(error);
      if (error instanceof EntityNotFoundError) {
        throw new BadRequestException("Account not found");
      }
      throw new BadRequestException(error);
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const firebaseUser = await this.firebaseService.refreshToken(refreshToken);
      const dbUser = await Account.findOneOrFail({ where: { providerId: firebaseUser.user_id } });
      const accessToken = await this.firebaseService.generateCustomToken(dbUser.providerId, {
        userId: dbUser.id,
        profileId: dbUser.learnerProfileId,
        role: dbUser.role,
      });
      return this.authHelper.buildTokenResponse(accessToken, firebaseUser.refresh_token);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
