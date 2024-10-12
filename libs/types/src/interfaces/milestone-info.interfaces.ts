import { MileStonesEnum } from "@app/types/enums";

export interface IMileStoneInfo<T> {
  type: MileStonesEnum;
  newValue: T;
}
