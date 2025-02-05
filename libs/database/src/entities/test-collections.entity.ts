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
  QueryBuilder,
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

  static async getCollectionsWithTests(offset: number, limit: number, profileId: string) {
    return this.createQueryBuilder().connection.query(`SELECT * from get_filtered_collections($1, $2, $3)`, [
      offset,
      limit,
      profileId,
    ]);
  }

  static async getCollectionByKeyword(keyword: string) {
    if (keyword) {
      keyword = keyword.trim().replace(/\s+/g, "&");
    }

    return this.createQueryBuilder().connection.query(`select * from get_collections_by_keyword($1)`, [keyword]);
  }

  static async getListCollectionsForIntroduction() {
    return this.createQueryBuilder("collection")
      .select([
        'collection.id as "collectionId"',
        'collection.name as "collectionName"',
        `string_to_array(collection.tags, ',') as "tags"`,
        "collection.description as description",
        "collection.thumbnailId as thumbnail",
        `coalesce(array_agg("limitedTest".test_name) filter (where "limitedTest".test_name is not null), '{}') AS "testNames"`,
        'coalesce("testCounts"."totalTests", 0) AS "totalTests"',
      ])
      .leftJoin(
        (subquery: QueryBuilder<SimulatedIeltsTest>) => {
          return subquery
            .select([
              '"simulatedIeltsTests"."collection_id"',
              '"simulatedIeltsTests"."test_name"',
              'row_number() over (partition by "simulatedIeltsTests"."collection_id" order by "simulatedIeltsTests"."order") AS rn',
            ])
            .from(SimulatedIeltsTest, "simulatedIeltsTests");
        },
        "limitedTest",
        'collection.id = "limitedTest"."collection_id" and "limitedTest".rn <= 4'
      )
      .leftJoin(
        (subquery: QueryBuilder<SimulatedIeltsTest>) => {
          return subquery
            .select(['"simulatedIeltsTests"."collection_id"', 'count(*)::integer as "totalTests"'])
            .from(SimulatedIeltsTest, "simulatedIeltsTests")
            .groupBy('"simulatedIeltsTests"."collection_id"');
        },
        "testCounts",
        'collection.id = "testCounts"."collection_id"'
      )
      .groupBy('collection.id, collection.name, "testCounts"."totalTests"')
      .take(4)
      .orderBy("collection.id")
      .getRawMany();
  }
}
