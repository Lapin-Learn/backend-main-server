import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableNotificationTokens1730134758802 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "notification_tokens",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
            default: `uuid_generate_v4()`,
          },
          {
            name: "account_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "token",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: `CURRENT_TIMESTAMP`,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: `CURRENT_TIMESTAMP`,
            onUpdate: `CURRENT_TIMESTAMP`,
          },
        ],
        foreignKeys: [
          {
            name: "FK_NOTIFICATION_TOKENS_ACCOUNT_ID",
            columnNames: ["account_id"],
            referencedTableName: "accounts",
            referencedColumnNames: ["id"],
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
