import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableTestRecords1734074688187 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "test_records",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "simulated_test_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "learner_profile_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "total_results",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "status",
            type: "varchar",
            isNullable: false,
            default: "'in_progress'",
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
            name: "FK_TEST_RECORDS_SIMULATED_TEST_ID",
            columnNames: ["simulated_test_id"],
            referencedTableName: "simulated_ielts_tests",
            referencedColumnNames: ["id"],
          },
          {
            name: "FK_TEST_RECORDS_LEARNER_PROFILE_ID",
            columnNames: ["learner_profile_id"],
            referencedTableName: "learner_profiles",
            referencedColumnNames: ["id"],
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("test_records");
  }
}
