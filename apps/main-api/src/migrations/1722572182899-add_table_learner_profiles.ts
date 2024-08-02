import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableLearnerProfiles1722572182899 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.createTable(
      new Table({
        name: "learner_profiles",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "rank",
            type: "enum",
            enum: ["bronze", "silver", "gold", "platinum", "diamond", "master"],
            default: "'bronze'",
          },
          {
            name: "level_id",
            type: "int",
            isNullable: false,
            default: 1,
          },
          {
            name: "xp",
            type: "int",
            default: 0,
          },
          {
            name: "carrots",
            type: "int",
            default: 0,
          },
          {
            name: "streak_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "created_on",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_on",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            name: "FK_LEARNER_PROFILES_LEVEL_ID",
            columnNames: ["level_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "levels",
          },
          {
            name: "FK_LEARNER_PROFILES_STREAK_ID",
            columnNames: ["streak_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "streaks",
          },
        ],
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
