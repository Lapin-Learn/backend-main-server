export abstract class MissionServiceAbstract {
  abstract isMissionCompleted(): Promise<boolean>;
}
