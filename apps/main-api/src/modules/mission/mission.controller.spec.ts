import { Test, TestingModule } from "@nestjs/testing";
import { MissionController } from "./mission.controller";
import { MissionService } from "./mission.service";
import { MissionHelper } from "./mission.helper";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Mission } from "@app/database";
import { Repository } from "typeorm";
import { BullModule, getQueueToken } from "@nestjs/bullmq";

jest.mock("./mission.service");
jest.mock("./mission.helper");

describe("MissionController", () => {
  let controller: MissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: "mission-cron-job",
        }),
      ],
      controllers: [MissionController],
      providers: [
        MissionService,
        MissionHelper,
        {
          provide: getRepositoryToken(Mission),
          useClass: Repository,
        },
        {
          provide: getQueueToken("mission-cron-job"),
          useValue: {
            add: jest.fn(),
            process: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MissionController>(MissionController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
