import {
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { SimulatedTestService } from "./simulated-test.service";
import { PaginationInterceptor } from "@app/utils/interceptors";
import { FirebaseJwtAuthGuard } from "../../guards";
import { ApiDefaultResponses, ApiPaginatedResponse } from "../../decorators";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { TestCollectionDto } from "@app/types/response-dtos";

@ApiTags("Simulated tests")
@ApiDefaultResponses()
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Controller("simulated-test")
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
}
