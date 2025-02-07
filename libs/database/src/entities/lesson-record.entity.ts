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
import moment from "moment-timezone";

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
  @ManyToOne(() => Lesson, (lesson) => lesson.id, { eager: true })
  @JoinColumn({ name: "lesson_id", referencedColumnName: "id" })
  readonly lesson: Lesson;

  @ManyToOne(() => LearnerProfile, (learnerProfile) => learnerProfile.id)
  @JoinColumn({ name: "learner_profile_id", referencedColumnName: "id" })
  readonly learnerProfile: LearnerProfile;

  static async getTotalDurationOfLearnDailyLesson(profileId: string) {
    return await this.createQueryBuilder("lesson_records")
      .select("SUM(lesson_records.duration)", "totalDuration")
      .where("DATE(lesson_records.created_at) = CURRENT_DATE")
      .andWhere("lesson_records.learner_profile_id = :profileId", { profileId })
      .getRawOne();
  }

  static async getCompletedLessonDistinctSkills(profileId: string) {
    return await this.createQueryBuilder("lesson_records")
      .leftJoinAndSelect("lesson_records.lesson", "lesson")
      .leftJoinAndSelect("lesson.questionType", "questionType")
      .select("COUNT(DISTINCT questionType.skill)", "distinctSkills")
      .where("lesson_records.learner_profile_id = :profileId", { profileId })
      .andWhere("DATE(lesson_records.created_at) = CURRENT_DATE")
      .getRawOne();
  }

  static async countMaxConsecutiveLearningLessonDate(profileId: string): Promise<number> {
    const result = await this.createQueryBuilder("lesson_records")
      .select("DISTINCT DATE(lesson_records.created_at)", "learningDate")
      .where("lesson_records.learner_profile_id = :profileId", { profileId })
      .andWhere(
        "EXTRACT(MONTH FROM lesson_records.created_at) = EXTRACT(MONTH FROM CURRENT_DATE) and EXTRACT(YEAR FROM lesson_records.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)"
      )
      .orderBy('"learningDate"', "DESC")
      .getRawMany();

    const dates = Array.from(result.map((r) => moment(r.learningDate).startOf("day")));
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "day").startOf("day");

    if (dates.length === 0 || (dates[0].valueOf() !== today.valueOf() && dates[0].valueOf() !== yesterday.valueOf())) {
      return 0;
    }

    const currentStreak = [dates[0]];

    for (let i = 1; i < dates.length; i++) {
      if (Math.abs(dates[i].diff(dates[i - 1], "days")) === 1) {
        currentStreak.push(dates[i]);
      } else {
        break;
      }
    }

    return currentStreak?.length || 0;
  }

  static async countDistinctLearningDaysThisMonth(learnerId: string) {
    return this.createQueryBuilder("record")
      .select("DISTINCT DATE(record.createdAt)", '"learningDate"')
      .where("record.learnerProfileId = :learnerId", { learnerId })
      .andWhere(
        "EXTRACT(MONTH FROM record.createdAt) = EXTRACT(MONTH FROM CURRENT_DATE) and EXTRACT(YEAR FROM record.createdAt) = EXTRACT(YEAR FROM CURRENT_DATE)"
      )
      .getCount();
  }

  public getBonusResources(): { bonusXP: number; bonusCarrot: number } {
    const totalAnswers = this.correctAnswers + this.wrongAnswers;
    const bonusXP = totalAnswers === 0 ? 0 : Math.round(50 * (this.correctAnswers / totalAnswers));

    // 3 minutes
    let bonusCarrot = 0;
    switch (true) {
      case this.duration < 3 * 60:
        bonusCarrot = 2;
        break;
      default:
        bonusCarrot = 1;
        break;
    }

    return { bonusXP, bonusCarrot };
  }
}
