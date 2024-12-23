import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDeletedColumnAccounts1734919080860 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("accounts", [
      new TableColumn({
        name: "deleted_at",
        type: "timestamp",
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("accounts", "deleted_at");
  }
}
