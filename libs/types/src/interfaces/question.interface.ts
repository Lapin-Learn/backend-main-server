import { ContentTypeEnum, LevelEnum } from "../enums";
import { IBucket } from "./bucket.interface";
import { IQuestionToLesson } from "./question-to-lesson.interface";

export interface IQuestion {
  id: string;
  contentType: ContentTypeEnum;
  contentId: string;
  imageId: string;
  audioId: string;
  level: LevelEnum;
  explanation: string;
  createdAt: Date;
  updatedAt: Date;

  readonly questionToLessons: IQuestionToLesson[];
  readonly image: IBucket;
  readonly audio: IBucket;
}
