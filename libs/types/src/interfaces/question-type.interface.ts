import { SkillEnum } from "../enums";
import { IBucket } from "./bucket.interface";
import { IInstruction } from "./instruction.interface";
import { ILessonProcess } from "./lesson-process.interface";
import { ILesson } from "./lesson.interface";
import { IBandScoreRequire } from "@app/types/interfaces/band-score-require.interface";

export interface IQuestionType {
  id: number;
  name: string;
  skill: SkillEnum;
  imageId: string;
  bandScoreRequires: IBandScoreRequire[];
  createdAt: Date;
  updatedAt: Date;

  // Relations
  readonly image: IBucket;
  readonly lessons: ILesson[];
  readonly lessonProcesses: ILessonProcess[];
  readonly instructions: IInstruction[];
}
