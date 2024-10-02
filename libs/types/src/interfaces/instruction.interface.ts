import { IBucket } from "./bucket.interface";
import { IQuestionType } from "./question-type.interface";

export interface IInstruction {
  id: string;
  content: string;
  imageId: string;
  audioId: string;
  questionTypeId: number;
  createdAt: Date;
  updatedAt: Date;

  readonly questionType: IQuestionType;
  readonly image: IBucket;
  readonly audio: IBucket;
}
