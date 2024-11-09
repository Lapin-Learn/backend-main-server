import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCreatedAtUpdatedAtTableProfileItems1731127266694 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the column 'created_at' already exists
    const profileItemTable = await queryRunner.getTable("profile_items");
    if (!profileItemTable?.findColumnByName("created_at")) {
      await queryRunner.addColumn(
        "profile_items",
        new TableColumn({
          name: "created_at",
          type: "timestamp",
          isNullable: false,
          default: "CURRENT_TIMESTAMP",
        })
      );
    }

    // Check if the column 'updated_at' already exists
    if (!profileItemTable?.findColumnByName("updated_at")) {
      await queryRunner.addColumn(
        "profile_items",
        new TableColumn({
          name: "updated_at",
          type: "timestamp",
          isNullable: false,
          default: "CURRENT_TIMESTAMP",
          onUpdate: "CURRENT_TIMESTAMP",
        })
      );
    }
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
