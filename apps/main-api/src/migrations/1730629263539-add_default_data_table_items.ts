import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultDataTableItems1730629263539 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Find an account with role is admin
    const admin = await queryRunner.query(`
        SELECT id FROM accounts WHERE role = 'admin' LIMIT 1;
      `);

    await queryRunner.query(`
        INSERT INTO buckets (id, name, owner, permission, upload_status)
        VALUES 
          ('b51ae487-d2a8-4592-986f-fc444c84b9e9', 'streak_freeze.png', '${admin[0].id}', 'public', 'uploaded'),
          ('710b936c-ee1e-419c-9385-007d6bd36faf', 'random_gift.png', '${admin[0].id}', 'public', 'uploaded'),
          ('f074c116-d74a-440b-8d18-796e9e115822', 'ultimate_time.png', '${admin[0].id}', 'public', 'uploaded'),
          ('458f1b59-5304-48d4-89e5-c4b5e1782dac', 'identification.png', '${admin[0].id}', 'public', 'uploaded');
    `);

    await queryRunner.query(`
        INSERT INTO items (name, description, price, duration, category, image_id) 
        VALUES 
          ('STREAK_FREEZE', 'Streak Freeze', '{"1": 200}', 0, 'EQUIPMENT', 'b51ae487-d2a8-4592-986f-fc444c84b9e9'),
          ('RANDOM_GIFT', 'Quà tặng ngẫu nhiên', '{"1": 150}', 0, 'EQUIPMENT', '710b936c-ee1e-419c-9385-007d6bd36faf'),
          ('ULTIMATE_TIME', 'Thời gian siêu cấp', '{"1": 100, "5": 400, "15": 1000}', 15, 'DOUBLE_POWER', 'f074c116-d74a-440b-8d18-796e9e115822'),
          ('IDENTIFICATION', 'Nhận diện', '{"1": 20, "5": 80, "15": 200}', 0, 'DOUBLE_POWER', '458f1b59-5304-48d4-89e5-c4b5e1782dac');
    `);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
