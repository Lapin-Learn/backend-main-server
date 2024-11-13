import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnCreateAndUpdateDate1728575782228 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      !(await queryRunner.hasColumn("badges", "created_at")) &&
      !(await queryRunner.hasColumn("badges", "updated_at"))
    ) {
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
    }

    if (
      !(await queryRunner.hasColumn("items", "created_at")) &&
      !(await queryRunner.hasColumn("items", "updated_at"))
    ) {
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
    }

    if (
      !(await queryRunner.hasColumn("missions", "created_at")) &&
      !(await queryRunner.hasColumn("missions", "updated_at"))
    ) {
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
    }

    if (
      !(await queryRunner.hasColumn("profile_items", "created_at")) &&
      !(await queryRunner.hasColumn("profile_items", "updated_at"))
    ) {
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
    }

    if (
      !(await queryRunner.hasColumn("profile_badges", "created_at")) &&
      !(await queryRunner.hasColumn("profile_badges", "updated_at"))
    ) {
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
    }

    if (
      !(await queryRunner.hasColumn("profile_missions", "created_at")) &&
      !(await queryRunner.hasColumn("profile_missions", "updated_at"))
    ) {
      await queryRunner.addColumns("profile_missions", [
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

    if (
      !(await queryRunner.hasColumn("quests", "created_at")) &&
      !(await queryRunner.hasColumn("quests", "updated_at"))
    ) {
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
    }

    if (
      !(await queryRunner.hasColumn("streaks", "created_at")) &&
      !(await queryRunner.hasColumn("streaks", "updated_at"))
    ) {
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
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
