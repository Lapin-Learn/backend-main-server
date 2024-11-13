import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnMission1728700582608 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "missions",
      new TableColumn({
        name: "quantity",
        type: "int",
        isNullable: false,
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
