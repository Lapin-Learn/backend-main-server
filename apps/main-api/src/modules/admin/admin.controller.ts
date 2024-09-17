import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import {
  CreateLessonDto,
  CreateQuestionDto,
  CreateQuestionTypeDto,
  UpdateQuestionDto,
  UpdateQuestionTypeDto,
} from "@app/types/dtos/admin";
import { FirebaseJwtAuthGuard, RoleGuard } from "../../guards";
import { Roles } from "../../decorators";
import { AccountRoleEnum } from "@app/types/enums";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

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

  @ApiOperation({ summary: "Get all questions grouped by question type" })
  @ApiResponse({ status: 200, description: "Get all questions successfully" })
  @ApiResponse({ status: 400, description: "Error" })
  @Get("questions")
  getQuestions() {
    return this.adminService.getQuestions();
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
}
