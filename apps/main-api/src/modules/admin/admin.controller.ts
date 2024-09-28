import { Body, Controller, Get, Param, ParseEnumPipe, ParseIntPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import {
  CreateLessonDto,
  CreateQuestionDto,
  CreateQuestionTypeDto,
  UpdateLessonDto,
  UpdateQuestionDto,
  UpdateQuestionTypeDto,
} from "@app/types/dtos/admin";
import { FirebaseJwtAuthGuard, RoleGuard } from "../../guards";
import { Roles } from "../../decorators";
import { AccountRoleEnum, CEFRLevelEum, ContentTypeEnum } from "@app/types/enums";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ParseListStringEnumPipe } from "@app/utils/pipes";
import { AssignQuestionsToLessonDto } from "@app/types/dtos/admin/assign-question-to-lesson.dto";

@ApiTags("Admin")
@ApiBearerAuth()
@ApiResponse({ status: 401, description: "Unauthorized" })
@ApiResponse({ status: 403, description: "Forbidden" })
@UseGuards(FirebaseJwtAuthGuard, RoleGuard)
@Controller("admin")
@Roles(AccountRoleEnum.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: "Create a question" })
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse({ status: 201, description: "Question created" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @Post("questions")
  createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.adminService.createQuestion(createQuestionDto);
  }

  @ApiOperation({ summary: "Create a lesson" })
  @ApiBody({ type: CreateLessonDto })
  @ApiResponse({ status: 201, description: "Lesson created" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @Post("lessons")
  createLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.adminService.createLesson(createLessonDto);
  }

  @ApiOperation({ summary: "Update a lesson" })
  @ApiBody({ type: UpdateLessonDto })
  @ApiResponse({ status: 200, description: "Lesson updated" })
  @ApiResponse({ status: 400, description: "Not found lesson or question type" })
  @Put("lessons/:id")
  updateLesson(@Param("id", ParseIntPipe) id: number, @Body() updateLessonDto: UpdateLessonDto) {
    return this.adminService.updateLesson(id, updateLessonDto);
  }

  @ApiOperation({ summary: "Get all questions with query parameters" })
  @ApiQuery({
    name: "contentType",
    type: String,
    required: false,
    example: `${ContentTypeEnum.MULTIPLE_CHOICE}+${ContentTypeEnum.FILL_IN_THE_BLANK}`,
  })
  @ApiQuery({ name: "cefrLevel", type: String, enum: CEFRLevelEum, required: false })
  @ApiQuery({ name: "offset", type: Number, required: true })
  @ApiQuery({ name: "limit", type: Number, required: true })
  @ApiResponse({ status: 200, description: "Get all questions successfully" })
  @ApiResponse({ status: 400, description: "Invalid query param" })
  @Get("questions")
  getQuestions(
    @Query("offset", new ParseIntPipe()) offset: number,
    @Query("limit", new ParseIntPipe()) limit: number,
    @Query("contentType", new ParseListStringEnumPipe(ContentTypeEnum, "+")) listContentTypes?: ContentTypeEnum[],
    @Query("cerfLevel", new ParseEnumPipe(CEFRLevelEum, { optional: true })) cefrLevel?: CEFRLevelEum
  ) {
    return this.adminService.getQuestions({ listContentTypes, cefrLevel, offset, limit });
  }

  @ApiOperation({ summary: "Update a question" })
  @ApiBody({ type: UpdateQuestionDto })
  @ApiResponse({ status: 200, description: "Question updated" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @Put("questions/:id")
  updateQuestion(@Param("id") id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.adminService.updateQuestion(id, updateQuestionDto);
  }

  @ApiOperation({ summary: "Create a question type" })
  @ApiBody({ type: CreateQuestionTypeDto })
  @ApiResponse({ status: 201, description: "Question type created" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Post("question-types")
  createQuestionType(@Body() dto: CreateQuestionTypeDto) {
    return this.adminService.createQuestionType(dto);
  }

  @ApiOperation({ summary: "Get all question types" })
  @ApiResponse({ status: 200, description: "Get all question types successfully" })
  @ApiResponse({ status: 400, description: "Error" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Get("question-types")
  getQuestionTypes() {
    return this.adminService.getQuestionTypes();
  }

  @ApiOperation({ summary: "Get all lessons in a question type" })
  @ApiResponse({ status: 200, description: "Get all lessons in a question type successfully" })
  @ApiResponse({ status: 400, description: "Error" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Get("question-types/:id")
  getQuestionType(@Param("id", new ParseIntPipe()) id: number) {
    return this.adminService.getListLessonsInQuestionType(id);
  }

  @ApiOperation({ summary: "Update a question type" })
  @ApiBody({ type: UpdateQuestionTypeDto })
  @ApiResponse({ status: 200, description: "Question type updated" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Put("question-types/:id")
  updateQuestionType(@Param("id", new ParseIntPipe()) id: number, @Body() dto: UpdateQuestionTypeDto) {
    return this.adminService.updateQuestionType(id, dto);
  }

  @ApiOperation({ summary: "Assign questions to a lesson" })
  @ApiBody({ type: AssignQuestionsToLessonDto })
  @ApiResponse({ status: 200, description: "Questions assigned to lesson" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @Put("lessons/:id/assignments")
  assignQuestionToLesson(@Param("id", new ParseIntPipe()) id: number, @Body() dto: AssignQuestionsToLessonDto) {
    return this.adminService.assignQuestionsToLesson(id, dto);
  }
}
