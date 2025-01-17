import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTransactionsPayosTransactionsTable1737091114419 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "transactions",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "account_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "status",
            type: "varchar",
          },
          {
            name: "created_at",
            type: "timestamp",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            name: "FK_TRANSACTIONS_ACCOUNT_ID",
            columnNames: ["account_id"],
            referencedTableName: "accounts",
            referencedColumnNames: ["id"],
          },
        ],
      })
    );
    await queryRunner.createTable(
      new Table({
        name: "payos_transactions",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: false,
          },
          {
            name: "transaction_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "amount",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "status",
            type: "varchar",
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            name: "FK_PAYOS_TRANSACTIONS_TRANSACTION_ID",
            columnNames: ["transaction_id"],
            referencedTableName: "transactions",
            referencedColumnNames: ["id"],
          },
        ],
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method is not implemented");
  }
}
