import { RankEnum } from "@app/types/enums";
import { ILevel, IMileStoneInfo } from "@app/types/interfaces";

export type TMileStoneProfile = IMileStoneInfo<number> | IMileStoneInfo<RankEnum> | IMileStoneInfo<ILevel>;
