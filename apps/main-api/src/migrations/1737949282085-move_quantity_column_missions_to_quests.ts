import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class MoveQuantityColumnMissionsToQuests1737949282085 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("missions", "quantity");
    await queryRunner.addColumn(
      "quests",
      new TableColumn({
        name: "quantity",
        type: "int",
        isNullable: false,
        default: 0,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("quests", "quantity");
    await queryRunner.addColumn(
      "missions",
      new TableColumn({
        name: "quantity",
        type: "int",
        isNullable: false,
        default: 0,
      })
    );
  }
}
