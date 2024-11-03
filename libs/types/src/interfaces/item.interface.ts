import { ItemCategoryEnum } from "../enums";
import { IBucket } from "./bucket.interface";
import { IProfileItem } from "./profile-item.interface";

export interface IItem {
  id: string;
  name: string;
  description: string;
  price: object;
  duration: number;
  imageId: string;
  category: ItemCategoryEnum;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly profileItems: IProfileItem[];
  readonly image: IBucket;
}
