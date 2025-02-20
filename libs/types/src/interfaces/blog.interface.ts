import { IBucket } from "./bucket.interface";

export interface IBlog {
  id: string;
  title: string;
  content: string;
  thumbnailId: string;
  createdAt: Date;
  updatedAt: Date;

  readonly thumbnail: IBucket;
}
