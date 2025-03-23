import { Test, TestingModule } from "@nestjs/testing";
import { MissionHelper } from "./mission.helper";
import { IMission, IProfileMissionProgress } from "@app/types/interfaces";
import { ProfileMissionProgressStatusEnum } from "@app/types/enums";
import { LessonRecord } from "@app/database";
import { dailyMissionMock } from "./test/mission.mock";
import { getProfileMissionProgressesResponseMock } from "./test/responses.mock";

describe("MissionHelper", () => {
  let missionHelper: MissionHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MissionHelper],
    }).compile();

    missionHelper = module.get<MissionHelper>(MissionHelper);
  });

  it("should be defined", () => {
    expect(missionHelper).toBeDefined();
  });

  describe("buildMissionsResponseData", () => {
    it("should return an empty array if no missions are provided", async () => {
      const result = await missionHelper.buildMissionsResponseData([], []);
      expect(result).toEqual([]);
    });

    it("should build mission response data correctly", async () => {
      const profileProgress: IProfileMissionProgress[] = [
        {
          missionId: "1",
          profileId: "1",
          current: 5,
          status: ProfileMissionProgressStatusEnum.COMPLETED,
          mission: dailyMissionMock,
          id: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          profile: undefined,
        },
      ];

      const missions: IMission[] = [dailyMissionMock];

      jest.spyOn(LessonRecord, "countMaxConsecutiveLearningLessonDate").mockResolvedValue(10);

      const result = await missionHelper.buildMissionsResponseData(profileProgress, missions);
      expect(result).toEqual(getProfileMissionProgressesResponseMock);
    });
  });
});
