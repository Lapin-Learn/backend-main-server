import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IDecodedIdToken } from "@app/types/interfaces";

export const ProviderTokenPayload = createParamDecorator((_, ctx: ExecutionContext): IDecodedIdToken => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
