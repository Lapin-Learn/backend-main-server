import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IGoogleUser } from "@app/types/interfaces";

export const GoogleUser = createParamDecorator((_, ctx: ExecutionContext): IGoogleUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
