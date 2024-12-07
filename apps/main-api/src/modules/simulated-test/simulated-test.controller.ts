import { ClassSerializerInterceptor, Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { SimulatedTestService } from "./simulated-test.service";

@Controller("simulated-test")
export class SimulatedTestController {
  constructor(private readonly simulatedTestService: SimulatedTestService) {}
  @UseInterceptors(ClassSerializerInterceptor)
  @Get("collections")
  async getAllSimulatedTest(@Query() params: { offset: number; limit: number }) {
    const { offset, limit } = params;
    return this.simulatedTestService.getAllSimulatedTest(offset, limit);
  }
}
