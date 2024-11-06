import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnsProfileItems1730626391923 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Allow nullable for exp_at
    await queryRunner.query(`ALTER TABLE "profile_items" ALTER COLUMN "exp_at" DROP NOT NULL`);

    // Add new column
    await queryRunner.addColumns("profile_items", [
      new TableColumn({
        name: "in_use_quantity",
        type: "integer",
        isNullable: false,
        default: 0,
      }),
      new TableColumn({
        name: "status",
        type: "enum",
        enum: ["unused", "in_use"],
        isNullable: false,
        default: "'unused'",
      }),
    ]);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
