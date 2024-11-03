import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class UpdateColumnsTableItems1730564194925 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("items", [
      new TableColumn({
        name: "image_id",
        type: "uuid",
        isNullable: true,
      }),
      new TableColumn({
        name: "category",
        type: "enum",
        enum: ["EQUIPMENT", "DOUBLE_POWER"],
        isNullable: false,
      }),
    ]);

    await queryRunner.createForeignKey(
      "items",
      new TableForeignKey({
        name: "FK_ITEMS_IMAGE_ID",
        columnNames: ["image_id"],
        referencedTableName: "buckets",
        referencedColumnNames: ["id"],
      })
    );

    await queryRunner.changeColumn(
      "items",
      "price",
      new TableColumn({
        name: "price",
        type: "jsonb",
        isNullable: false,
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
