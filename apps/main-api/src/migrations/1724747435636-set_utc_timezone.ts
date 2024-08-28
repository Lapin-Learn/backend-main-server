import { MigrationInterface, QueryRunner } from "typeorm";

export class SetUtcTimezone1724747435636 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET TIME ZONE 'UTC';`);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
