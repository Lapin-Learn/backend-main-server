import { Test, TestingModule } from "@nestjs/testing";
import { MissionProcessor } from "./mission.processor";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Mission, Quest } from "@app/database";
import { BullModule, getQueueToken } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { MISSION_CRON_JOB } from "@app/types/constants";

jest.mock("@app/database");
jest.mock("moment-timezone", () => {
  const originalMoment = jest.requireActual("moment-timezone");
  return {
    ...originalMoment,
    tz: jest.fn().mockReturnThis(),
    date: jest.fn().mockReturnValue(1),
  };
});

describe("MissionProcessor", () => {
  let processor: MissionProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: MISSION_CRON_JOB,
        }),
      ],
      providers: [
        MissionProcessor,
        {
          provide: getRepositoryToken(Mission),
          useClass: Mission,
        },
        {
          provide: getRepositoryToken(Quest),
          useClass: Quest,
        },
        {
          provide: getQueueToken(MISSION_CRON_JOB),
          useValue: {
            add: jest.fn(),
            process: jest.fn(),
          },
        },
        Logger,
      ],
    }).compile();

    processor = module.get<MissionProcessor>(MissionProcessor);
  });

  it("should be defined", () => {
    expect(processor).toBeDefined();
  });
});
