import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddColumnAccounts1727246716019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "accounts",
      new TableColumn({
        name: "avatar_id",
        type: "uuid",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "accounts",
      new TableForeignKey({
        name: "FK_ACCOUNTS_AVATAR_ID",
        columnNames: ["avatar_id"],
        referencedTableName: "buckets",
        referencedColumnNames: ["id"],
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
