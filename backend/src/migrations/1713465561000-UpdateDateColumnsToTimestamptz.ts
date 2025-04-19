import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDateColumnsToTimestamptz1713465561000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Account table
        await queryRunner.query(`
            ALTER TABLE "account" 
            ALTER COLUMN "created_at" TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
            ALTER COLUMN "updated_at" TYPE timestamptz USING updated_at AT TIME ZONE 'UTC'
        `);

        // Audit logs table
        await queryRunner.query(`
            ALTER TABLE "audit_logs" 
            ALTER COLUMN "log_date" TYPE timestamptz USING log_date AT TIME ZONE 'UTC'
        `);

        // Card table
        await queryRunner.query(`
            ALTER TABLE "card" 
            ALTER COLUMN "created_at" TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
            ALTER COLUMN "updated_at" TYPE timestamptz USING updated_at AT TIME ZONE 'UTC'
        `);

        // Customer table
        await queryRunner.query(`
            ALTER TABLE "customer" 
            ALTER COLUMN "created_at" TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
            ALTER COLUMN "updated_at" TYPE timestamptz USING updated_at AT TIME ZONE 'UTC'
        `);

        // Loan table
        await queryRunner.query(`
            ALTER TABLE "loan" 
            ALTER COLUMN "created_at" TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
            ALTER COLUMN "updated_at" TYPE timestamptz USING updated_at AT TIME ZONE 'UTC'
        `);

        // Transaction table
        await queryRunner.query(`
            ALTER TABLE "transaction" 
            ALTER COLUMN "transaction_date" TYPE timestamptz USING transaction_date AT TIME ZONE 'UTC'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Account table
        await queryRunner.query(`
            ALTER TABLE "account" 
            ALTER COLUMN "created_at" TYPE timestamp USING created_at AT TIME ZONE 'UTC',
            ALTER COLUMN "updated_at" TYPE timestamp USING updated_at AT TIME ZONE 'UTC'
        `);

        // Audit logs table
        await queryRunner.query(`
            ALTER TABLE "audit_logs" 
            ALTER COLUMN "log_date" TYPE timestamp USING log_date AT TIME ZONE 'UTC'
        `);

        // Card table
        await queryRunner.query(`
            ALTER TABLE "card" 
            ALTER COLUMN "created_at" TYPE timestamp USING created_at AT TIME ZONE 'UTC',
            ALTER COLUMN "updated_at" TYPE timestamp USING updated_at AT TIME ZONE 'UTC'
        `);

        // Customer table
        await queryRunner.query(`
            ALTER TABLE "customer" 
            ALTER COLUMN "created_at" TYPE timestamp USING created_at AT TIME ZONE 'UTC',
            ALTER COLUMN "updated_at" TYPE timestamp USING updated_at AT TIME ZONE 'UTC'
        `);

        // Loan table
        await queryRunner.query(`
            ALTER TABLE "loan" 
            ALTER COLUMN "created_at" TYPE timestamp USING created_at AT TIME ZONE 'UTC',
            ALTER COLUMN "updated_at" TYPE timestamp USING updated_at AT TIME ZONE 'UTC'
        `);

        // Transaction table
        await queryRunner.query(`
            ALTER TABLE "transaction" 
            ALTER COLUMN "transaction_date" TYPE timestamp USING transaction_date AT TIME ZONE 'UTC'
        `);
    }
}
