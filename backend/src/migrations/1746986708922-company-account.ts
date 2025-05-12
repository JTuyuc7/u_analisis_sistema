import { MigrationInterface, QueryRunner } from "typeorm";

export class CompanyAccount1746986708922 implements MigrationInterface {
    name = 'CompanyAccount1746986708922'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns for company revenue account with defaults to handle existing data
        await queryRunner.query(`ALTER TABLE "account" ADD "is_revenue_account" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "account" ADD "associated_company" character varying(255) DEFAULT NULL`);
        
        // Update all existing accounts to have is_revenue_account = false
        await queryRunner.query(`UPDATE "account" SET "is_revenue_account" = false WHERE "is_revenue_account" IS NULL`);
        
        // Now make is_revenue_account NOT NULL after setting defaults
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "is_revenue_account" SET NOT NULL`);
        
        // Add new column for revenue transactions with defaults
        await queryRunner.query(`ALTER TABLE "transaction" ADD "is_revenue_transaction" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "revenue_account_id" integer DEFAULT NULL`);
        
        // Update all existing transactions to have is_revenue_transaction = false
        await queryRunner.query(`UPDATE "transaction" SET "is_revenue_transaction" = false WHERE "is_revenue_transaction" IS NULL`);
        
        // Now make is_revenue_transaction NOT NULL after setting defaults
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "is_revenue_transaction" SET NOT NULL`);
        
        // Original migration content
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "transaction_account_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_transaction_customer"`);
        await queryRunner.query(`ALTER TABLE "card" DROP CONSTRAINT "card_account_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "account_customer_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "loan" DROP CONSTRAINT "loan_customer_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_customer_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "customer_id"`);
        await queryRunner.query(`ALTER TABLE "loan" ADD "customerCustomerId" integer`);
        await queryRunner.query(`ALTER TABLE "card" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "balance" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "admin" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_e2652fa8c16723c83a00fb9b17e" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_2403d74bd6e5ca5a94e063c5506" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "card" ADD CONSTRAINT "FK_1d327e4dd5f78db21a1c5fe95ac" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "FK_977b5abdf1370566eaade16eaa9" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loan" ADD CONSTRAINT "FK_3b9f9262ed08a84c62268b7c324" FOREIGN KEY ("customerCustomerId") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_ae4d874ca19efb1b55189a293db" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_ae4d874ca19efb1b55189a293db"`);
        await queryRunner.query(`ALTER TABLE "loan" DROP CONSTRAINT "FK_3b9f9262ed08a84c62268b7c324"`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "FK_977b5abdf1370566eaade16eaa9"`);
        await queryRunner.query(`ALTER TABLE "card" DROP CONSTRAINT "FK_1d327e4dd5f78db21a1c5fe95ac"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_2403d74bd6e5ca5a94e063c5506"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_e2652fa8c16723c83a00fb9b17e"`);
        await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "admin" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "balance" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "card" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "customerCustomerId"`);
        await queryRunner.query(`ALTER TABLE "loan" ADD "customer_id" integer`);
        
        // Drop the new columns we added
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "revenue_account_id"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "is_revenue_transaction"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "associated_company"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "is_revenue_account"`);
        
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loan" ADD CONSTRAINT "loan_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "account_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "card" ADD CONSTRAINT "card_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_transaction_customer" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
