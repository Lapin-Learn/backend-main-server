import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableQuests1722579985537 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "quests",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: false,
          },
          {
            name: "requirements",
            type: "int",
            isNullable: false,
            default: 0,
          },
          {
            name: "rewards",
            type: "int",
            isNullable: false,
            default: 0,
          },
          {
            name: "action_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "types",
            type: "enum",
            enum: ["daily", "monthly"],
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            name: "FK_QUESTS_ACTION_ID",
            columnNames: ["action_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "actions",
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
