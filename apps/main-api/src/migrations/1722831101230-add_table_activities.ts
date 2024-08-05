import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableActivities1722831101230 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "activities",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "description",
            type: "text",
            isNullable: false,
          },
          {
            name: "action_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "profile_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            name: "FK_ACTIVITIES_ACTION_ID",
            columnNames: ["action_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "actions",
            onDelete: "CASCADE",
          },
          {
            name: "FK_ACTIVITIES_PROFILE_ID",
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
