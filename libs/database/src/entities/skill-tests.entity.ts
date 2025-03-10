import { SkillEnum } from "@app/types/enums";
import { IPartDetail } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SimulatedIeltsTest } from "./simulated-ielts-tests.entity";
import { SkillTestSession } from "./test-sessions.entity";
import { SkillTestAnswer } from "./skill_test_answers.entity";

@Entity({ name: "skill_tests" })
export class SkillTest extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "test_id", type: "int", nullable: true })
  testId: number;

  @Column({ name: "total_questions", type: "int", nullable: false, default: 0 })
  totalQuestions: number;

  @Column({ name: "skill", type: "varchar", nullable: false, default: "" })
  skill: SkillEnum;

  @Column({ name: "parts_detail", type: "jsonb", nullable: true, default: null })
  partsDetail: IPartDetail[];

  @Column({ name: "parts_content", type: "jsonb", nullable: true, default: null, select: false })
  partsContent: object[];

  @ManyToOne(() => SimulatedIeltsTest, (simulatedIeltsTest) => simulatedIeltsTest.skillTests)
  @JoinColumn({ name: "test_id", referencedColumnName: "id" })
  simulatedIeltsTest: SimulatedIeltsTest;

  @OneToMany(() => SkillTestSession, (skillTestSession) => skillTestSession.skillTest)
  skillTestSessions: SkillTestSession[];

  @OneToOne(() => SkillTestAnswer, (answer) => answer.skillTest)
  skillTestAnswer: SkillTestAnswer;
}
