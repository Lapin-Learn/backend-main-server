import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableSkillTestRecords1736409490412 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "skill_test_records",
        columns: [
          {
            name: "learner_id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "session_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "evaluation_type",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "accuracy",
            type: "double precision",
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
            name: "FK_SKILL_TEST_RECORDS_LEARNER_ID",
            columnNames: ["learner_id"],
            referencedTableName: "learner_profiles",
            referencedColumnNames: ["id"],
          },
          {
            name: "FK_SKILL_TEST_RECORDS_SESSION_ID",
            columnNames: ["session_id"],
            referencedTableName: "skill_test_sessions",
            referencedColumnNames: ["id"],
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("skill_test_records");
  }
}
