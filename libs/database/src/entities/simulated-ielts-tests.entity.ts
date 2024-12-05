import { ISimulatedIeltsTest } from "@app/types/interfaces";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { TestCollection } from "./test-collections.entity";

@Entity({ name: "simulated_ielts_tests" })
export class SimulatedIeltsTest extends BaseEntity implements ISimulatedIeltsTest {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "collection_id", type: "number", nullable: false })
  collectionId: number;

  @Column({ name: "order", type: "varchar" })
  order: string;

  @Column({ name: "test_name", type: "varchar" })
  testName: string;

  @Column({ name: "keyword", type: "varchar" })
  @Index("IDX_SIMULATED_IELTS_TESTS_KEYWORD")
  keyword: string;

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

  @ManyToOne(() => TestCollection, (testCollection) => testCollection.simulatedIeltsTests)
  @JoinColumn({ name: "collection_id", referencedColumnName: "id" })
  testCollection: TestCollection;
}
