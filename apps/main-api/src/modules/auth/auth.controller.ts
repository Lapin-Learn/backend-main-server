import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LogInUserDto, RegisterUserDto } from "@app/types/dtos";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  @ApiOperation({ summary: "Sign up" })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: 201, description: "User created" })
  @ApiResponse({ status: 400, description: "Email existed" })
  async signup(@Body() data: RegisterUserDto) {
    const { email, password } = data;
    return this.authService.registerUser(email, password);
  }

  @Post("signin")
  @ApiOperation({ summary: "Sign in" })
  @ApiBody({ type: LogInUserDto })
  @ApiResponse({ status: 200, description: "User signed in" })
  @ApiResponse({ status: 400, description: "Invalid email or password" })
  async signin(@Body() data: LogInUserDto) {
    const { email, password } = data;
    return this.authService.login(email, password);
  }
}
