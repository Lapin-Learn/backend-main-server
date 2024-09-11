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
import { Instruction } from "./instruction.entity";
import { QuestionToLesson } from "./question-to-lesson.entity";
import { LessonProcess } from "./lesson-process.entity";

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

  @OneToMany(() => LessonProcess, (lessonProcess) => lessonProcess.lesson)
  readonly lessonProcesses: LessonProcess[];

  @OneToMany(() => Instruction, (instruction) => instruction.lesson)
  readonly instructions: Instruction[];

  @OneToMany(() => QuestionToLesson, (questionToLesson) => questionToLesson.lesson)
  readonly questionToLessons: QuestionToLesson[];

  static async getContentOfLesson(questionTypeId: number) {
    return this.createQueryBuilder("lesson")
      .select(["lesson.id", "lesson.name", "lesson.order", "lesson.questionTypeId"])
      .leftJoinAndSelect("lesson.instructions", "instruction")
      .addOrderBy("instruction.order", "ASC")
      .leftJoin("lesson.questionToLessons", "questions")
      .addSelect(["questions.order", "questions.questionId"])
      .addOrderBy("questions.order", "ASC")
      .leftJoinAndSelect("questions.question", "question")
      .where("lesson.questionTypeId = :questionTypeId", { questionTypeId })
      .addOrderBy("lesson.order", "ASC")
      .getMany();
  }
}