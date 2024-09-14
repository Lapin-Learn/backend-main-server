import { Controller, Get, Param, ParseIntPipe, Query, UseGuards, ValidationPipe } from "@nestjs/common";
import { DailyLessonService } from "./daily-lesson.service";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { QueryQuestionTypesDto } from "@app/types/dtos";
import { SkillEnum } from "@app/types/enums";
import { FirebaseJwtAuthGuard } from "../../guards";

@ApiTags("Daily Lessons")
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Controller("daily-lessons")
export class DailyLessonController {
  constructor(private readonly dailyLessonService: DailyLessonService) {}

  @ApiOperation({ summary: "Get all question types of a skill or all skills" })
  @ApiQuery({ name: "skill", enum: SkillEnum, required: false })
  @ApiResponse({ status: 200, description: "Get all question types successfully" })
  @ApiResponse({ status: 400, description: "Invalid skill param value" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Get("question-types")
  async getQuestionTypes(@Query(new ValidationPipe()) query: QueryQuestionTypesDto) {
    return this.dailyLessonService.getQuestionTypes(query?.skill);
  }

  @ApiOperation({ summary: "Get all lessons of a question type" })
  @ApiParam({ name: "id", description: "Question type id", type: Number })
  @ApiResponse({ status: 200, description: "Get all lessons of a question type successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Get("questions-types/:id/lessons")
  async getLessonsByQuestionType(@Param("id", ParseIntPipe) id: number) {
    return this.dailyLessonService.getLessonsOfQuestionType(id);
  }
}
