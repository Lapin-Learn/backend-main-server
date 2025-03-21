import { OmitType, PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";

export class UpdateAccountDto extends PartialType(OmitType(CreateUserDto, ["role", "email"])) {}
