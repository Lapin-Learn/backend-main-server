import { BandScoreEnum } from "@app/types/enums";
import { ILessonProcess, IXPLessonProcess } from "@app/types/interfaces";
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
import { LearnerProfile } from "./learner-profile.entity";
import { Lesson } from "./lesson.entity";
import { QuestionType } from "./question-type.entity";

@Entity("lesson_processes")
export class LessonProcess extends BaseEntity implements ILessonProcess {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "learner_profile_id", type: "uuid", nullable: false })
  learnerProfileId: string;

  @Column({ name: "question_type_id", type: "int", nullable: false })
  questionTypeId: number;

  @Column({ name: "current_lesson_id", type: "int", nullable: false })
  currentLessonId: number;

  @Column({ name: "band_score", type: "enum", enum: BandScoreEnum, nullable: false })
  bandScore: BandScoreEnum;

  @Column({ name: "xp", type: "jsonb", nullable: false })
  xp: IXPLessonProcess[];

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

  // Relations
  @ManyToOne(() => LearnerProfile, (learnerProfile) => learnerProfile.lessonProcesses)
  @JoinColumn({ name: "learner_profile_id", referencedColumnName: "id" })
  readonly learnerProfile: LearnerProfile;

  @ManyToOne(() => QuestionType, (questionType) => questionType.lessonProcesses)
  @JoinColumn({ name: "question_type_id", referencedColumnName: "id" })
  readonly questionType: QuestionType;

  @ManyToOne(() => Lesson, (lesson) => lesson.lessonProcesses)
  @JoinColumn({ name: "current_lesson_id", referencedColumnName: "id" })
  currentLesson: Lesson;
}
