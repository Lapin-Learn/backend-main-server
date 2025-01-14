import { MigrationInterface, QueryRunner, TableUnique } from "typeorm";

export class SetEmailUniqueAccounts1736829061333 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createUniqueConstraint(
      "accounts",
      new TableUnique({
        name: "UQ_ACCOUNTS_EMAIL",
        columnNames: ["email"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint("accounts", "UQ_ACCOUNTS_EMAIL");
  }
}
