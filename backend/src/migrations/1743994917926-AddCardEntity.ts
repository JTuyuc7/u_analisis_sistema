import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCardEntity1743994917926 implements MigrationInterface {
    name = 'AddCardEntity1743994917926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Card table
        await queryRunner.query(`CREATE TABLE "card" ("card_id" SERIAL NOT NULL, "card_number" character varying(16) NOT NULL, "expiration_date" character varying(5) NOT NULL, "security_code" character varying(3) NOT NULL, "status" character varying NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "account_id" integer, CONSTRAINT "PK_2ffd6d9e1f68281f24e5dabc608" PRIMARY KEY ("card_id"))`);
        
        // Add security_pin to Account table (first as nullable)
        await queryRunner.query(`ALTER TABLE "account" ADD "security_pin" character varying(4)`);
        
        // Set a default value (e.g., '0000') for existing records
        await queryRunner.query(`UPDATE "account" SET "security_pin" = '0000' WHERE "security_pin" IS NULL`);
        
        // Now make it NOT NULL
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "security_pin" SET NOT NULL`);
        
        // Add foreign key for Card to Account relationship
        await queryRunner.query(`ALTER TABLE "card" ADD CONSTRAINT "FK_77d7cc9d95dccd574d71ba221b0" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

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
        // Drop triggers
        await queryRunner.query(`DROP TRIGGER IF EXISTS enforce_card_limit ON card`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS enforce_account_limit ON account`);
        
        // Drop functions
        await queryRunner.query(`DROP FUNCTION IF EXISTS check_card_limit`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS check_account_limit`);
        
        // Remove foreign key for Card to Account relationship
        await queryRunner.query(`ALTER TABLE "card" DROP CONSTRAINT "FK_77d7cc9d95dccd574d71ba221b0"`);
        
        // Remove security_pin from Account table (reverse order of creation)
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "security_pin" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "security_pin"`);
        
        // Drop Card table
        await queryRunner.query(`DROP TABLE "card"`);
    }
}
