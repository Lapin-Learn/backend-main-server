import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class ChangeColumnNotificationTokenToNullable1730887408576 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "notification_tokens", // Replace with your actual table name
      "token",
      new TableColumn({
        name: "token",
        type: "varchar", // Replace with the actual type of your column
        isNullable: true,
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
