import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { AccountRoleEnum } from "@app/types/enums";
import { FirebaseJwtAuthGuard, RoleGuard } from "../../guards";
import { ApiDefaultResponses, Roles } from "../../decorators";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateUserDto, UpdateAccountByAdminDto } from "@app/types/dtos/accounts";

@ApiTags("Users")
@ApiBearerAuth()
@ApiDefaultResponses()
@UseGuards(FirebaseJwtAuthGuard)
@UseGuards(RoleGuard)
@Roles(AccountRoleEnum.ADMIN)
@Controller("users")
export class AdminController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Create an admin account" })
  @ApiBody({ type: CreateUserDto })
  async createUserAccount(@Body() data: CreateUserDto) {
    return this.userService.createUserAccount(data);
  }

  @Get()
  @ApiOperation({ summary: "Get all users" })
  async getAllUsers(@Query() data: { offset: number; limit: number; role?: AccountRoleEnum }) {
    const { offset, limit, role } = data;
    return this.userService.getAllUsers(offset, limit, role);
  }

  @Get("profile/:id")
  @ApiOperation({ summary: "Get a user's profile by ID" })
  async getUserById(@Param("id") id: string) {
    return this.userService.getUserById(id);
  }

  @Put("profile/:id")
  @ApiOperation({ summary: "Update profile by admin" })
  @ApiBody({ type: UpdateAccountByAdminDto })
  async updateUserAccountByAdmin(@Param("id") id: string, @Body() data: { body: UpdateAccountByAdminDto }) {
    const { body } = data;
    return this.userService.updateUser(id, body);
  }
}
