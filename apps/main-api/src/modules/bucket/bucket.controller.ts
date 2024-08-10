import { ConfirmUploadDto, UpdateFileDto, UploadFileDto } from "@app/types/dtos";
import { Body, Controller, Delete, Get, Param, Post, Put, Redirect, UseGuards } from "@nestjs/common";
import { BucketService } from "./bucket.service";
import { CurrentUser } from "../../decorators";
import { ICurrentUser } from "@app/types/interfaces";
import { BypassTransformResponse } from "@app/utils/decorators";
import { FirebaseJwtAuthGuard } from "../../guards";

@Controller("files")
@UseGuards(FirebaseJwtAuthGuard)
export class BucketController {
  constructor(private bucketService: BucketService) {}

  @Post("presigned-url")
  async getUploadPresignedUrl(@CurrentUser() user: ICurrentUser, @Body() body: UploadFileDto) {
    return this.bucketService.getPresignedUploadUrl(user, body);
  }

  @Get(":id")
  @Redirect()
  @BypassTransformResponse()
  async getPresignedDownloadUrl(@CurrentUser() user: ICurrentUser, @Param("id") fileId: string) {
    return { url: await this.bucketService.getPresignedDownloadUrl(user, fileId) };
  }

  @Delete(":id")
  async deleteFile(@CurrentUser() user: ICurrentUser, @Param("id") fileId: string) {
    return this.bucketService.deleteFile(user, fileId);
  }

  @Post("confirmation")
  async uploadConfirmation(@CurrentUser() user: ICurrentUser, @Body() body: ConfirmUploadDto) {
    return this.bucketService.uploadConfirmation(user, body);
  }

  @Put("presigned-url")
  async getPresignedUploadUrlForUpdate(@CurrentUser() user: ICurrentUser, @Body() body: UpdateFileDto) {
    return this.bucketService.getPresignedUploadUrlForUpdate(user, body);
  }
}
