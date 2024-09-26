import { ContentTypeEnum, CEFRLevelEum } from "../enums";
import { IBucket } from "./bucket.interface";
import { IQuestionToLesson } from "./question-to-lesson.interface";

export interface IQuestion {
  id: string;
  contentType: ContentTypeEnum;
  content: object;
  imageId: string;
  audioId: string;
  cefrLevel: CEFRLevelEum;
  explanation: string;
  createdAt: Date;
  updatedAt: Date;

  readonly questionToLessons: IQuestionToLesson[];
  readonly image: IBucket;
  readonly audio: IBucket;
}
