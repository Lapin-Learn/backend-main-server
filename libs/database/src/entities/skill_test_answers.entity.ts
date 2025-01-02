import { IGuidance, TestAnswer } from "@app/types/interfaces";
import {
  Entity,
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { SkillTest } from "./skill-tests.entity";

@Entity({ name: "skill_test_answers" })
export class SkillTestAnswer extends BaseEntity {
  @PrimaryColumn({ name: "skill_test_id", type: "int", nullable: false })
  skillTestId: number;

  @Column({ name: "guidances", type: "jsonb", nullable: true, default: null })
  guidances: IGuidance[];

  @Column({ name: "answers", type: "jsonb", nullable: true, default: null })
  answers: TestAnswer[];

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

  @OneToOne(() => SkillTest, { eager: true })
  @JoinColumn({ name: "skill_test_id", referencedColumnName: "id" })
  skillTest: SkillTest;
}
