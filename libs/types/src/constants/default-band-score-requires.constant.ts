import { IBandScoreRequire } from "@app/types/interfaces";
import { BandScoreEnum } from "@app/types/enums";

export const DEFAULT_BAND_SCORE_REQUIRES: IBandScoreRequire[] = [
  {
    bandScore: BandScoreEnum.PRE_IELTS,
    requireXP: 500,
    jumpBandPercentage: 0.5,
  },
  {
    bandScore: BandScoreEnum.BAND_4_5,
    requireXP: 500,
    jumpBandPercentage: 0.6,
  },
  {
    bandScore: BandScoreEnum.BAND_5_0,
    requireXP: 500,
    jumpBandPercentage: 0.7,
  },
  {
    bandScore: BandScoreEnum.BAND_5_5,
    requireXP: 500,
    jumpBandPercentage: 0.8,
  },
  {
    bandScore: BandScoreEnum.BAND_6_0,
    requireXP: 500,
    jumpBandPercentage: 0.9,
  },
  {
    bandScore: BandScoreEnum.BAND_6_5,
    requireXP: 500,
    jumpBandPercentage: 1,
  },
  {
    bandScore: BandScoreEnum.BAND_7_0,
    requireXP: 500,
    jumpBandPercentage: 1,
  },
];
