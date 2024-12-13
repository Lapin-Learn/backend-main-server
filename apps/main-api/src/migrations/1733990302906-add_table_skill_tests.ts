import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableSkillTests1733990302906 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "skill_tests",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "test_id",
            type: "int",
            isNullable: true,
          },
          {
            name: "total_questions",
            type: "int",
            isNullable: false,
          },
          {
            name: "skill",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "parts_detail",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "parts_content",
            type: "jsonb",
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
            name: "FK_SKILL_TESTS_TEST_ID",
            columnNames: ["test_id"],
            referencedTableName: "simulated_ielts_tests",
            referencedColumnNames: ["id"],
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("skill_tests");
  }
}
