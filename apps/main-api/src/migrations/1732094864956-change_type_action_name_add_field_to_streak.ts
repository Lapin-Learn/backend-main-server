import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class ChangeTypeActionNameAddFieldToStreak1732094864956 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE actions ALTER COLUMN name TYPE varchar`);
    await queryRunner.query(`DROP TYPE IF EXISTS actions_name_enum`);
    await queryRunner.addColumn(
      "streaks",
      new TableColumn({
        name: "extended",
        type: "boolean",
        isNullable: false,
        default: false,
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
