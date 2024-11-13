import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRowsLevel1723478185240 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("INSERT INTO levels (xp) VALUES (100)");
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
