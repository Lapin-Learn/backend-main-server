import { MissionProcessor } from "./mission.processor";
import { MissionService } from "./mission.service";
import { Repository } from "typeorm";
import { LearnerProfile, Mission, ProfileMissionProgress } from "@app/database";
import { MissionHelper } from "./mission.helper";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BullModule, getQueueToken } from "@nestjs/bullmq";
import { currentUserStub, learnerProfile } from "../user/test/user.stub";
import { dailyMissionMock } from "./test/mission.mock";
import { ProfileMissionProgressStatusEnum } from "@app/types/enums";
import { ConfigService } from "@nestjs/config";

jest.mock("./mission.helper");

describe("MissionService", function () {
  let service: MissionService;
  let learnerProfileRepository: Repository<LearnerProfile>;
  let missionHelper: MissionHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: "mission-cron-job",
        }),
      ],
      providers: [
        MissionService,
        MissionHelper,
        MissionProcessor,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Mission),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(LearnerProfile),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ProfileMissionProgress),
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
    service = module.get<MissionService>(MissionService);
    missionHelper = module.get<MissionHelper>(MissionHelper);
    learnerProfileRepository = module.get(getRepositoryToken(LearnerProfile));
    jest.spyOn(learnerProfileRepository, "save").mockResolvedValue(learnerProfile as LearnerProfile);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getMissions", () => {
    it("should return missions array", async () => {
      const missions = [];
      const user = currentUserStub();
      jest.spyOn(Mission, "getMissions").mockResolvedValue(missions);
      jest.spyOn(ProfileMissionProgress, "getMissionProgresses").mockResolvedValue([]);
      jest.spyOn(missionHelper, "buildMissionsResponseData").mockReturnValue([]);
      expect(await service.getMissions(user)).toBeInstanceOf(Array);
    });

    it("should format missions", async () => {
      const missions = [];
      const user = currentUserStub();
      jest.spyOn(Mission, "getMissions").mockResolvedValue(missions);
      jest.spyOn(ProfileMissionProgress, "getMissionProgresses").mockResolvedValue([]);
      jest.spyOn(missionHelper, "buildMissionsResponseData").mockReturnValue([]);
      await service.getMissions(user);
      expect(missionHelper.buildMissionsResponseData).toHaveBeenCalled();
    });

    it("should throw BadRequestException on error", async () => {
      jest.spyOn(Mission, "getMissions").mockRejectedValue(new Error());
      await expect(service.getMissions(currentUserStub())).rejects.toThrow();
    });
  });

  describe("receiveRewards", () => {
    it("should not return bonus", async () => {
      const profileMissionProgress = [];
      jest.spyOn(ProfileMissionProgress, "getCompletedMissionProgresses").mockResolvedValue(profileMissionProgress);
      expect(await service.receiveRewards(currentUserStub())).toEqual({ bonusXP: 0, bonusCarrot: 0 });
    });

    it("should return bonus", async () => {
      const profileMissionProgress = [
        {
          id: "1",
          missionId: "1",
          profileId: "1",
          current: 5,
          status: ProfileMissionProgressStatusEnum.COMPLETED,
          profile: learnerProfile,
          createdAt: new Date(),
          updatedAt: new Date(),
          mission: {
            ...dailyMissionMock,
            getBonusResources: jest.fn().mockReturnValue({ bonusXP: 1, bonusCarrot: 2 }),
          },
        } as unknown as ProfileMissionProgress,
      ];
      jest.spyOn(ProfileMissionProgress, "getCompletedMissionProgresses").mockResolvedValue(profileMissionProgress);
      jest.spyOn(LearnerProfile, "findOneOrFail").mockResolvedValue(learnerProfile as LearnerProfile);
      jest.spyOn(LearnerProfile, "save").mockResolvedValue(learnerProfile as LearnerProfile);
      jest.spyOn(ProfileMissionProgress, "save").mockResolvedValue(profileMissionProgress[0] as ProfileMissionProgress);
      await service.receiveRewards(currentUserStub());
      expect(await service.receiveRewards(currentUserStub())).toEqual({ bonusXP: 1, bonusCarrot: 2 });
    });

    it("should throw BadRequestException on error", async () => {
      jest.spyOn(ProfileMissionProgress, "getCompletedMissionProgresses").mockRejectedValue(new Error());
      await expect(service.receiveRewards(currentUserStub())).rejects.toThrow();
    });
  });
});
