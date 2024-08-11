import { ROLES_KEY } from "@app/types/constants";
import { AccountRoleEnum } from "@app/types/enums";
import { SetMetadata } from "@nestjs/common";

export const Roles = (...roles: AccountRoleEnum[]) => SetMetadata(ROLES_KEY, roles);
