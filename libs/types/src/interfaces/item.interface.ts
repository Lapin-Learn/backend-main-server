import { IProfileItem } from "./profile-item.interface";

export interface IItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;

  // Relations
  readonly profileItems: IProfileItem[];
}
