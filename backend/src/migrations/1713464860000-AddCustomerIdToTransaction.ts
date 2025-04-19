import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerIdToTransaction1713464860000 implements MigrationInterface {
    name = 'AddCustomerIdToTransaction1713464860000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add customer_id column to transaction table
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD COLUMN "customer_id" integer
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD CONSTRAINT "FK_transaction_customer"
            FOREIGN KEY ("customer_id")
            REFERENCES "customer"("customer_id")
        `);

        // Update existing transactions to set customer_id based on account's customer_id
        await queryRunner.query(`
            UPDATE "transaction" t
            SET "customer_id" = (
                SELECT a."customer_id"
                FROM "account" a
                WHERE a."account_id" = t."account_id"
            )
            WHERE t."account_id" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "transaction"
            DROP CONSTRAINT "FK_transaction_customer"
        `);

        // Drop customer_id column
        await queryRunner.query(`
            ALTER TABLE "transaction"
            DROP COLUMN "customer_id"
        `);
    }
}
