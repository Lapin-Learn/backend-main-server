import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableSimulatedIeltsTests1733280925452 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "simulated_ielts_tests",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "collection_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "order",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "test_name",
            type: "varchar",
            isNullable: false,
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
            name: "FK_SIMULATED_IELTS_TESTS_COLLECTION_ID",
            columnNames: ["collection_id"],
            referencedTableName: "test_collections",
            referencedColumnNames: ["id"],
          },
        ],
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method is not implemented");
  }
}
