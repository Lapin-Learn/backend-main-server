import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAmountItemsColumns1737359760106 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("transactions", [
      new TableColumn({
        name: "amount",
        type: "decimal",
        precision: 10,
        scale: 2,
        default: 0,
      }),
      new TableColumn({
        name: "items",
        type: "jsonb",
        default: "'[]'",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("transactions", "amount");
    await queryRunner.dropColumn("transactions", "items");
  }
}
