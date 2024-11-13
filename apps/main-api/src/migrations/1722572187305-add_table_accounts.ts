import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableAccounts1722572187305 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "accounts",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "provider_id",
            type: "varchar",
            length: "36",
            isNullable: false,
          },
          {
            name: "username",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "role",
            type: "enum",
            enum: ["learner", "expert", "admin"],
            isNullable: false,
            default: "'learner'",
          },
          {
            name: "full_name",
            type: "varchar",
            length: "50",
            isNullable: true,
            default: null,
          },
          {
            name: "dob",
            type: "date",
            isNullable: true,
            default: null,
          },
          {
            name: "gender",
            type: "enum",
            enum: ["male", "female"],
            isNullable: true,
            default: null,
          },
          {
            name: "learner_profile_id",
            type: "uuid",
            isNullable: true,
            default: null,
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
            name: "FK_ACCOUNTS_LEARNER_PROFILE_ID",
            columnNames: ["learner_profile_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "learner_profiles",
          },
        ],
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
