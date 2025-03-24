import { Test, TestingModule } from "@nestjs/testing";
import { MissionModule } from "./mission.module";
import { MissionService } from "./mission.service";
import { MissionController } from "./mission.controller";
import { MissionHelper } from "./mission.helper";
import { MissionProcessor } from "./mission.processor";
import { BullModule } from "@nestjs/bullmq";
import { ScheduleModule } from "@nestjs/schedule";
import { MISSION_CRON_JOB } from "@app/types/constants";

describe("MissionModule", () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ScheduleModule.forRoot(),
        BullModule.registerQueue({
          name: MISSION_CRON_JOB,
        }),
        MissionModule,
      ],
    }).compile();
  });

  it("should compile the module", () => {
    expect(module).toBeDefined();
  });

  it("should provide MissionService", () => {
    const service = module.get<MissionService>(MissionService);
    expect(service).toBeDefined();
  });

  it("should provide MissionController", () => {
    const controller = module.get<MissionController>(MissionController);
    expect(controller).toBeDefined();
  });

  it("should provide MissionHelper", () => {
    const helper = module.get<MissionHelper>(MissionHelper);
    expect(helper).toBeDefined();
  });

  it("should provide MissionProcessor", () => {
    const processor = module.get<MissionProcessor>(MissionProcessor);
    expect(processor).toBeDefined();
  });
});
