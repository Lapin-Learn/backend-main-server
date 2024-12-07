import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { SimulatedTestService } from "./simulated-test.service";
import { PaginationInterceptor } from "@app/utils/interceptors";
import { FirebaseJwtAuthGuard } from "../../guards";

@UseGuards(FirebaseJwtAuthGuard)
@Controller("simulated-test")
export class SimulatedTestController {
  constructor(private readonly simulatedTestService: SimulatedTestService) {}

  @UseInterceptors(ClassSerializerInterceptor, PaginationInterceptor)
  @Get("collections")
  async getAllSimulatedTest(
    @Query("offset", ParseIntPipe) offset: number,
    @Query("limit", ParseIntPipe) limit: number
  ) {
    return this.simulatedTestService.getAllSimulatedTest(offset, limit);
  }
}
