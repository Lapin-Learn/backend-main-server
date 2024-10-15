import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTableProfileMissionsName1728916237944 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE profile_missions RENAME TO profile_missions_progress`);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
