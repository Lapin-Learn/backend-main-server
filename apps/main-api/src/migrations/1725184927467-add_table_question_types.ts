import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableQuestionTypes1725184927467 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "question_types",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "text",
            isNullable: false,
          },
          {
            name: "skill",
            type: "enum",
            enum: ["speaking", "listening", "reading", "writing"],
            isNullable: false,
          },
          {
            name: "image_id",
            type: "uuid",
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
            name: "FK_QUESTION_TYPES_IMAGE_ID",
            columnNames: ["image_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "buckets",
          },
        ],
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
