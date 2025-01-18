import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { SimulatedTestService } from "./simulated-test.service";
import { PaginationInterceptor } from "@app/utils/interceptors";
import { FirebaseJwtAuthGuard } from "../../guards";
import { ApiDefaultResponses, ApiPaginatedResponse, CurrentUser } from "../../decorators";
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SimulatedIeltsTestDetailDto, TestCollectionDto } from "@app/types/response-dtos";
import { ICurrentUser } from "@app/types/interfaces";
import { GetSessionProgressDto, StartSessionDto, UpdateSessionDto } from "@app/types/dtos/simulated-tests";
import { SkillEnum } from "@app/types/enums";
import { FilesInterceptor } from "@nestjs/platform-express";
import { plainToInstance } from "class-transformer";

@ApiTags("Simulated tests")
@ApiDefaultResponses()
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Controller()
export class SimulatedTestController {
  constructor(private readonly simulatedTestService: SimulatedTestService) {}

  @ApiQuery({ name: "offset", type: Number, required: false })
  @ApiQuery({ name: "limit", type: Number, required: false })
  @ApiQuery({ name: "keyword", type: String, required: false })
  @ApiPaginatedResponse(TestCollectionDto)
  @UseInterceptors(ClassSerializerInterceptor, PaginationInterceptor)
  @Get("collections")
  async getCollectionWithSimulatedTest(
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("keyword") keyword: string = "",
    @CurrentUser() user: ICurrentUser
  ) {
    return this.simulatedTestService.getCollectionsWithSimulatedTest(offset, limit, keyword, user.profileId);
  }

  @ApiParam({ name: "id", type: Number, required: true })
  @ApiQuery({ name: "offset", type: Number, required: false })
  @ApiQuery({ name: "limit", type: Number, required: false })
  @ApiPaginatedResponse(SimulatedIeltsTestDetailDto)
  @Get("collections/:id/simulated-tests")
  @UseInterceptors(PaginationInterceptor)
  async getSimulatedTestsOfCollection(
    @Param("id", ParseIntPipe) collectionId: number,
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @CurrentUser() user: ICurrentUser
  ) {
    return this.simulatedTestService.getSimulatedTestsInCollections(collectionId, offset, limit, user.profileId);
  }

  @ApiQuery({ name: "offset", type: Number, required: false })
  @ApiQuery({ name: "limit", type: Number, required: false })
  @Get("simulated-tests/sessions")
  @UseInterceptors(PaginationInterceptor)
  async getSessionHistory(
    @CurrentUser() learner: ICurrentUser,
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.simulatedTestService.getSessionHistory(learner, offset, limit);
  }

  @ApiQuery({ name: "offset", type: Number, required: false })
  @ApiQuery({ name: "limit", type: Number, required: false })
  @ApiQuery({ name: "skill", enum: SkillEnum, required: false })
  @Get("simulated-tests/:id/sessions")
  @UseInterceptors(PaginationInterceptor)
  async getSessionHistoryOfSimulatedTest(
    @CurrentUser() learner: ICurrentUser,
    @Param("id", ParseIntPipe) simulatedTestId: number,
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("skill") skill?: SkillEnum
  ) {
    return this.simulatedTestService.getSessionHistory(learner, offset, limit, { simulatedTestId, skill });
  }

  @Get("simulated-tests/report")
  async getBandScoreReport(@CurrentUser() learner: ICurrentUser) {
    return this.simulatedTestService.getBandScoreReport(learner);
  }

  @ApiBody({ type: StartSessionDto })
  @ApiResponse({ type: String })
  @Post("simulated-tests/sessions")
  async startSession(@CurrentUser() learner: ICurrentUser, @Body() sessionData: StartSessionDto) {
    return this.simulatedTestService.startSession(learner, sessionData);
  }

  @ApiParam({ name: "id", type: Number, required: true })
  @Get("simulated-tests/sessions/:id")
  async getSessionDetail(@CurrentUser() learner: ICurrentUser, @Param("id", ParseIntPipe) sessionId: number) {
    return this.simulatedTestService.getSessionDetail(sessionId, learner);
  }

  @ApiParam({ name: "id", type: Number, required: true })
  @ApiBody({ type: UpdateSessionDto })
  @ApiResponse({ type: String })
  @UseInterceptors(FilesInterceptor("files"))
  @Put("simulated-tests/sessions/:id")
  async updateSession(
    @Param("id", ParseIntPipe) sessionId: number,
    @CurrentUser() learner: ICurrentUser,
    @Body() sessionData: any,
    @UploadedFiles() files?: Array<Express.Multer.File>
  ) {
    console.log("sessionData: ", sessionData);
    sessionData.response = JSON.parse(sessionData.response);
    const data: UpdateSessionDto = plainToInstance(UpdateSessionDto, sessionData);

    return this.simulatedTestService.updateSession(sessionId, data, learner, files);
  }

  @ApiParam({ name: "id", type: Number, required: true })
  @ApiResponse({ type: SimulatedIeltsTestDetailDto })
  @Get("simulated-tests/:id")
  async getSimulatedTestInfo(@Param("id", ParseIntPipe) testId: number) {
    return this.simulatedTestService.getSimulatedTestInfo(testId);
  }

  @ApiParam({ name: "id", type: Number, required: true })
  @ApiQuery({ name: "part", type: Number, required: true })
  @Get("skill-tests/:id")
  async getPassageContents(@Param("id", ParseIntPipe) skillTestId: number, @Query("part", ParseIntPipe) part: number) {
    return this.simulatedTestService.getSkillTestContent(skillTestId, part);
  }

  @ApiQuery({ name: "skill", enum: SkillEnum, required: true })
  @ApiQuery({ name: "from", type: Date, required: false })
  @ApiQuery({ name: "to", type: Date, required: false })
  @Get("sessions/progress")
  async getSessionProgress(@CurrentUser() learner: ICurrentUser, @Query() query: GetSessionProgressDto) {
    return this.simulatedTestService.getSessionProgress(learner, query);
  }

  @ApiQuery({ name: "skill", enum: SkillEnum, required: true })
  @Get("question-types/accuracy")
  async getQuestionTypesAccuract(
    @CurrentUser() learner: ICurrentUser,
    @Query("skill", new ParseEnumPipe(SkillEnum)) skill: SkillEnum
  ) {
    return this.simulatedTestService.getQuestionTypeAccuracy(learner, skill);
  }
}
