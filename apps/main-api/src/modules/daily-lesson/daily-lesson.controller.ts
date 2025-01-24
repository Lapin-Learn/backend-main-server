import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards, ValidationPipe } from "@nestjs/common";
import { DailyLessonService } from "./daily-lesson.service";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CompleteLessonDto, QueryQuestionTypesDto } from "@app/types/dtos";
import { AccountRoleEnum, SkillEnum } from "@app/types/enums";
import { FirebaseJwtAuthGuard } from "../../guards";
import { CurrentUser, Roles } from "../../decorators";
import { ICurrentUser } from "@app/types/interfaces";

@ApiTags("Daily Lessons")
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Roles(AccountRoleEnum.LEARNER)
@Controller("daily-lessons")
export class DailyLessonController {
  constructor(private readonly dailyLessonService: DailyLessonService) {}

  @ApiOperation({ summary: "Get all question types of learner progress" })
  @ApiQuery({ name: "skill", enum: SkillEnum, required: false })
  @ApiResponse({ status: 200, description: "Get all question types successfully" })
  @ApiResponse({ status: 400, description: "Invalid skill param value" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Get("question-types")
  async getQuestionTypes(
    @Query(new ValidationPipe()) query: QueryQuestionTypesDto,
    @CurrentUser() learner: ICurrentUser
  ) {
    return this.dailyLessonService.getQuestionTypesProgressOfLearner(query?.skill, learner.profileId);
  }

  @ApiOperation({ summary: "Get all lessons of a question type base on current progress of leaner" })
  @ApiParam({ name: "id", description: "Question type id", type: Number })
  @ApiResponse({ status: 200, description: "Get all lessons of a question type successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Get("question-types/:id/lessons")
  async getLessonsByQuestionType(@Param("id", ParseIntPipe) id: number, @CurrentUser() learner: ICurrentUser) {
    return this.dailyLessonService.getLessonsInQuestionTypeOfLearner(id, learner.profileId);
  }

  @ApiOperation({ summary: "Complete a lesson" })
  @ApiBody({ type: CompleteLessonDto })
  @ApiResponse({ status: 200, description: "Lesson completed successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Post("completion")
  async completeLesson(@Body() dto: CompleteLessonDto, @CurrentUser() user: ICurrentUser) {
    return this.dailyLessonService.completeLesson(dto, user);
  }

  @ApiOperation({ summary: "Get all questions of a lesson" })
  @ApiParam({ name: "lessonId", description: "Lesson id", type: Number })
  @ApiResponse({ status: 200, description: "Get all questions of a lesson successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Get("lessons/:lessonId/questions")
  async getQuestionsByLesson(@Param("lessonId") lessonId: number) {
    return this.dailyLessonService.getContentOfLesson(lessonId);
  }

  @ApiOperation({ summary: "Get instruction of a question type" })
  @ApiParam({ name: "id", description: "Question type id", type: Number })
  @ApiResponse({ status: 200, description: "Get instruction of a question type successfully" })
  @Get("question-types/:id/instruction")
  async getInstructionsByQuestionType(@Param("id", ParseIntPipe) id: number) {
    return this.dailyLessonService.getInstructionsOfQuestionType(id);
  }
}
