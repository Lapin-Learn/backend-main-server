import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { AccountRoleEnum } from "@app/types/enums";
import { CreateUserDto } from "@app/types/dtos/accounts/create-user.dto";
import { FirebaseJwtAuthGuard, RoleGuard } from "../../guards";
import { CurrentUser, Roles } from "../../decorators";
import { ICurrentUser } from "@app/types/interfaces";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UpdateAccountByAdminDto, UpdateAccountDto } from "@app/types/dtos";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Create an admin account" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: "Admin account created" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseGuards(RoleGuard)
  @Roles(AccountRoleEnum.ADMIN)
  async createUserAccount(@Body() data: CreateUserDto) {
    return this.userService.createUserAccount(data);
  }

  @Get()
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "All users found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseGuards(RoleGuard)
  @Roles(AccountRoleEnum.ADMIN)
  async getAllUsers(@Query() data: { offset: number; limit: number; role?: AccountRoleEnum }) {
    const { offset, limit, role } = data;
    return this.userService.getAllUsers(offset, limit, role);
  }

  @Get("profile")
  @ApiOperation({ summary: "Get a user's profile" })
  @ApiResponse({ status: 200, description: "User found" })
  @ApiResponse({ status: 400, description: "User not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getUserProfile(@CurrentUser() user: ICurrentUser) {
    return this.userService.getUserById(user.userId);
  }

  @Put("profile")
  @ApiOperation({ summary: "Update profile" })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({ status: 200, description: "Profile updated" })
  @ApiResponse({ status: 400, description: "User not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async updateUserProfile(@CurrentUser() user: ICurrentUser, @Body() data: { body: UpdateAccountDto }) {
    const { body } = data;
    return this.userService.updateUser(user.userId, body);
  }

  @Get("profile/:id")
  @ApiOperation({ summary: "Get a user's profile by ID" })
  @ApiResponse({ status: 200, description: "User found" })
  @ApiResponse({ status: 400, description: "User not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseGuards(RoleGuard)
  @Roles(AccountRoleEnum.ADMIN)
  async getUserById(@Param("id") id: string) {
    return this.userService.getUserById(id);
  }

  @Put("profile/:id")
  @ApiOperation({ summary: "Update profile by admin" })
  @ApiBody({ type: UpdateAccountByAdminDto })
  @ApiResponse({ status: 200, description: "Profile updated by admin" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseGuards(RoleGuard)
  @Roles(AccountRoleEnum.ADMIN)
  async updateUserAccountByAdmin(@Param("id") id: string, @Body() data: { body: UpdateAccountByAdminDto }) {
    const { body } = data;
    return this.userService.updateUser(id, body);
  }
}
