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
import { Lesson } from "./lesson.entity";
import { LearnerProfile } from "./learner-profile.entity";
import { ILessonRecord } from "@app/types/interfaces";

@Entity("lesson_records")
export class LessonRecord extends BaseEntity implements ILessonRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "lesson_id", type: "int", nullable: false })
  lessonId: number;

  @Column({ name: "learner_profile_id", type: "uuid", nullable: false })
  learnerProfileId: string;

  @Column({ name: "correct_answers", type: "int", nullable: false })
  correctAnswers: number;

  @Column({ name: "wrong_answers", type: "int", nullable: false })
  wrongAnswers: number;

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

  @Column({ name: "duration", type: "int", nullable: true })
  duration: number;

  // Relations
  @ManyToOne(() => Lesson, (lesson) => lesson.id)
  @JoinColumn({ name: "lesson_id", referencedColumnName: "id" })
  readonly lesson: Lesson;

  @ManyToOne(() => LearnerProfile, (learnerProfile) => learnerProfile.id)
  @JoinColumn({ name: "learner_profile_id", referencedColumnName: "id" })
  readonly learnerProfile: LearnerProfile;
}