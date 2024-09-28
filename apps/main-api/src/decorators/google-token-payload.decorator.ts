import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TokenPayload } from "google-auth-library";

export const GoogleTokenPayload = createParamDecorator((_, ctx: ExecutionContext): TokenPayload => {
  const request = ctx.switchToHttp().getRequest();
  return request.payload;
});
