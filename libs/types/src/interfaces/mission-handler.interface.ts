export abstract class MissionHandler {
  abstract isMissionCompleted(): Promise<boolean>;
  abstract getCurrentProgress(): Promise<number>;
}
