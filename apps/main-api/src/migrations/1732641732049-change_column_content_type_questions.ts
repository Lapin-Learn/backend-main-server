import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeColumnContentTypeQuestions1732641732049 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE questions ALTER COLUMN content_type TYPE varchar`);

    await queryRunner.query(`DROP TYPE IF EXISTS questions_content_type_enum`);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
