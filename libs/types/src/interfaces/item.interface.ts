import { IProfileItem } from "./profile-item.interface";

export interface IItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly profileItems: IProfileItem[];
}
