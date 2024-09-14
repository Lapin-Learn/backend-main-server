import { SkillEnum } from "../enums";
import { IBucket } from "./bucket.interface";
import { ILessonProcess } from "./lesson-process.interface";
import { ILesson } from "./lesson.interface";

export interface IQuestionType {
  id: number;
  name: string;
  skill: SkillEnum;
  imageId: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly image: IBucket;
  readonly lessons: ILesson[];
  readonly lessonProcesses: ILessonProcess[];
}
