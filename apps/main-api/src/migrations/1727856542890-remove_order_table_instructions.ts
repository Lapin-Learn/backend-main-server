import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOrderTableInstructions1727856542890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE instructions DROP COLUMN "order";`);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
