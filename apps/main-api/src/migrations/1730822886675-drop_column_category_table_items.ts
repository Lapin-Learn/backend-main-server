import { MigrationInterface, QueryRunner } from "typeorm";

export class DropColumnCategoryTableItems1730822886675 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("items", "category");
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
