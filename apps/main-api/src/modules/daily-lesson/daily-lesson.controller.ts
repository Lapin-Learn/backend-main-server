import { Controller, Get, Param, ParseIntPipe, Query, UseGuards, ValidationPipe } from "@nestjs/common";
import { DailyLessonService } from "./daily-lesson.service";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { QueryQuestionTypesDto } from "@app/types/dtos";
import { SkillEnum } from "@app/types/enums";
import { FirebaseJwtAuthGuard } from "../../guards";
import { CurrentUser } from "../../decorators";
import { ICurrentUser } from "@app/types/interfaces";

@ApiTags("Daily Lessons")
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
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
  @Get("questions-types/:id/lessons")
  async getLessonsByQuestionType(@Param("id", ParseIntPipe) id: number, @CurrentUser() learner: ICurrentUser) {
    return this.dailyLessonService.getLessonsInQuestionTypeOfLearner(id, learner.profileId);
  }

  @ApiOperation({ summary: "Get all questions of a lesson" })
  @ApiParam({ name: "lessonId", description: "Lesson id", type: Number })
  @ApiResponse({ status: 200, description: "Get all questions of a lesson successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Get("lessons/:lessonId/questions")
  // Marked
  async getQuestionsByLesson(@Param("lessonId") lessonId: number) {
    return this.dailyLessonService.getContentOfLesson(lessonId);
  }
}
