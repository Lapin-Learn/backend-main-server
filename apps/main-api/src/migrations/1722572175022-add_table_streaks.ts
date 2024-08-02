import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableStreaks1722572175022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "streaks",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "current",
            type: "int",
            isNullable: false,
            default: 0,
          },
          {
            name: "target",
            type: "int",
            isNullable: false,
            default: 0,
          },
          {
            name: "record",
            type: "int",
            isNullable: false,
            default: 0,
          },
        ],
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
