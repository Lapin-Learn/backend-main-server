import { SkillEnum } from "@app/types/enums";
import { IQuestionType } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Bucket } from "./bucket.entity";
import { Lesson } from "./lesson.entity";
import _ from "lodash";
import { LessonProcess } from "./lesson-process.entity";
import { Instruction } from "./instruction.entity";

@Entity("question_types")
export class QuestionType extends BaseEntity implements IQuestionType {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "name", type: "text", nullable: false })
  name: string;

  @Column({ name: "skill", type: "enum", enum: SkillEnum, nullable: false })
  skill: SkillEnum;

  @Column({ name: "image_id", type: "uuid", nullable: true })
  imageId: string;

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

  @OneToOne(() => Bucket, { eager: true })
  @JoinColumn({ name: "image_id", referencedColumnName: "id" })
  readonly image: Bucket;

  @OneToMany(() => Lesson, (lesson) => lesson.questionType)
  readonly lessons: Lesson[];

  @OneToMany(() => LessonProcess, (lessonProcess) => lessonProcess.questionType)
  readonly lessonProcesses: LessonProcess[];

  @OneToMany(() => Instruction, (instruction) => instruction.questionType)
  readonly instructions: Instruction[];

  static getQuestionTypeProgressOfLearner(skill: SkillEnum, learnerProfileId: string): Promise<IQuestionType[]> {
    return this.createQueryBuilder("question_type")
      .leftJoinAndSelect("question_type.lessons", "lessons")
      .leftJoinAndSelect("question_type.image", "image")
      .loadRelationCountAndMap("question_type.lessons", "question_type.lessons")
      .leftJoinAndSelect("question_type.instructions", "instruction")
      .leftJoinAndSelect("question_type.lessonProcesses", "lesson_process")
      .andWhere("lesson_process.learnerProfileId = :learnerId", { learnerProfileId })
      .where("question_type.skill = :skill", { skill })
      .getMany();
  }

  static async ofAllSkills(): Promise<{ [key: string]: IQuestionType[] }> {
    const questionTypes = await this.createQueryBuilder("question_type")
      .leftJoinAndSelect("question_type.lessons", "lessons")
      .getMany();

    return _.groupBy(questionTypes, "skill");
  }
}
