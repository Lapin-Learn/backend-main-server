import {
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { SimulatedTestService } from "./simulated-test.service";
import { PaginationInterceptor } from "@app/utils/interceptors";
import { FirebaseJwtAuthGuard } from "../../guards";
import { ApiDefaultResponses, ApiPaginatedResponse, CurrentUser } from "../../decorators";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SimulatedIeltsTestDetailDto, TestCollectionDto } from "@app/types/response-dtos";
import { ICurrentUser } from "@app/types/interfaces";
import { SkillEnum } from "@app/types/enums";

@ApiTags("Simulated tests")
@ApiDefaultResponses()
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Controller()
export class SimulatedTestController {
  constructor(private readonly simulatedTestService: SimulatedTestService) {}

  @ApiOperation({ summary: "Get all ST collections" })
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

  @ApiOperation({ summary: "Get average band scores of 4 skills all time" })
  @Get("simulated-tests/report")
  async getBandScoreReport(@CurrentUser() learner: ICurrentUser) {
    return this.simulatedTestService.getBandScoreReport(learner);
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
}
