import { ILessonProcess } from "@app/types/interfaces/lesson-process.interface";
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

@Entity("lesson_processes")
export class LessonProcess extends BaseEntity implements ILessonProcess {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "lesson_id", type: "uuid", nullable: false })
  lessonId: string;

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

  // Relations
  @ManyToOne(() => Lesson, (lesson) => lesson.id)
  @JoinColumn({ name: "lesson_id", referencedColumnName: "id" })
  lesson: Lesson;

  @ManyToOne(() => LearnerProfile, (learnerProfile) => learnerProfile.id)
  @JoinColumn({ name: "learner_profile_id", referencedColumnName: "id" })
  learnerProfile: LearnerProfile;
}
