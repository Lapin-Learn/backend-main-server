import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableLessonProcesses1726339873143 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "lesson_processes",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "learner_profile_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "question_type_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "current_lesson_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "band_score",
            type: "enum",
            enum: ["pre_ielts", "4.5", "5.0", "5.5", "6.0", "6.5", "7.0"],
            default: "'pre_ielts'",
            isNullable: false,
          },
          {
            name: "xp",
            type: "jsonb",
            isNullable: false,
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
            name: "FK_LESSON_PROCESSES_LEARNER_PROFILE_ID",
            columnNames: ["learner_profile_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "learner_profiles",
          },
          {
            name: "FK_LESSON_PROCESSES_QUESTION_TYPE_ID",
            columnNames: ["question_type_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "question_types",
          },
          {
            name: "FK_LESSON_PROCESSES_CURRENT_LESSON_ID",
            columnNames: ["current_lesson_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "lessons",
          },
        ],
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
