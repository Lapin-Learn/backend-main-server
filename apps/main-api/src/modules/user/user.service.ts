import { AccountRoleEnum } from "@app/types/enums";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { CreateUserDto } from "@app/types/dtos/accounts/create-user.dto";
import { UpdateAccountByAdminDto } from "@app/types/dtos/accounts/update-account-by-admin.dto";
import { FirebaseAuthService } from "@app/shared-modules/firebase";
import { Account } from "@app/database";
import { isNil } from "lodash";
import { UpdateAccountDto } from "@app/types/dtos/accounts/update-account.dto";

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
}
