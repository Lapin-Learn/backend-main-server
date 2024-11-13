import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import { CEFRLevelEum } from "../../../../libs/types/src/enums";

export class ChangeColumnQuestions1727279005954 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "questions",
      "cerf_level",
      new TableColumn({
        name: "cefr_level",
        type: "enum",
        enum: [
          CEFRLevelEum.Any,
          CEFRLevelEum.A1,
          CEFRLevelEum.A2,
          CEFRLevelEum.B1,
          CEFRLevelEum.B2,
          CEFRLevelEum.C1,
          CEFRLevelEum.C2,
        ],
        isNullable: false,
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
