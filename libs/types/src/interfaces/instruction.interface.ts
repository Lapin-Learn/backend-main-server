import { IBucket } from "./bucket.interface";
import { ILesson } from "./lesson.interface";

export interface IInstruction {
  id: string;
  content: string;
  order: number;
  imageId: string;
  audioId: string;
  lessonId: number;
  createdAt: Date;
  updatedAt: Date;

  readonly lesson: ILesson;
  readonly image: IBucket;
  readonly audio: IBucket;
}
