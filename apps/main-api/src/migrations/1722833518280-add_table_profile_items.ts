import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableProfileItems1722833518280 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "profile_items",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "item_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "profile_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "quantity",
            type: "int",
            isNullable: false,
            default: 1,
          },
          {
            name: "exp_on",
            type: "timestamp",
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            name: "FK_PROFILE_ITEMS_ITEM_ID",
            columnNames: ["item_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "items",
            onDelete: "CASCADE",
          },
          {
            name: "FK_PROFILE_ITEMS_PROFILE_ID",
            columnNames: ["profile_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "learner_profiles",
            onDelete: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
