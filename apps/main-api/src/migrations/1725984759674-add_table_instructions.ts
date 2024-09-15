import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableInstructions1725984759674 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "instructions",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "content",
            type: "text",
            isNullable: false,
          },
          {
            name: "order",
            type: "int",
            isNullable: false,
            default: 0,
          },
          {
            name: "image_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "audio_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "question_type_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            name: "FK_INSTRUCTION_QUESTION_TYPE_ID",
            columnNames: ["question_type_id"],
            referencedTableName: "question_types",
            referencedColumnNames: ["id"],
          },
          {
            name: "FK_INSTRUCTION_IMAGE_ID",
            columnNames: ["image_id"],
            referencedTableName: "buckets",
            referencedColumnNames: ["id"],
          },
          {
            name: "FK_INSTRUCTION_AUDIO_ID",
            columnNames: ["audio_id"],
            referencedTableName: "buckets",
            referencedColumnNames: ["id"],
          },
        ],
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
