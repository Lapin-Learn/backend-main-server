import { ConfirmUploadDto, UpdateFileDto, UploadFileDto } from "@app/types/dtos";
import { Body, Controller, Delete, Get, Param, Post, Put, Redirect, UseGuards } from "@nestjs/common";
import { BucketService } from "./bucket.service";
import { CurrentUser } from "../../decorators";
import { ICurrentUser } from "@app/types/interfaces";
import { BypassTransformResponse } from "@app/utils/decorators";
import { FirebaseJwtAuthGuard } from "../../guards";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller("files")
@ApiTags("Files")
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
export class BucketController {
  constructor(private bucketService: BucketService) {}

  @Post("presigned-url")
  @ApiOperation({ summary: "Get presigned URL for uploading file" })
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({ status: 201, description: "Presigned URL generated" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getPresignedUploadUrl(@CurrentUser() user: ICurrentUser, @Body() body: UploadFileDto) {
    return this.bucketService.getPresignedUploadUrl(user, body);
  }

  @Get(":id")
  @Redirect()
  @BypassTransformResponse()
  @ApiOperation({ summary: "Get presigned URL for downloading file" })
  @ApiResponse({ status: 200, description: "Presigned URL generated" })
  @ApiResponse({ status: 400, description: "File not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getPresignedDownloadUrl(@Param("id") fileId: string) {
    return { url: await this.bucketService.getPresignedDownloadUrl(fileId) };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete file" })
  @ApiResponse({ status: 200, description: "File deleted" })
  @ApiResponse({ status: 400, description: "File not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async deleteFile(@CurrentUser() user: ICurrentUser, @Param("id") fileId: string) {
    return this.bucketService.deleteFile(user, fileId);
  }

  @Post("confirmation")
  @ApiOperation({ summary: "Confirm upload" })
  @ApiBody({ type: ConfirmUploadDto })
  @ApiResponse({ status: 200, description: "Upload confirmed" })
  @ApiResponse({ status: 400, description: "File not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async uploadConfirmation(@CurrentUser() user: ICurrentUser, @Body() body: ConfirmUploadDto) {
    return this.bucketService.uploadConfirmation(user, body);
  }

  @Put("presigned-url/:id")
  @ApiOperation({ summary: "Get presigned URL for updating file" })
  @ApiBody({ type: UpdateFileDto })
  @ApiResponse({ status: 200, description: "Presigned URL generated" })
  @ApiResponse({ status: 400, description: "File not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getPresignedUploadUrlForUpdate(
    @CurrentUser() user: ICurrentUser,
    @Body() body: UpdateFileDto,
    @Param("id") id: string
  ) {
    return this.bucketService.getPresignedUploadUrlForUpdate(user, { ...body, id });
  }
}
