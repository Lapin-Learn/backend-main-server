import { listeningBandScoreRanges, readingBandScoreRanges } from "@app/types/constants";
import { SkillEnum } from "@app/types/enums";
import { IBandScoreRange } from "@app/types/interfaces";

export const bandScoreRangeMap = new Map<SkillEnum, IBandScoreRange[]>([
  [SkillEnum.READING, readingBandScoreRanges],
  [SkillEnum.LISTENING, listeningBandScoreRanges],
]);
