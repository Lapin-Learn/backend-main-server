import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { AccountRoleEnum } from "@app/types/enums";
import { CreateUserDto } from "@app/types/dtos/accounts/create-user.dto";
import { UpdateAccountByAdminDto } from "@app/types/dtos/accounts/update-account-by-admin.dto";
import { FirebaseJwtAuthGuard, RoleGuard } from "../../guards";
import { Roles } from "../../decorators";

@UseGuards(FirebaseJwtAuthGuard, RoleGuard)
@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @Roles(AccountRoleEnum.ADMIN)
  async createUserAccount(@Body() data: CreateUserDto) {
    return this.userService.createUserAccount(data);
  }

  @Get()
  @Roles(AccountRoleEnum.ADMIN)
  async getAllUsers(@Query() data: { offset: number; limit: number; role?: AccountRoleEnum }) {
    const { offset, limit, role } = data;
    return this.userService.getAllUsers(offset, limit, role);
  }

  @Get(":id")
  @Roles(AccountRoleEnum.ADMIN)
  async getUserById(@Param("id") id: string) {
    return this.userService.getUserById(id);
  }

  @Put(":id")
  @Roles(AccountRoleEnum.ADMIN)
  async updateUserInfo(@Param("id") id: string, @Body() data: { body: UpdateAccountByAdminDto }) {
    const { body } = data;
    return this.userService.updateUser(id, body);
  }
}
