import { MissionServiceAbstract } from "@app/types/abstracts";

export class StreakMission extends MissionServiceAbstract {
  async isMissionCompleted(): Promise<boolean> {
    return true;
  }
}
