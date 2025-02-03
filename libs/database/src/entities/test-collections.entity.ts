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

  @Column({
    name: "tags",
    type: "varchar",
    nullable: false,
    default: "",
    transformer: {
      to: (value: string[] | string) => (Array.isArray(value) ? value.join(",") : value),
      from: (value: string) => (value ? value.split(",") : []),
    },
  })
  tags: string[];

  @Column({ name: "keyword", type: "tsvector", nullable: false, select: false })
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

  static async getCollectionsWithTests(offset: number, limit: number, keyword: string, profileId: string) {
    if (keyword) {
      keyword = keyword.trim().replace(/\s+/g, "&");
    }
    return this.createQueryBuilder().connection.query(`SELECT * from get_filtered_collections($1, $2, $3, $4)`, [
      offset,
      limit,
      keyword,
      profileId,
    ]);
  }

  static async getCollectionByKeyword(keyword: string) {
    if (keyword) {
      keyword = keyword.trim().replace(/\s+/g, "&");
    }

    return this.createQueryBuilder().connection.query(`select * from get_collections_by_keyword($1)`, [keyword]);
  }
}
