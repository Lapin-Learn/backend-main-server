import { Body, Controller, Delete, Get, Put, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { FirebaseJwtAuthGuard } from "../../guards";
import { ApiDefaultResponses, CurrentUser } from "../../decorators";
import { ICurrentUser } from "@app/types/interfaces";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ChangePasswordDto, UpdateAccountDto } from "@app/types/dtos/accounts";

@ApiTags("Users")
@ApiBearerAuth()
@ApiDefaultResponses()
@UseGuards(FirebaseJwtAuthGuard)
@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("profile")
  @ApiOperation({ summary: "Get a user's profile" })
  async getUserProfile(@CurrentUser() user: ICurrentUser) {
    return this.userService.getUserById(user.userId);
  }

  @Get("profile/gamification")
  @ApiOperation({ summary: "Get a user's gamification profile" })
  async getCurrentGamificationProfile(@CurrentUser() user: ICurrentUser) {
    return this.userService.getCurrentGamificationProfile(user.profileId);
  }

  @Get("account")
  @ApiOperation({ summary: "Get a user's account" })
  async getCurrentAccount(@CurrentUser() user: ICurrentUser) {
    return this.userService.getCurrentAccount(user.userId);
  }

  @Put("profile")
  @ApiOperation({ summary: "Update profile" })
  @ApiBody({ type: UpdateAccountDto })
  async updateUserProfile(@CurrentUser() user: ICurrentUser, @Body() data: { body: UpdateAccountDto }) {
    const { body } = data;
    return this.userService.updateUser(user.userId, body);
  }

  @Put("profile/password")
  @ApiOperation({ summary: "Change password" })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@CurrentUser() user: ICurrentUser, @Body() data: ChangePasswordDto) {
    return this.userService.changePassword(user.userId, data.oldPassword, data.newPassword);
  }

  @Delete("account")
  async deleteAccount(@CurrentUser() user: ICurrentUser) {
    return this.userService.deleteAccount(user);
  }
}
