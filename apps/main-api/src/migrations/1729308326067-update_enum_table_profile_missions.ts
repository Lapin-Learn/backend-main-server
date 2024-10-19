import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEnumTableProfileMissions1729308326067 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE profile_missions_status_enum_new AS ENUM ('assigned', 'completed', 'received');
  
        ALTER TABLE profile_missions_progress 
          ALTER COLUMN status DROP DEFAULT,
          ALTER COLUMN status TYPE profile_missions_status_enum_new 
          USING status::text::profile_missions_status_enum_new;
        
        ALTER TABLE profile_missions_progress 
          ALTER COLUMN status SET DEFAULT 'assigned';
        
        DROP TYPE profile_missions_status_enum;
  
        ALTER TYPE profile_missions_status_enum_new RENAME TO profile_mission_progress_status_enum;
    `);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
