import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveSpeakingRoomTable1737175896419 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS speaking_rooms;`);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
