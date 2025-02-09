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
import { SkillTestSession } from "./test-sessions.entity";

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

  static async getSimulatedTestInCollections(collectionId: number, offset: number, limit: number, profileId: string) {
    return this.createQueryBuilder("simulatedTests")
      .select(["simulatedTests.id as id", 'simulatedTests.testName as "testName"', "simulatedTests.order as order"])
      .leftJoin("simulatedTests.skillTests", "skillTest")
      .addSelect([
        'skillTest.id as "skillTestId"',
        "skillTest.skill as skill",
        'skillTest.partsDetail as "partsDetail"',
      ])
      .leftJoin(
        (subQuery) => {
          return subQuery
            .select([
              'session.id as "sessionId"',
              'session.skillTestId as "sessionSkillTestId"',
              'session.estimatedBandScore as "estimatedBandScore"',
              "session.status as status",
              "session.responses as responses",
              "session.results as results",
              'session.elapsedTime as "elapsedTime"',
              'session.updated_at as "updated_at"',
            ])
            .from(SkillTestSession, "session")
            .where("session.learnerProfileId = :profileId", { profileId });
        },
        "latestSession",
        '"latestSession"."sessionSkillTestId" = skillTest.id',
        { profileId }
      )
      .addSelect([
        '"latestSession"."sessionId" as "sessionId"',
        '"latestSession".status as status',
        '"latestSession"."estimatedBandScore" as "estimatedBandScore"',
        '"latestSession"."elapsedTime" as "elapsedTime"',
        '"latestSession".responses as responses',
        '"latestSession".results as results',
        '"latestSession"."updated_at" as "updated_at"',
      ])
      .where("simulatedTests.collectionId = :collectionId", { collectionId })
      .orderBy("simulatedTests.order")
      .addOrderBy("skillTest.skill")
      .orderBy("updated_at", "DESC")
      .skip(offset)
      .take(limit)
      .getRawMany();
  }
}
