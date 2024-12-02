import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageForFillInTheBlank1731826164408 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const admin = await queryRunner.query(`
        SELECT id FROM accounts WHERE role = 'admin' LIMIT 1
    `);

    await queryRunner.query(`
        INSERT INTO buckets (id, name, owner, permission, upload_status)
        VALUES 
          ('ac599423-d557-4670-b7d6-661b71efd9ea', 'fill_in_the_blanks.png', '${admin[0].id}', 'public', 'uploaded');
    `);

    // Find all in table 'question_types' where name = 'Fill In The Blanks'
    const fillInTheBlank = await queryRunner.query(`
        SELECT id FROM question_types WHERE name = 'Fill In The Blanks'
    `);

    // Update the image field in the 'question_types' table
    if (fillInTheBlank.length > 0) {
      fillInTheBlank.forEach(async (e) => {
        await queryRunner.query(`
            UPDATE question_types
            SET image_id = 'ac599423-d557-4670-b7d6-661b71efd9ea'
            WHERE id = '${e.id}'
        `);
      });
    }
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
