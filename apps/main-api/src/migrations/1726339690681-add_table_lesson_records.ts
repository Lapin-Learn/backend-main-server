import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableLessonRecords1726339690681 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "lesson_records",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "lesson_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "learner_profile_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "correct_answers",
            type: "int",
            isNullable: false,
          },
          {
            name: "wrong_answers",
            type: "int",
            isNullable: false,
          },
          {
            name: "duration",
            type: "int", // seconds
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
            name: "FK_LESSON_RECORDS_LESSON_ID",
            columnNames: ["lesson_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "lessons",
          },
          {
            name: "FK_LESSON_RECORDS_LEARNER_PROFILE_ID",
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
