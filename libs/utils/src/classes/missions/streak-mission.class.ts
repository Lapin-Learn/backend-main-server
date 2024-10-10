import { MissionAbstract } from "@app/types/abstracts";

export class StreakMission extends MissionAbstract {
  isMissionCompleted(): boolean {
    return true;
  }
}
