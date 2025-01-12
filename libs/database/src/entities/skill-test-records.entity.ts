import { SkillEnum } from "@app/types/enums";
import { Transform } from "class-transformer";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "skill_test_records" })
export class SkillTestRecord extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "learner_id", type: "uuid" })
  learnerId: string;

  @Column({ name: "session_id", type: "int", nullable: false })
  sessionId: number;

  @Column({ name: "skill", type: "varchar", nullable: false })
  skill: SkillEnum;

  @Column({ name: "evaluation_type", type: "varchar", nullable: true })
  evaluationType: string;

  @Column({
    name: "accuracy",
    type: "double precision",
    nullable: true,
    default: "0.0",
  })
  @Transform(({ value }) => {
    const decimal = value % 1;

    if (decimal < 0.25) {
      return Math.floor(value);
    } else if (decimal >= 0.25 && decimal < 0.75) {
      return Math.floor(value) + 0.5;
    } else if (decimal >= 0.75) {
      return Math.ceil(value);
    }

    return value;
  })
  accuracy: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp", nullable: false, default: "CURRENT_TIMESTAMP" })
  createdAt: Timestamp;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    nullable: false,
    default: "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Timestamp;

  static async getAccuracy(learnerId: string, skill: SkillEnum) {
    return this.createQueryBuilder("records")
      .select(["records.evaluationType as evaluationType", "COALESCE(AVG(records.accuracy), 0) as accuracy"])
      .where("records.learnerId = :learnerId", { learnerId })
      .andWhere("records.evaluationType IS NOT NULL")
      .andWhere("records.skill = :skill", { skill })
      .groupBy("records.evaluationType")
      .getRawMany();
  }
}
