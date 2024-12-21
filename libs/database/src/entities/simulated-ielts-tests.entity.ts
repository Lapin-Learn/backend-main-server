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
      .select(["simulatedTests.id as id", "simulatedTests.testName as testName", "simulatedTests.order as order"])
      .leftJoin("simulatedTests.skillTests", "skillTest")
      .addSelect(["skillTest.id as skillTestId", "skillTest.skill as skill", "skillTest.partsDetail as partsDetail"])
      .leftJoin(
        (subQuery) => {
          return subQuery
            .select([
              "session.id as sessionId",
              "session.skillTestId as sessionSkillTestId",
              "session.estimatedBandScore as estimatedBandScore",
              "session.status as status",
              "COALESCE(session.elapsedTime, 0) as elapsedTime",
            ])
            .from(SkillTestSession, "session")
            .where("session.learnerProfileId = :profileId", { profileId })
            .andWhere(
              `session.createdAt = (
                SELECT MAX(subsession.created_at) 
                FROM skill_test_sessions subsession 
                WHERE subsession.skill_test_id = session.skill_test_id)`
            );
        },
        "latestSession",
        '"latestSession".sessionSkillTestId = skillTest.id',
        { profileId }
      )
      .addSelect([
        '"latestSession".status',
        '"latestSession".estimatedBandScore ',
        '"latestSession".sessionId',
        '"latestSession".elapsedTime',
      ])
      .where("simulatedTests.collectionId = :collectionId", { collectionId })
      .orderBy("simulatedTests.order")
      .addOrderBy("skillTest.skill")
      .skip(offset)
      .take(limit)
      .getRawMany();
  }
}
