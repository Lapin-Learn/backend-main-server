import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultDataTableActions1724746216325 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO actions (name) VALUES
        ('daily_login'),
        ('task_completed');
      `
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
