import { ISimulatedIeltsTest } from "@app/types/interfaces";
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
import { TestCollection } from "./test-collections.entity";
import { Exclude } from "class-transformer";
import { SkillTest } from "./skill-tests.entity";

@Entity({ name: "simulated_ielts_tests" })
export class SimulatedIeltsTest extends BaseEntity implements ISimulatedIeltsTest {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Exclude()
  @Column({ name: "collection_id", type: "int", nullable: false })
  collectionId: number;

  @Column({ name: "order", type: "varchar" })
  order: string;

  @Column({ name: "test_name", type: "varchar" })
  testName: string;

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

  @OneToMany(() => SkillTest, (skillTest) => skillTest.simulatedIeltsTest)
  skillTests: SkillTest[];
}
