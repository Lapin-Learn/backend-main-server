import { AccountRoleEnum } from "@app/types/enums";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { UserRepository } from "../repository/user.repository";
import { CreateUserDto } from "@app/types/dtos/accounts/create-user.dto";
import { UpdateAccountByAdminDto } from "@app/types/dtos/accounts/update-account-by-admin.dto";
import { FirebaseAuthService } from "@app/shared-modules/firebase";
import { Account } from "@app/database";

@Injectable()
export class UserService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly firebaseService: FirebaseAuthService
  ) {}

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
      return this.userRepository.getAllUsers(offset, limit, role);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getUserById(id: string) {
    try {
      return this.userRepository.getUserById(id);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async updateUser(id: string, body: UpdateAccountByAdminDto) {
    try {
      const { ...rest } = body;
      const updatedUser = await this.userRepository.updateOne({ where: { id } }, rest);
      return { ...updatedUser };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
