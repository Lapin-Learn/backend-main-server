import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableQuestions1725985337896 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "questions",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "content_type",
            type: "enum",
            enum: ["multiple_choice", "fill_in_the_blank", "matching"],
            isNullable: false,
          },
          {
            name: "content",
            type: "jsonb",
            isNullable: false,
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
            name: "cerf_level",
            type: "enum",
            enum: ["A1", "A2", "B1", "B2", "C1", "C2", "Any"],
            isNullable: false,
          },
          {
            name: "explanation",
            type: "text",
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
            name: "FK_QUESTION_IMAGE_ID",
            columnNames: ["image_id"],
            referencedTableName: "buckets",
            referencedColumnNames: ["id"],
          },
          {
            name: "FK_QUESTION_AUDIO_ID",
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
