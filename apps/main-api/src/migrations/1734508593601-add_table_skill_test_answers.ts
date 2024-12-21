import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableSkillTestAnswers1734508593601 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "skill_test_answers",
        columns: [
          { name: "skill_test_id", type: "int", isPrimary: true },
          { name: "guidances", type: "jsonb", isNullable: true },
          { name: "answers", type: "jsonb", isNullable: true },
          { name: "created_at", type: "timestamp", isNullable: false, default: "CURRENT_TIMESTAMP" },
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
            name: "FK_SKILL_TEST_ANSWERS_SKILL_TEST_ID",
            columnNames: ["skill_test_id"],
            referencedTableName: "skill_tests",
            referencedColumnNames: ["id"],
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("skill_test_answers");
  }
}
