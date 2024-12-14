import {
  Entity,
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { SkillTest } from "./skill-tests.entity";
import { LearnerProfile } from "./learner-profile.entity";
import { TestSessionModeEnum } from "@app/types/enums";

@Entity({ name: "skill_test_sessions" })
export class SkillTestSession extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "skill_test_id", type: "int", nullable: false })
  skillTestId: number;

  @Column({ name: "learner_profile_id", type: "uuid", nullable: false })
  learnerProfileId: string;

  @Column({ name: "responses", type: "text", array: true, nullable: true })
  responses: string[];

  @Column({ name: "results", type: "text", array: true, nullable: true })
  results: string[];

  @Column({ name: "elapsed_time", type: "int", nullable: false, default: 0 })
  elapsedTIme: number;

  @Column({ name: "mode", type: "varchar", nullable: false, default: TestSessionModeEnum.FULL_TEST })
  mode: TestSessionModeEnum;

  @Column({ name: "parts", type: "int", array: true, nullable: true })
  parts: number[];

  @CreateDateColumn({ name: "created_at", type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMPT" })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMPT",
    onUpdate: "CURRENT_TIMESTAMPT",
  })
  updatedAt: Date;

  @ManyToOne(() => SkillTest, (skillTest) => skillTest.skillTestSessions)
  @JoinColumn({ name: "skill_test_id", referencedColumnName: "id" })
  skillTest: SkillTest;

  @ManyToOne(() => LearnerProfile, (learnerProfile) => learnerProfile.skillTestSessions)
  @JoinColumn({ name: "learner_profile_id", referencedColumnName: "id" })
  learnerProfile: LearnerProfile;
}
