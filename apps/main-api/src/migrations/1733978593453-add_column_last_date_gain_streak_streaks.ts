import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnLastDateGainStreakStreaks1733978593453 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "streaks",
      new TableColumn({
        name: "last_date_gain_new_streak",
        type: "timestamp",
        isNullable: false,
        default: "CURRENT_TIMESTAMP",
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method is not implementedt");
  }
}
