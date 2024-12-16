import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnBandScoreEstimateSessions1734337729262 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "skill_test_sessions",
      new TableColumn({
        name: "estimated_band_score",
        type: "double precision",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("skill_test_sessions", "band_score_estimated");
  }
}
