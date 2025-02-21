import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards, ValidationPipe } from "@nestjs/common";
import { DailyLessonService } from "./daily-lesson.service";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CompleteLessonDto, QueryQuestionTypesDto } from "@app/types/dtos";
import { AccountRoleEnum, BandScoreEnum, SkillEnum } from "@app/types/enums";
import { FirebaseJwtAuthGuard } from "../../guards";
import { ApiDefaultResponses, CurrentUser, Roles } from "../../decorators";
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
  @ApiDefaultResponses()
  @Get("question-types")
  async getQuestionTypes(
    @Query(new ValidationPipe()) query: QueryQuestionTypesDto,
    @CurrentUser() learner: ICurrentUser
  ) {
    return this.dailyLessonService.getQuestionTypesProgressOfLearner(query?.skill, learner.profileId);
  }

  @ApiOperation({ summary: "Get all lessons of a question type base on current progress of leaner" })
  @ApiParam({ name: "id", description: "Question type id", type: Number })
  @ApiDefaultResponses()
  @Get("question-types/:id/lessons")
  async getLessonsByQuestionType(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() learner: ICurrentUser,
    @Query("band") band?: BandScoreEnum
  ) {
    return this.dailyLessonService.getLessonsInQuestionTypeOfLearner(id, learner.profileId, band);
  }

  @ApiOperation({ summary: "Get list band score base on current user band score of question type" })
  @Get("question-types/:id/band-scores")
  async getListBandScore(@Param("id", ParseIntPipe) id: number, @CurrentUser() learner: ICurrentUser) {
    return this.dailyLessonService.getListLessonBandScore(id, learner.profileId);
  }

  @ApiOperation({ summary: "Complete a lesson" })
  @ApiBody({ type: CompleteLessonDto })
  @ApiDefaultResponses()
  @Post("completion")
  async completeLesson(@Body() dto: CompleteLessonDto, @CurrentUser() user: ICurrentUser) {
    return this.dailyLessonService.completeLesson(dto, user);
  }

  @ApiOperation({ summary: "Get all questions of a lesson" })
  @ApiParam({ name: "lessonId", description: "Lesson id", type: Number })
  @ApiDefaultResponses()
  @Get("/:lessonId/questions")
  async getQuestionsByLesson(@Param("lessonId") lessonId: number) {
    return this.dailyLessonService.getContentOfLesson(lessonId);
  }

  @ApiOperation({ summary: "Get instruction of a question type" })
  @ApiParam({ name: "id", description: "Question type id", type: Number })
  @ApiDefaultResponses()
  @Get("question-types/:id/instruction")
  async getInstructionsByQuestionType(@Param("id", ParseIntPipe) id: number) {
    return this.dailyLessonService.getInstructionsOfQuestionType(id);
  }

  @ApiOperation({ summary: "Get questions for jump band test" })
  @ApiDefaultResponses()
  @ApiParam({ name: "id", description: "Question type id", type: Number })
  @Get("question-types/:id/band-upgrade-questions")
  async getJumpBandQuestions(@Param("id", ParseIntPipe) id: number, @CurrentUser() currentUser: ICurrentUser) {
    return this.dailyLessonService.getJumpBandQuestions(id, currentUser);
  }
}
