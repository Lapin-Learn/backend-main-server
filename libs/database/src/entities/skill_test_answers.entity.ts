import { IGuidance } from "@app/types/interfaces";
import { ITestAnswer } from "@app/types/interfaces";
import { Entity, BaseEntity, Column, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "skill_test_answers" })
export class SkillTestAnswer extends BaseEntity {
  @PrimaryColumn({ name: "skill_test_id", type: "int", nullable: false })
  skillTestId: number;

  @Column({ name: "guidances", type: "jsonb", nullable: true, default: null })
  guidances: IGuidance[];

  @Column({ name: "answers", type: "jsonb", nullable: true, default: null })
  answers: ITestAnswer[];

  @CreateDateColumn({ name: "created_at", type: "timestamp", nullable: false, default: "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    nullable: false,
    default: "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
