import { BandScoreEnum } from "../../../../libs/types/src/enums/band-score.enum";
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnLessons1726391126919 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "lessons",
      new TableColumn({
        name: "band_score",
        type: "enum",
        enum: [
          BandScoreEnum.PRE_IELTS,
          BandScoreEnum.BAND_4_5,
          BandScoreEnum.BAND_5_0,
          BandScoreEnum.BAND_5_5,
          BandScoreEnum.BAND_6_0,
          BandScoreEnum.BAND_6_5,
          BandScoreEnum.BAND_7_0,
        ],
        isNullable: true,
      })
    );

    await queryRunner.query(`UPDATE lessons SET band_score = '${BandScoreEnum.PRE_IELTS}' WHERE band_score IS NULL`);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
