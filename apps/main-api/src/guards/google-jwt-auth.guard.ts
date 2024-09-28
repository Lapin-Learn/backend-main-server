import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleJwtAuthGuard extends AuthGuard("google-jwt") {}
