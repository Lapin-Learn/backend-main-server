import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { SkillTestSession } from "./test-sessions.entity";
import { TestRecordStatusEnum } from "@app/types/enums";
import { SimulatedIeltsTest } from "./simulated-ielts-tests.entity";
import { LearnerProfile } from "./learner-profile.entity";

@Entity({ name: "test_records" })
export class TestRecord extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "simulated_test_id", type: "int", nullable: false })
  simulatedTestId: number;

  @Column({ name: "learner_profile_id", type: "uuid", nullable: false })
  learnerProfileId: string;

  @Column({ name: "total_results", type: "jsonb", nullable: true })
  totalResults: string;

  @Column({ name: "status", type: "varchar", nullable: false, default: TestRecordStatusEnum.IN_PROGRESS })
  status: TestRecordStatusEnum;

  @CreateDateColumn({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @OneToMany(() => SkillTestSession, (skillTestSession) => skillTestSession.testRecord)
  skillTestSessions: SkillTestSession[];

  @ManyToOne(() => SimulatedIeltsTest, (simulatedTest) => simulatedTest.testRecords)
  @JoinColumn({ name: "simulated_test_id", referencedColumnName: "id" })
  simulatedTest: SimulatedIeltsTest;

  @ManyToOne(() => LearnerProfile, (learnerProfile) => learnerProfile.testRecords)
  learnerProfile: LearnerProfile;
}
