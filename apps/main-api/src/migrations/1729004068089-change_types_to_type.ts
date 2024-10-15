import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTypesToType1729004068089 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn("quests", "types", "type");
    await queryRunner.renameColumn("missions", "types", "type");
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
