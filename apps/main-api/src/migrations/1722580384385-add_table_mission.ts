import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableMission1722580384385 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "missions",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "types",
            type: "enum",
            enum: ["daily", "monthly"],
            isNullable: false,
          },
          {
            name: "quest_id",
            type: "uuid",
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            name: "FK_MISSIONS_QUEST_ID",
            columnNames: ["quest_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "quests",
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
