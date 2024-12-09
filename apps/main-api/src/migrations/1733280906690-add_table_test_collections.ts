import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddTableTestCollections1733280906690 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "test_collections",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "thumbnail_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "tags",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "keyword",
            type: "tsvector",
            isNullable: false,
          },
          {
            name: "description",
            type: "varchar",
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
            name: "FK_TEST_COLLECTIONS_THUMBNAIL_ID",
            columnNames: ["thumbnail_id"],
            referencedTableName: "buckets",
            referencedColumnNames: ["id"],
          },
        ],
      })
    );

    await queryRunner.query(`CREATE INDEX IDX_TEST_COLLECTIONS_KEYWORD ON test_collections USING GIN (keyword);`);

    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION news_tsv_trigger_func()
    RETURNS TRIGGER LANGUAGE plpgsql AS $$
    BEGIN NEW.keyword =
	      setweight(to_tsvector('english', NEW.name), 'A') ||
	      setweight(to_tsvector('english', NEW.tags), 'B');
    RETURN NEW;
    END $$;

    CREATE TRIGGER news_tsv_trigger BEFORE INSERT OR UPDATE
    OF name, tags, description ON test_collections FOR EACH ROW
    EXECUTE PROCEDURE news_tsv_trigger_func();`);
  }

  public async down(): Promise<void> {
    throw new Error("Method is not implemented");
  }
}
