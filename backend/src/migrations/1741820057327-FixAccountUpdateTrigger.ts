import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAccountUpdateTrigger1741820057327 implements MigrationInterface {
    name = 'FixAccountUpdateTrigger1741820057327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the existing trigger
        await queryRunner.query(`DROP TRIGGER IF EXISTS enforce_account_limit ON account`);
        
        // Drop the existing function
        await queryRunner.query(`DROP FUNCTION IF EXISTS check_account_limit`);

        // Create an improved function that only checks on relevant operations
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION check_account_limit()
            RETURNS TRIGGER AS $$
            BEGIN
                -- Only check the limit when:
                -- 1. Inserting a new active account
                -- 2. Updating an account's status from inactive to active
                IF (TG_OP = 'INSERT' AND NEW.status = 'active') OR 
                   (TG_OP = 'UPDATE' AND OLD.status != 'active' AND NEW.status = 'active') THEN
                    IF (
                        SELECT COUNT(*)
                        FROM account
                        WHERE "customer_id" = NEW."customer_id"
                        AND status = 'active'
                        AND (TG_OP != 'UPDATE' OR account_id != NEW.account_id) -- Don't count the current account in updates
                    ) > 3 THEN
                        RAISE EXCEPTION 'Customer cannot have more than 3 active accounts';
                    END IF;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Create a new trigger that uses the improved function
        await queryRunner.query(`
            CREATE TRIGGER enforce_account_limit
            BEFORE INSERT OR UPDATE ON account
            FOR EACH ROW
            EXECUTE FUNCTION check_account_limit();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the new trigger
        await queryRunner.query(`DROP TRIGGER IF EXISTS enforce_account_limit ON account`);
        
        // Drop the new function
        await queryRunner.query(`DROP FUNCTION IF EXISTS check_account_limit`);

        // Restore the original function
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION check_account_limit()
            RETURNS TRIGGER AS $$
            BEGIN
                IF (
                    SELECT COUNT(*)
                    FROM account
                    WHERE "customer_id" = NEW."customer_id"
                    AND status = 'active'
                ) > 3 THEN
                    RAISE EXCEPTION 'Customer cannot have more than 3 active accounts';
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Restore the original trigger
        await queryRunner.query(`
            CREATE TRIGGER enforce_account_limit
            BEFORE INSERT OR UPDATE ON account
            FOR EACH ROW
            EXECUTE FUNCTION check_account_limit();
        `);
    }
}
