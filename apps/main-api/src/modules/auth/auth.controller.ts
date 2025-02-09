import { Body, Controller, Get, Post, Query, UseGuards, Request, ParseEnumPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  LogInUserDto,
  RegisterUserDto,
  VerifyOtpDto,
  ResetPasswordDto,
  LogInWithProviderDto,
  RefreshTokenRequestDto,
} from "@app/types/dtos";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EmailVerifiedGuard, FirebaseJwtAuthGuard, ResetPasswordGuard } from "../../guards";
import { IResetPasswordAction } from "@app/types/interfaces";
import { ActionEnum } from "@app/types/enums";
import { ApiDefaultResponses } from "../../decorators";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  @ApiOperation({ summary: "Sign up" })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: 201, description: "User created" })
  @ApiResponse({ status: 400, description: "Email existed" })
  async signUp(@Body() data: RegisterUserDto) {
    const { email, password } = data;
    return this.authService.registerUser(email, password);
  }

  @Post("signin")
  @ApiOperation({ summary: "Sign in" })
  @ApiBody({ type: LogInUserDto })
  @ApiResponse({ status: 200, description: "User signed in" })
  @ApiResponse({ status: 400, description: "Invalid email or password" })
  async signIn(@Body() data: LogInUserDto) {
    const { email, password } = data;
    return this.authService.login(email, password);
  }

  @Post("provider")
  @ApiOperation({ summary: "Sign in with provider" })
  @ApiBody({ type: LogInWithProviderDto })
  @ApiResponse({ status: 200, description: "User signed in" })
  async signInWithProvider(@Body() data: LogInWithProviderDto) {
    return this.authService.loginWithProvider(data.credential, data.provider, data?.additionalInfo);
  }

  @Post("otp")
  @ApiOperation({ summary: "Verify OTP" })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 201, description: "OTP verified" })
  @ApiResponse({ status: 406, description: "Expired OTP or Invalid OTP" })
  async verifyOtp(@Body() data: VerifyOtpDto) {
    return this.authService.verifyOtp(data.email, data.otp, data.action);
  }

  @UseGuards(FirebaseJwtAuthGuard, ResetPasswordGuard)
  @Post("password-update")
  @ApiOperation({ summary: "Update password" })
  @ApiBearerAuth()
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: "Password updated" })
  @ApiResponse({ status: 400, description: "Invalid uid" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async resetPassword(@Request() request: any, @Body() data: ResetPasswordDto) {
    const { uid } = request.user as IResetPasswordAction;
    return this.authService.updatePassword(uid, data.newPassword);
  }

  @Post("profile")
  @ApiBearerAuth()
  @ApiDefaultResponses()
  @UseGuards(FirebaseJwtAuthGuard, EmailVerifiedGuard)
  async createNewProfile(@Request() request: any) {
    const { uid } = request.user as { uid: string };
    return this.authService.createProfile(uid);
  }

  @Get("otp")
  @ApiOperation({ summary: "Send OTP" })
  @ApiQuery({ name: "email", required: true })
  @ApiQuery({ name: "action", enum: ActionEnum, required: true })
  @ApiResponse({ status: 200, description: "OTP sent" })
  @ApiResponse({ status: 422, description: "Send mail fail" })
  @ApiResponse({ status: 406, description: "Email not found" })
  async sendOtp(@Query("email") email: string, @Query("action", new ParseEnumPipe(ActionEnum)) action: ActionEnum) {
    return this.authService.sendOtp(email, action);
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh token" })
  @ApiBody({ type: RefreshTokenRequestDto })
  @ApiResponse({ status: 200, description: "Token refreshed" })
  @ApiResponse({ status: 400, description: "Invalid or expired refresh token" })
  async refreshToken(@Body() data: RefreshTokenRequestDto) {
    return this.authService.refreshAccessToken(data.refreshToken);
  }
}
