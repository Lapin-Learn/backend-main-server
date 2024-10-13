import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableProfileMissions1722833045308 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "profile_missions",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "profile_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "mission_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "status",
            type: "enum",
            enum: ["assigned", "completed"],
            default: "'assigned'",
          },
          {
            name: "current",
            type: "int",
            isNullable: false,
            default: 0,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            name: "FK_PROFILE_MISSIONS_PROFILE_ID",
            columnNames: ["profile_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "learner_profiles",
            onDelete: "CASCADE",
          },
          {
            name: "FK_PROFILE_MISSIONS_MISSION_ID",
            columnNames: ["mission_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "missions",
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
