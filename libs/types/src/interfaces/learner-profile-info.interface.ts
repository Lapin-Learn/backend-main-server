import { ILearnerProfile } from "@app/types/interfaces/learner-profile.interface";
import { IItem } from "@app/types/interfaces/item.interface";

export interface ILearnerProfileInfo
  extends Pick<ILearnerProfile, "id" | "rank" | "xp" | "carrots" | "level" | "streak"> {
  currentItems: IItem[];
}
