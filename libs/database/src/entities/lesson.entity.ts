import { ILesson } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { QuestionType } from "./question-type.entity";
import { QuestionToLesson } from "./question-to-lesson.entity";
import { LessonRecord } from "./lesson-record.entity";
import { LessonProcess } from "./lesson-process.entity";
import { BandScoreEnum } from "@app/types/enums";

@Entity({ name: "lessons" })
export class Lesson extends BaseEntity implements ILesson {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "order", type: "int", nullable: false })
  order: number;

  @Column({ name: "question_type_id", type: "int", nullable: false })
  questionTypeId: number;

  @Column({ name: "band_score", type: "enum", enum: BandScoreEnum, nullable: false })
  bandScore: BandScoreEnum;

  @CreateDateColumn({ name: "created_at", type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @ManyToOne(() => QuestionType, (questionType) => questionType.lessons)
  @JoinColumn({ name: "question_type_id", referencedColumnName: "id" })
  readonly questionType: QuestionType;

  @OneToMany(() => LessonRecord, (lessonRecord) => lessonRecord.lesson)
  readonly lessonRecords: LessonRecord[];

  @OneToMany(() => QuestionToLesson, (questionToLesson) => questionToLesson.lesson)
  readonly questionToLessons: QuestionToLesson[];

  @OneToMany(() => LessonProcess, (lessonProcess) => lessonProcess.currentLesson)
  readonly lessonProcesses: LessonProcess[];

  static async getContentOfLesson(lessonId: number) {
    return this.createQueryBuilder("lesson")
      .select(["lesson.id", "lesson.name", "lesson.order"])
      .leftJoin("lesson.questionToLessons", "questions")
      .addSelect(["questions.order", "questions.questionId"])
      .addOrderBy("questions.order", "ASC")
      .leftJoinAndSelect("questions.question", "question")
      .leftJoinAndSelect("question.image", "image")
      .leftJoinAndSelect("question.audio", "audio")
      .where("lesson.id = :lessonId", { lessonId })
      .getOne();
  }
}
