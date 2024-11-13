import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class FixBucket1730628700796 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get buckets without owner
    const invalidBuckets = await queryRunner.query(`
        SELECT buckets.id FROM buckets
        LEFT JOIN accounts ON buckets.owner = accounts.id
        WHERE accounts.id IS NULL
    `);

    // Update owner to admin
    if (invalidBuckets.length > 0) {
      const admin = await queryRunner.query(`
            SELECT id FROM accounts WHERE role = 'admin' LIMIT 1
        `);

      await queryRunner.query(`
        UPDATE buckets
        SET owner = '${admin[0].id}'
        WHERE id IN (${invalidBuckets.map((bucket) => `'${bucket.id}'`).join(",")})
    `);
    }

    // Add foreign key
    await queryRunner.createForeignKey(
      "buckets",
      new TableForeignKey({
        name: "FK_BUCKETS_OWNER",
        columnNames: ["owner"],
        referencedColumnNames: ["id"],
        referencedTableName: "accounts",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
