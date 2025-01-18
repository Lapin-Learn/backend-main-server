import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTypeColumnEmailAccounts1737192787237 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE accounts
      ALTER COLUMN email TYPE TEXT;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE accounts
      ALTER COLUMN email TYPE VARCHAR(50);`);
  }
}
