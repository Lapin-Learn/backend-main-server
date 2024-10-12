import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDailyStreakTableActions1728099067635 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE actions_name_enum_new AS ENUM ('daily_login', 'task_completed', 'daily_streak');

      ALTER TABLE actions 
        ALTER COLUMN name TYPE actions_name_enum_new 
        USING name::text::actions_name_enum_new;

      DROP TYPE actions_name_enum;

      ALTER TYPE actions_name_enum_new RENAME TO actions_name_enum;

      ALTER TABLE actions ADD UNIQUE (name);
    `);

    await queryRunner.query(`
      INSERT INTO actions (name) VALUES ('daily_streak');
    `);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}