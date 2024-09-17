import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CreateLessonDto, CreateQuestionDto, UpdateQuestionDto } from "@app/types/dtos/admin";
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
}
