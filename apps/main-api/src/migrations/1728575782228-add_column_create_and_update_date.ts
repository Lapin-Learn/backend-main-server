import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnCreateAndUpdateDate1728575782228 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("badges", [
      new TableColumn({
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false,
      }),
      new TableColumn({
        name: "updated_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false,
      }),
    ]);

    await queryRunner.addColumns("items", [
      new TableColumn({
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false,
      }),
      new TableColumn({
        name: "updated_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false,
      }),
    ]);

    await queryRunner.addColumns("missions", [
      new TableColumn({
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false,
      }),
      new TableColumn({
        name: "updated_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false,
      }),
    ]);

    await queryRunner.addColumns("profile_items", [
      new TableColumn({
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false,
      }),
      new TableColumn({
        name: "updated_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false,
      }),
    ]);

    await queryRunner.addColumns("profile_badges", [
      new TableColumn({
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false,
      }),
      new TableColumn({
        name: "updated_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false,
      }),
    ]);

    await queryRunner.addColumns("quests", [
      new TableColumn({
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false,
      }),
      new TableColumn({
        name: "updated_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false,
      }),
    ]);

    await queryRunner.addColumns("streaks", [
      new TableColumn({
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false,
      }),
      new TableColumn({
        name: "updated_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
        isNullable: false,
      }),
    ]);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
