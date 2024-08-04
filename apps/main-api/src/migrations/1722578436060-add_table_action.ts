import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableAction1722578436060 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "actions",
        columns: [
          {
            name: "id",
            type: "number",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "enum",
            enum: ["daily_login", "task_completed"],
            isNullable: false,
          },
        ],
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
