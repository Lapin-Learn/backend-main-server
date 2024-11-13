import { Test, TestingModule } from "@nestjs/testing";
import { MissionService } from "./mission.service";
import { MissionHelper } from "./mission.helper";

describe("MissionService", () => {
  let service: MissionService;
  let helper: MissionHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MissionService, MissionHelper],
    }).compile();

    service = module.get<MissionService>(MissionService);
    helper = module.get<MissionHelper>(MissionHelper);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should be defined", () => {
    expect(helper).toBeDefined();
  });
});
