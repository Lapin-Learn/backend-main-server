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
import { NextBandScoreMap } from "@app/utils/maps";

@Entity("lesson_processes")
export class LessonProcess extends BaseEntity implements ILessonProcess {
  constructor(lessonProcess?: Partial<LessonProcess>) {
    super();
    if (lessonProcess) {
      Object.assign(this, lessonProcess);
    }
  }

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

  @ManyToOne(() => QuestionType, (questionType) => questionType.lessonProcesses, { eager: true })
  @JoinColumn({ name: "question_type_id", referencedColumnName: "id" })
  readonly questionType: QuestionType;

  @ManyToOne(() => Lesson, (lesson) => lesson.lessonProcesses, { eager: true })
  @JoinColumn({ name: "current_lesson_id", referencedColumnName: "id" })
  currentLesson: Lesson;

  public async updateLessonProcessOfLearner(xp: number, duration: number, completedLessonId: number): Promise<void> {
    try {
      const nextLesson = await Lesson.findOneBy({
        questionTypeId: this.questionTypeId,
        bandScore: this.bandScore,
        order: this.currentLesson.order + 1,
      });

      const lessonIndex = this.xp.findIndex((xp) => xp.lessonId === completedLessonId);

      if (lessonIndex !== -1) {
        // Always update the duration
        this.xp[lessonIndex].duration += duration;
        // The most XP (accuracy) will be prioritized
        xp > this.xp[lessonIndex].xp && (this.xp[lessonIndex].xp = xp);

        // Update current lesson to next lesson, this is the case when add new lesson to the list
        nextLesson && this.currentLesson.id === completedLessonId && (this.currentLesson = nextLesson);
      } else {
        // Add new lesson to lesson process
        this.xp.push({
          lessonId: completedLessonId,
          xp,
          duration,
        });

        nextLesson && (this.currentLesson = nextLesson);
      }

      const currentRequiredBandScore = this.questionType.bandScoreRequires.find(
        (require) => require.bandScore === this.bandScore
      );

      const totalXP = this.xp.reduce((acc, cur) => acc + cur.xp, 0);
      const nextBandScore = NextBandScoreMap.get(this.bandScore);
      if (totalXP >= currentRequiredBandScore.requireXP && nextBandScore) {
        this.bandScore = nextBandScore;
        this.xp = [];
      }

      await this.save();
      return;
    } catch (error) {
      throw error;
    }
  }
}
