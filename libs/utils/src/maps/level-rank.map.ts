import { RankEnum } from "@app/types/enums";

export const LevelRankMap = new Map<number, RankEnum>([
  [1, RankEnum.BRONZE],
  [10, RankEnum.SILVER],
  [20, RankEnum.GOLD],
  [50, RankEnum.PLATINUM],
  [100, RankEnum.DIAMOND],
  [150, RankEnum.MASTER],
]);
