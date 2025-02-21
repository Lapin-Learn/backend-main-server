import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableBlog1739697811307 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "blogs",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "title",
            type: "text",
            isNullable: false,
            default: "''",
          },
          {
            name: "content",
            type: "text",
            isNullable: false,
            default: "''",
          },
          {
            name: "thumbnail_id",
            type: "uuid",
            isNullable: false,
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
            name: "FK_BLOGS_THUMBNAIL_ID",
            columnNames: ["thumbnail_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "buckets",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("blogs");
  }
}
