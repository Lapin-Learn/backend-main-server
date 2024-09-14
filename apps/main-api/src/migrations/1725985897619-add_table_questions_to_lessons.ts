import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableQuestionsToLessons1725985897619 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "questions_to_lessons",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "question_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "lesson_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "order",
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
            name: "FK_QUESTION_TO_LESSON_QUESTION_ID",
            columnNames: ["question_id"],
            referencedTableName: "questions",
            referencedColumnNames: ["id"],
          },
          {
            name: "FK_QUESTION_TO_LESSON_LESSON_ID",
            columnNames: ["lesson_id"],
            referencedTableName: "lessons",
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
