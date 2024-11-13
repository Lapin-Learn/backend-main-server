import { MissionServiceAbstract } from "@app/types/abstracts";

export class DefaultMission extends MissionServiceAbstract {
  async isMissionCompleted(): Promise<boolean> {
    return false;
  }
}
