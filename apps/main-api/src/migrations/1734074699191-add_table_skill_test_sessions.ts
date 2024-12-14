import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableSkillTestSessions1734074699191 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "skill_test_sessions",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "skill_test_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "learner_profile_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "responses",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "results",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "time_limit",
            type: "int",
            isNullable: false,
            default: 0,
          },
          {
            name: "elapsed_time",
            type: "int",
            isNullable: false,
            default: 0,
          },
          {
            name: "mode",
            type: "varchar",
            isNullable: false,
            default: "'full_test'",
          },
          {
            name: "status",
            type: "varchar",
            isNullable: false,
            default: "'in_progress'",
          },
          {
            name: "parts",
            type: "int",
            isArray: true,
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            name: "FK_SKILL_TEST_SESSIONS_SKILL_TEST_ID",
            columnNames: ["skill_test_id"],
            referencedTableName: "skill_tests",
            referencedColumnNames: ["id"],
          },
          {
            name: "FK_SKILL_TEST_SESSIONS_LEARNER_PROFILE_ID",
            columnNames: ["learner_profile_id"],
            referencedTableName: "learner_profiles",
            referencedColumnNames: ["id"],
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("skill_test_sessions");
  }
}
