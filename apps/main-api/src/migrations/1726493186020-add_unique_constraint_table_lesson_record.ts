import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintTableLessonRecord1726493186020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE lesson_records
        ADD CONSTRAINT UNIQUE_LESSON_RECORDS_LEARNER_PROFILE_ID_LESSON_ID
        UNIQUE (learner_profile_id, lesson_id)
    `);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented");
  }
}
