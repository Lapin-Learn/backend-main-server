import { AccountRoleEnum } from "@app/types/enums";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { FirebaseAuthService } from "@app/shared-modules/firebase";
import { Account } from "@app/database";
import { isNil } from "lodash";
import { UpdateAccountByAdminDto, UpdateAccountDto, CreateUserDto } from "@app/types/dtos";
import { EntityNotFoundError } from "typeorm";

@Injectable()
export class UserService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(private readonly firebaseService: FirebaseAuthService) {}

  async createUserAccount(data: CreateUserDto) {
    try {
      const { email, password, username } = data;
      let firebaseUser = await this.firebaseService.getUserByEmail(email, true);
      if (firebaseUser) {
        throw new BadRequestException("Email has already existed");
      }
      firebaseUser = await this.firebaseService.createUserByEmailAndPassword(email, password);
      const newUser = await Account.save({
        email,
        providerId: firebaseUser.uid,
        username,
        role: AccountRoleEnum.ADMIN,
      });
      return newUser;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getAllUsers(offset: number, limit: number, role: AccountRoleEnum = undefined) {
    try {
      const [accounts, total] = await Promise.all([
        Account.find({
          where: isNil(role) ? {} : { role },
          skip: offset,
          take: limit,
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            role: true,
            dob: true,
            gender: true,
            createdAt: true,
          },
        }),
        Account.countBy({ role }),
      ]);

      return { accounts, total, offset, limit };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getUserById(id: string) {
    try {
      return Account.findOne({
        where: { id },
        relations: {
          learnerProfile: true,
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          role: true,
          dob: true,
          gender: true,
          createdAt: true,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async updateUser(id: string, updateData: UpdateAccountByAdminDto | UpdateAccountDto) {
    try {
      const existedUser = await Account.findOne({ where: { id } });
      if (!existedUser) {
        throw new BadRequestException("User not found");
      }
      const updatedUser = await Account.save({ ...existedUser, ...updateData });
      return updatedUser;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async deleteUser(id: string) {
    try {
      const deletedUser = await Account.delete({ id });
      return { ...deletedUser };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    try {
      const user = await Account.findOneOrFail({ where: { id: userId } });
      const verifiedFirebaseUser = await this.firebaseService.verifyUser(user.email, oldPassword);
      await this.firebaseService.changePassword(verifiedFirebaseUser.localId, newPassword);
      return "Password changed";
    } catch (error) {
      this.logger.error(error);
      if (error.response && error.response === "INVALID_LOGIN_CREDENTIALS") {
        throw new BadRequestException("Invalid old password");
      } else if (error instanceof EntityNotFoundError) {
        throw new BadRequestException("User not found");
      }
      throw new BadRequestException(error);
    }
  }
}
