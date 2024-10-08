import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnBandScoreRequiresQuestionType1728099079758 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "question_types",
      new TableColumn({
        name: "band_score_requires",
        type: "jsonb",
        isNullable: true,
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
