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
import { TestSessionModeEnum, TestSessionStatusEnum } from "@app/types/enums";
import { StartSessionDto } from "@app/types/dtos/simulated-tests";
import { ITestSessionResponse } from "@app/types/interfaces/test-session-responses.interface";

@Entity({ name: "skill_test_sessions" })
export class SkillTestSession extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "skill_test_id", type: "int", nullable: false })
  skillTestId: number;

  @Column({ name: "learner_profile_id", type: "uuid", nullable: false })
  learnerProfileId: string;

  @Column({ name: "responses", type: "jsonb", nullable: true })
  responses: ITestSessionResponse[];

  @Column({ name: "results", type: "jsonb", nullable: true })
  results: object;

  @Column({ name: "time_limit", type: "int", nullable: false, default: 0 })
  // 0 when option is "unlimited"
  timeLimit: number;

  @Column({ name: "elapsed_time", type: "int", nullable: false, default: 0 })
  elapsedTime: number;

  @Column({ name: "mode", type: "varchar", nullable: false, default: TestSessionModeEnum.FULL_TEST })
  mode: TestSessionModeEnum;

  @Column({ name: "status", type: "varchar", nullable: false, default: TestSessionStatusEnum.IN_PROGRESS })
  status: TestSessionStatusEnum;

  @Column({ name: "parts", type: "int", array: true, nullable: true })
  parts: number[];

  @Column({ name: "estimated_band_score", type: "double precision", nullable: true })
  estimatedBandScore: number;

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

  static async findExistedSession(learnerId: string, sesionData: StartSessionDto) {
    return this.createQueryBuilder("session")
      .where("session.learnerProfileId = :learnerId", { learnerId })
      .andWhere("session.status = :status", { status: TestSessionStatusEnum.IN_PROGRESS })
      .andWhere("session.skillTestId = :skillTestId", { skillTestId: sesionData.skillTestId })
      .andWhere("session.timeLimit = :timeLimit", { timeLimit: sesionData.timeLimit })
      .andWhere("session.parts @> :parts", { parts: sesionData.parts })
      .getOne();
  }
}
