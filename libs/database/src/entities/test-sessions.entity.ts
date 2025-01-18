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
import { SkillEnum, TestSessionModeEnum, TestSessionStatusEnum } from "@app/types/enums";
import {
  InfoSpeakingResponseDto,
  InfoTextResponseDto,
  SpeakingEvaluation,
  StartSessionDto,
  WritingEvaluation,
} from "@app/types/dtos/simulated-tests";
import { Transform } from "class-transformer";
import { TransformBandScore } from "@app/utils/pipes";

@Entity({ name: "skill_test_sessions" })
export class SkillTestSession extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "skill_test_id", type: "int", nullable: false })
  skillTestId: number;

  @Column({ name: "learner_profile_id", type: "uuid", nullable: false })
  learnerProfileId: string;

  @Column({ name: "responses", type: "jsonb", nullable: true })
  responses: InfoTextResponseDto[] | InfoSpeakingResponseDto[];

  @Column({
    name: "results",
    type: "jsonb",
    nullable: true,
    transformer: {
      to: (value) => value,
      from: (value) => (value === null ? [] : value),
    },
  })
  results: boolean[] | SpeakingEvaluation[] | WritingEvaluation[];

  @Column({ name: "time_limit", type: "int", nullable: false, default: 0 })
  // 0 when option is "unlimited"
  timeLimit: number;

  @Column({ name: "elapsed_time", type: "int", nullable: false, default: 0 })
  elapsedTime: number;

  @Column({ name: "mode", type: "varchar", nullable: false, default: TestSessionModeEnum.FULL_TEST })
  mode: TestSessionModeEnum;

  @Column({ name: "status", type: "varchar", nullable: false, default: TestSessionStatusEnum.IN_PROGRESS })
  status: TestSessionStatusEnum;

  @Column({
    name: "parts",
    type: "int",
    array: true,
    nullable: true,
    transformer: {
      from: (value) => {
        if (value && Array.isArray(value)) {
          return value.sort((a, b) => a - b);
        }
        return [];
      },
      to: (value) => {
        if (value && Array.isArray(value)) {
          return value.sort((a, b) => a - b);
        }
        return [];
      },
    },
  })
  parts: number[];

  @Column({
    name: "estimated_band_score",
    type: "double precision",
    nullable: true,
    transformer: {
      from: (value) => TransformBandScore(value),
      to: (value) => TransformBandScore(value),
    },
  })
  @Transform(({ value }) => TransformBandScore(value))
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

  static async findExistedSession(learnerId: string, sessionData: StartSessionDto) {
    return this.createQueryBuilder("session")
      .where("session.learnerProfileId = :learnerId", { learnerId })
      .andWhere("session.mode = :mode", { mode: sessionData.mode })
      .andWhere("session.status = :status", { status: TestSessionStatusEnum.IN_PROGRESS })
      .andWhere("session.skillTestId = :skillTestId", { skillTestId: sessionData.skillTestId })
      .andWhere("session.timeLimit = :timeLimit", { timeLimit: sessionData.timeLimit })
      .andWhere(":parts @> session.parts", { parts: sessionData.parts })
      .getOne();
  }

  static async getSessionDetail(sessionId: number, learnerId: string) {
    return this.createQueryBuilder("session")
      .select([
        "session.id",
        "session.responses",
        "session.timeLimit",
        "session.elapsedTime",
        "session.mode",
        "session.parts",
        "session.status",
        "session.results",
        "session.estimatedBandScore",
        "session.updatedAt",
      ])
      .leftJoin("session.skillTest", "skillTest")
      .addSelect(["skillTest.id", "skillTest.skill", "skillTest.partsDetail"])
      .leftJoin("skillTest.simulatedIeltsTest", "test")
      .addSelect(["test.id", "test.testName"])
      .leftJoin("skillTest.skillTestAnswer", "answer")
      .addSelect(["answer.answers", "answer.guidances"])
      .where("session.id = :sessionId", { sessionId })
      .andWhere("session.learnerProfileId = :learnerId", { learnerId })
      .getOne();
  }

  static async getSessionHistory(
    learnerId: string,
    offset: number,
    limit: number,
    simulatedTestId?: number,
    skill?: SkillEnum
  ) {
    const query = this.createQueryBuilder("session")
      .select([
        "session.id",
        "session.createdAt",
        "session.estimatedBandScore",
        "session.elapsedTime",
        "session.results",
        "session.mode",
      ])
      .leftJoin("session.skillTest", "skillTest")
      .addSelect(["skillTest.id", "skillTest.skill"])
      .leftJoin("skillTest.simulatedIeltsTest", "test")
      .addSelect(["test.testName"])
      .where("session.learner_profile_id = :learnerId", { learnerId })
      .andWhere("session.status = :status", { status: TestSessionStatusEnum.FINISHED })
      .orderBy("session.createdAt", "DESC");

    if (simulatedTestId) {
      query.andWhere("test.id = :simulatedTestId", { simulatedTestId });
    }

    if (skill) {
      query.andWhere("skillTest.skill = :skill", { skill });
    }

    const total = await query.getCount();
    const items = await query.skip(offset).take(limit).getMany();

    return { items, total };
  }

  static async getBandScoreReport(learnerId: string) {
    return await this.createQueryBuilder("session")
      .select(['COALESCE(AVG(session.estimatedBandScore), 0) as "estimatedBandScore"'])
      .leftJoin("session.skillTest", "test")
      .addSelect(['test.skill as "skill"'])
      .leftJoin("session.learnerProfile", "learner")
      .where("session.status = :status", { status: TestSessionStatusEnum.FINISHED })
      .andWhere("session.learnerProfileId = :learnerId", { learnerId })
      .andWhere("session.estimatedBandScore IS NOT NULL")
      .groupBy("test.skill")
      .getRawMany();
  }

  static async getSessionProgress(learnerId: string, skill: SkillEnum, from: Date = null, to: Date = null) {
    const query = this.createQueryBuilder("session")
      .select([
        "session.id as id",
        'session.estimatedBandScore as "estimatedBandScore"',
        'session.createdAt as "createdAt"',
      ])
      .innerJoin("session.skillTest", "test", "test.skill = :skill", { skill })
      .where("session.learnerProfileId = :learnerId", { learnerId })
      .andWhere("session.status = :status", { status: TestSessionStatusEnum.FINISHED })
      .andWhere("session.estimatedBandScore IS NOT NULL")
      .orderBy("session.id");

    if (from || to) {
      query.andWhere("DATE(session.createdAt) BETWEEN DATE(:from) AND DATE(:to)", { from, to });
    }

    return query.getRawMany();
  }
}
