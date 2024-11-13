import { IQuestionToLesson } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Question } from "./question.entity";
import { Lesson } from "./lesson.entity";

@Entity({ name: "questions_to_lessons" })
export class QuestionToLesson extends BaseEntity implements IQuestionToLesson {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "question_id", type: "uuid", nullable: false })
  questionId: string;

  @Column({ name: "lesson_id", type: "int", nullable: false })
  lessonId: number;

  @Column({ name: "order", type: "int", nullable: false })
  order: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @ManyToOne(() => Question, (question) => question.questionToLessons)
  @JoinColumn({ name: "question_id", referencedColumnName: "id" })
  readonly question: Question;

  @ManyToOne(() => Lesson, (lesson) => lesson.questionToLessons)
  @JoinColumn({ name: "lesson_id", referencedColumnName: "id" })
  readonly lesson: Lesson;
}
