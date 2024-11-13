import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableProfileBadges1722831540571 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "profile_badges",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "profile_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "badge_id",
            type: "uuid",
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            name: "FK_PROFILE_BADGES_PROFILE_ID",
            columnNames: ["profile_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "learner_profiles",
            onDelete: "CASCADE",
          },
          {
            name: "FK_PROFILE_BADGES_BADGE_ID",
            columnNames: ["badge_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "badges",
            onDelete: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
