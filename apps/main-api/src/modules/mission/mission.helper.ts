import { IMission, IProfileMissionProgress } from "@app/types/interfaces";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MissionHelper {
  buildMissionsResponseData(profileProgress: IProfileMissionProgress[], missions: IMission[]) {
    return missions.length === 0
      ? []
      : missions.map((mission) => {
          const progress = profileProgress.find((item) => item.missionId === mission.id);
          return {
            interval: mission.type,
            name: mission.quest.name,
            description: mission.quest.description,
            current: progress?.current || 0,
            quantity: mission.quantity,
            rewards: mission.quest.rewards,
          };
        });
  }
}
