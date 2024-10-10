import { Injectable, Logger } from "@nestjs/common";
import { MissionAbstract } from "@app/types/abstracts";
import { ICurrentUser } from "@app/types/interfaces";
import { ProfileMission } from "@app/database";
import { MissionCategoryNameEnum, ProfileMissionStatusEnum } from "@app/types/enums";
import { MissionCategoryMap } from "@app/utils/maps";
import { LessonMission, StreakMission } from "@app/utils/classes/missions";

@Injectable()
export class MissionService {
  private _listMissions: MissionAbstract[];
  private readonly logger = new Logger(MissionService.name);
  private readonly _lessonRecordId: string;

  constructor(lessonRecordId: string) {
    this._listMissions = [];
    this._lessonRecordId = lessonRecordId;
  }

  async isMissionsCompleted(learner: ICurrentUser): Promise<boolean> {
    try {
      const dailyMissions = await ProfileMission.find({
        where: { profileId: learner.profileId, status: ProfileMissionStatusEnum.ASSIGNED },
        relations: {
          mission: true,
        },
      });

      for (const m of dailyMissions) {
        const missionName = m.mission.quest.name;
        if (MissionCategoryMap.get(MissionCategoryNameEnum.LESSON_MISSION).includes(missionName)) {
          this._listMissions.push(new LessonMission(missionName, this._lessonRecordId));
        } else if (MissionCategoryMap.get(MissionCategoryNameEnum.STREAK_MISSION).includes(missionName)) {
          this._listMissions.push(new StreakMission(missionName, learner));
        }
      }
      return this._listMissions.every((mission) => mission.isMissionCompleted());
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
