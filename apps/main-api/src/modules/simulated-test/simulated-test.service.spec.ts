import { Test, TestingModule } from "@nestjs/testing";
import { SimulatedTestService } from "./simulated-test.service";

describe("SimulatedTestService", () => {
  let service: SimulatedTestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SimulatedTestService],
    }).compile();

    service = module.get<SimulatedTestService>(SimulatedTestService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
