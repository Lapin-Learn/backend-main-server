import { ITestCollection } from "@app/types/interfaces";
import {
  Entity,
  BaseEntity,
  Column,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { Bucket } from "./bucket.entity";
import { SimulatedIeltsTest } from "./simulated-ielts-tests.entity";

@Entity({ name: "test_collections" })
export class TestCollection extends BaseEntity implements ITestCollection {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "thumbnail_id", type: "uuid", nullable: true })
  thumbnailId: string;

  @Column({ name: "name", type: "varchar", nullable: false, default: "" })
  name: string;

  @Column({ name: "tags", type: "varchar", nullable: false, default: [], array: true })
  tags: string[];

  @Column({ name: "keyword", type: "varchar", nullable: false, default: "" })
  @Index("IDX_TEST_COLLECTIONS_KEYWORD")
  keyword: string;

  @Column({ name: "description", type: "varchar", nullable: false, default: "" })
  description: string;

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

  @OneToOne(() => Bucket)
  @JoinColumn({ name: "thumbnail_id", referencedColumnName: "id" })
  thumbnail: Bucket;

  @OneToMany(() => SimulatedIeltsTest, (simulatedtIeltsTests) => simulatedtIeltsTests.testCollection)
  simulatedIeltsTests: SimulatedIeltsTest[];
}
