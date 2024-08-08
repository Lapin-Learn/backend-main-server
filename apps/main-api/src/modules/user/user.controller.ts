import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { UserService } from "./user.service";
import { AccountRoleEnum } from "@app/types/enums";
import { CreateUserDto } from "@app/types/dtos/accounts/create-user.dto";
import { UpdateAccountByAdminDto } from "@app/types/dtos/accounts/update-account-by-admin.dto";

@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async createUserAccount(@Body() data: CreateUserDto) {
    return this.userService.createUserAccount(data);
  }

  @Get()
  async getAllUsers(@Param() data: { offset: number; limit: number; role?: AccountRoleEnum }) {
    const { offset, limit, role } = data;
    return this.userService.getAllUsers(offset, limit, role);
  }

  @Get(":id")
  async getUserById(@Body() data: { id: string }) {
    const { id } = data;
    return this.userService.getUserById(id);
  }

  @Put(":id")
  async updateUserInfo(@Body() data: { id: string; body: UpdateAccountByAdminDto }) {
    const { id, body } = data;
    return this.userService.updateUser(id, body);
  }
}
