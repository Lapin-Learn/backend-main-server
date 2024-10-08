import { BandScoreEnum } from "@app/types/enums";

export const NextBandScoreMap = new Map<BandScoreEnum, BandScoreEnum>([
  [BandScoreEnum.PRE_IELTS, BandScoreEnum.BAND_4_5],
  [BandScoreEnum.BAND_4_5, BandScoreEnum.BAND_5_0],
  [BandScoreEnum.BAND_5_0, BandScoreEnum.BAND_5_5],
  [BandScoreEnum.BAND_5_5, BandScoreEnum.BAND_6_0],
  [BandScoreEnum.BAND_6_0, BandScoreEnum.BAND_6_5],
  [BandScoreEnum.BAND_6_5, BandScoreEnum.BAND_7_0],
]);
