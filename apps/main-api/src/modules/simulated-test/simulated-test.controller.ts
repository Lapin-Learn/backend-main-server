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
import { ApiDefaultResponses, ApiPaginatedResponse } from "../../decorators";
import { ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SimulatedIeltsTestDetailDto, TestCollectionDto } from "@app/types/response-dtos";

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
    @Query("keyword") keyword: string = ""
  ) {
    return this.simulatedTestService.getCollectionsWithSimulatedTest(offset, limit, keyword);
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
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.simulatedTestService.getSimulatedTestsInCollections(collectionId, offset, limit);
  }

  @ApiParam({ name: "id", type: Number, required: true })
  @ApiResponse({ type: SimulatedIeltsTestDetailDto })
  @Get("simulated-tests/:id")
  async getSimulatedTestInfo(@Param("id", ParseIntPipe) testId: number) {
    return this.simulatedTestService.getSimulatedTestInfo(testId);
  }
}
