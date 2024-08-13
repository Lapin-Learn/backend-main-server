import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ResetPasswordActionEnum } from "@app/types/enums";

@Injectable()
export class ResetPasswordGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();

    const isValidAction = user.action === ResetPasswordActionEnum.RESET_PASSWORD;
    return isValidAction;
  }
}
