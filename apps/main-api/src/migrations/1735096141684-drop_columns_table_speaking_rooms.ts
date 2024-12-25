import { MigrationInterface, QueryRunner } from "typeorm";

export class DropColumnsTableSpeakingRooms1735096141684 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove the foreign key constraint
    await queryRunner.query(`ALTER TABLE speaking_room_questions DROP CONSTRAINT "FK_SPEAKING_ROOMS_LEARNER_PROFILES"`);

    // Drop columns: evaluation, profile_id
    await queryRunner.query(`ALTER TABLE speaking_room_questions DROP COLUMN evaluation, DROP COLUMN profile_id`);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
