import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableSpeakingRoomEvaluations1735097292241 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "speaking_room_evaluations",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "speaking_room_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "profile_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "part1",
            type: "jsonb",
            isNullable: false,
            default: "'{}'::jsonb",
          },
          {
            name: "part2",
            type: "jsonb",
            isNullable: false,
            default: "'{}'::jsonb",
          },
          {
            name: "part3",
            type: "jsonb",
            isNullable: false,
            default: "'{}'::jsonb",
          },
          {
            name: "overall",
            type: "jsonb",
            isNullable: false,
            default: "'{}'::jsonb",
          },
          {
            name: "created_at",
            type: "timestamp",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            name: "FK_SPEAKING_ROOM_EVALUATIONS_SPEAKING_ROOM",
            columnNames: ["speaking_room_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "speaking_rooms",
            onDelete: "CASCADE",
          },
          {
            name: "FK_SPEAKING_ROOM_EVALUATIONS_LEARNER_PROFILE",
            columnNames: ["profile_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "learner_profiles",
            onDelete: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
