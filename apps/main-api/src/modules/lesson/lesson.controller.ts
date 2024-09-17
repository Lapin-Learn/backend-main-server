import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { LessonService } from "./lesson.service";
import { CurrentUser, Roles } from "../../decorators";
import { ICurrentUser } from "@app/types/interfaces";
import { CompleteLessonDto } from "@app/types/dtos";
import { FirebaseJwtAuthGuard } from "../../guards";
import { AccountRoleEnum } from "@app/types/enums";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Lessons")
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Controller("lessons")
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @ApiOperation({ summary: "Complete a lesson" })
  @ApiBody({ type: CompleteLessonDto })
  @ApiResponse({ status: 200, description: "Lesson completed successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Post("completion")
  @Roles(AccountRoleEnum.LEARNER)
  async completeLesson(@Body() dto: CompleteLessonDto, @CurrentUser() user: ICurrentUser) {
    return this.lessonService.completeLesson(dto, user);
  }
}
