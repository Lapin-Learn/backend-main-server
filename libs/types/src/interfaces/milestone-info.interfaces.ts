import { MileStonesEnum, RankEnum } from "@app/types/enums";
import { ILevel } from "@app/types/interfaces/level.interface";

export interface IMileStoneInfo {
  type: MileStonesEnum;
  newValue: ILevel | RankEnum;
}
