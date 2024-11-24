import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ActionEnum } from "@app/types/enums";

@Injectable()
export class ResetPasswordGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();

    return user.action === ActionEnum.RESET_PASSWORD;
  }
}
