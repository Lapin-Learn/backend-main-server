import { Test, TestingModule } from "@nestjs/testing";
import { SimulatedTestController } from "./simulated-test.controller";
import { SimulatedTestService } from "./simulated-test.service";

describe("SimulatedTestController", () => {
  let controller: SimulatedTestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SimulatedTestController],
      providers: [SimulatedTestService],
    }).compile();

    controller = module.get<SimulatedTestController>(SimulatedTestController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
