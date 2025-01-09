import { Column, CreateDateColumn, Entity, PrimaryColumn, Timestamp, UpdateDateColumn } from "typeorm";

@Entity({ name: "skill_test_records" })
export class SkillTestRecord {
  @PrimaryColumn({ name: "learner_id", type: "uuid" })
  learnerId: string;

  @Column({ name: "session_id", type: "int", nullable: false })
  sessionId: string;

  @Column({ name: "evaluation_type", type: "varchar", nullable: true })
  evaluationType: string;

  @Column({ name: "accuracy", type: "double precision", nullable: true, default: "0.0" })
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
}
