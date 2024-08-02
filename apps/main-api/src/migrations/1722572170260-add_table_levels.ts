import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableLevels1722572170260 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "levels",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "xp",
            type: "int",
            isNullable: false,
            default: 0,
          },
        ],
      })
    );

    await queryRunner.query(`ALTER SEQUENCE levels_id_seq RESTART WITH 1`);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
