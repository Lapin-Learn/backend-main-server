import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnQuest1728578835894 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("quests", [
      new TableColumn({
        name: "category",
        type: "varchar",
        length: "255",
        isNullable: false,
      }),
    ]);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
