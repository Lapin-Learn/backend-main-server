import { RankEnum } from "@app/types/enums";

export const LevelRankMap = new Map<number, RankEnum>([
  [1, RankEnum.BRONZE],
  [2, RankEnum.SILVER],
  [3, RankEnum.GOLD],
  [30, RankEnum.PLATINUM],
  [40, RankEnum.DIAMOND],
  [50, RankEnum.MASTER],
]);
