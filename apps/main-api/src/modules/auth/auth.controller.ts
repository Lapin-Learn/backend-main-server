import { Body, Controller, Get, Post, Query, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LogInUserDto, RegisterUserDto, VerifyOtpDto, ResetPasswordDto } from "@app/types/dtos";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FirebaseJwtAuthGuard, ProviderJwtAuthGuard } from "../../guards";
import { ResetPasswordGuard } from "../../guards/reset-password.guard";
import { IDecodedIdToken, IResetPasswordAction } from "@app/types/interfaces";
import { ProviderTokenPayload } from "../../decorators/provider-token-payload.decorator";

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
  @UseGuards(ProviderJwtAuthGuard)
  async signInWithProvider(@ProviderTokenPayload() user: IDecodedIdToken) {
    return this.authService.loginWithProvider(user.email, user.uid);
  }

  @Post("otp")
  @ApiOperation({ summary: "Verify OTP" })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 201, description: "OTP verified" })
  @ApiResponse({ status: 406, description: "Expired OTP or Invalid OTP" })
  async verifyOtp(@Body() data: VerifyOtpDto) {
    return this.authService.verifyOtp(data.email, data.otp);
  }

  @UseGuards(FirebaseJwtAuthGuard, ResetPasswordGuard)
  @Post("password-update")
  @ApiOperation({ summary: "Update password" })
  @ApiBearerAuth()
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: "Password updated" })
  @ApiResponse({ status: 400, description: "Invalid uid" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async resetPassword(@Request() request, @Body() data: ResetPasswordDto) {
    const { uid } = request.user as IResetPasswordAction;
    return this.authService.updatePassword(uid, data.newPassword);
  }

  @Get("otp")
  @ApiOperation({ summary: "Send OTP" })
  @ApiQuery({ name: "email", required: true })
  @ApiResponse({ status: 200, description: "OTP sent" })
  @ApiResponse({ status: 406, description: "Email not found" })
  async sendOtp(@Query("email") email: string) {
    return this.authService.sendOtp(email);
  }
}
