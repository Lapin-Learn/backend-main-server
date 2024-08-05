import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LogInUserDto, RegisterUserDto } from "@app/types/dtos";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  async signup(@Body() data: RegisterUserDto) {
    const { email, password } = data;
    return this.authService.registerUser(email, password);
  }

  @Post("signin")
  async signin(@Body() data: LogInUserDto) {
    const { email, password } = data;
    return this.authService.login(email, password);
  }
}
