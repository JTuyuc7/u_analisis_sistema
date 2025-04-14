import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1741820057326 implements MigrationInterface {
    name = 'InitialSchema1741820057326'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Customer table
        await queryRunner.query(`
            CREATE TABLE "customer" (
                "customer_id" SERIAL PRIMARY KEY,
                "first_name" varchar(50) NOT NULL,
                "last_name" varchar(50) NOT NULL,
                "email" varchar(100) NOT NULL UNIQUE,
                "password" varchar(255) NOT NULL,
                "phone" varchar(20),
                "address" text,
                "admin" boolean DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Create Account table
        await queryRunner.query(`
            CREATE TABLE "account" (
                "account_id" SERIAL PRIMARY KEY,
                "customer_id" integer REFERENCES "customer"("customer_id"),
                "account_number" varchar NOT NULL UNIQUE,
                "account_type" varchar NOT NULL,
                "account_name" varchar NOT NULL,
                "balance" decimal(15,2) DEFAULT 0,
                "status" varchar DEFAULT 'active',
                "security_pin" varchar(255) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Create Transaction table
        await queryRunner.query(`
            CREATE TABLE "transaction" (
                "transaction_id" SERIAL PRIMARY KEY,
                "account_id" integer REFERENCES "account"("account_id"),
                "transaction_type" varchar NOT NULL,
                "amount" decimal(15,2) NOT NULL,
                "description" varchar,
                "related_account_id" integer,
                "transaction_date" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Create Card table
        await queryRunner.query(`
            CREATE TABLE "card" (
                "card_id" SERIAL PRIMARY KEY,
                "card_number" varchar(16) NOT NULL,
                "expiration_date" varchar(5) NOT NULL,
                "security_code" varchar(3) NOT NULL,
                "account_id" integer REFERENCES "account"("account_id"),
                "status" varchar DEFAULT 'active',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Create Loan table
        await queryRunner.query(`
            CREATE TABLE "loan" (
                "loan_id" SERIAL PRIMARY KEY,
                "customer_id" integer REFERENCES "customer"("customer_id"),
                "loan_amount" decimal(15,2) NOT NULL,
                "interest_rate" decimal(5,2) NOT NULL,
                "loan_term" integer NOT NULL,
                "status" varchar DEFAULT 'pending',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Create Audit Logs table
        await queryRunner.query(`
            CREATE TABLE "audit_logs" (
                "log_id" SERIAL PRIMARY KEY,
                "customer_id" integer REFERENCES "customer"("customer_id"),
                "operation" varchar NOT NULL,
                "details" text,
                "log_date" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Create function to check card limit
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION check_card_limit()
            RETURNS TRIGGER AS $$
            BEGIN
                IF (
                    SELECT COUNT(*)
                    FROM card
                    WHERE "account_id" = NEW."account_id"
                    AND status = 'active'
                ) >= 2 THEN
                    RAISE EXCEPTION 'Account cannot have more than 2 active cards';
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Create trigger for card limit
        await queryRunner.query(`
            CREATE TRIGGER enforce_card_limit
            BEFORE INSERT OR UPDATE ON card
            FOR EACH ROW
            EXECUTE FUNCTION check_card_limit();
        `);

        // Create function to check account limit
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION check_account_limit()
            RETURNS TRIGGER AS $$
            BEGIN
                IF (
                    SELECT COUNT(*)
                    FROM account
                    WHERE "customerCustomerId" = NEW."customerCustomerId"
                    AND status = 'active'
                ) >= 3 THEN
                    RAISE EXCEPTION 'Customer cannot have more than 3 active accounts';
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Create trigger for account limit
        await queryRunner.query(`
            CREATE TRIGGER enforce_account_limit
            BEFORE INSERT OR UPDATE ON account
            FOR EACH ROW
            EXECUTE FUNCTION check_account_limit();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop triggers first
        await queryRunner.query(`DROP TRIGGER IF EXISTS enforce_card_limit ON card`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS enforce_account_limit ON account`);
        
        // Drop functions
        await queryRunner.query(`DROP FUNCTION IF EXISTS check_card_limit`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS check_account_limit`);

        // Drop tables in reverse order to handle foreign key constraints
        await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "loan"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "card"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "transaction"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "account"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "customer"`);
    }
}
