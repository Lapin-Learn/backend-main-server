import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeColumnDefaultLessonProcesses1728007846027 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE lesson_processes
      ALTER COLUMN band_score
      DROP DEFAULT
    `);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
