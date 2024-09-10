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

  @OneToMany(() => Instruction, (instruction) => instruction.lesson)
  readonly instructions: Instruction[];

  @OneToMany(() => QuestionToLesson, (questionToLesson) => questionToLesson.lesson)
  readonly questionToLessons: QuestionToLesson[];
}
