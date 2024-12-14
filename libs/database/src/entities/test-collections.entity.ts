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
import { Exclude, plainToClass } from "class-transformer";

@Entity({ name: "test_collections" })
export class TestCollection extends BaseEntity implements ITestCollection {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Exclude()
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

  static async getCollectionsWithTests(offset: number, limit: number, keyword: string): Promise<ITestCollection[]> {
    const subquery = this.createQueryBuilder("collections")
      .select("collections.id")
      .addSelect("ts_rank(collections.keyword, to_tsquery(:query))", "rank")
      .where("collections.keyword @@ to_tsquery(:query)", { query: keyword.trim().replace(/\s+/g, "&") + ":*" })
      .orderBy("rank", "DESC")
      .skip(offset)
      .take(limit);

    const queryBuilder = this.createQueryBuilder("collections")
      .innerJoin("(" + subquery.getQuery() + ")", "filtered", "collections.id = filtered.collections_id")
      .leftJoinAndSelect("collections.simulatedIeltsTests", "simulatedIeltsTests")
      .leftJoinAndSelect("collections.thumbnail", "thumbnail")
      .orderBy("simulatedIeltsTests.order")
      .setParameters(subquery.getParameters());

    const data: ITestCollection[] = await queryBuilder.getMany();

    return data.map((c) => {
      return plainToClass(TestCollection, {
        ...c,
        testCount: c.simulatedIeltsTests.length,
        thumbnail: c.thumbnail ? c.thumbnail["url"] : null,
        simulatedIeltsTests: c.simulatedIeltsTests.slice(0, 4),
      });
    });
  }
}
