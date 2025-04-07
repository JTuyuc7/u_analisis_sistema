import { MigrationInterface, QueryRunner } from "typeorm";

export class EnableHashedPin1744002038212 implements MigrationInterface {
    name = 'EnableHashedPin1744002038212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "card" DROP CONSTRAINT "FK_77d7cc9d95dccd574d71ba221b0"`);
        await queryRunner.query(`ALTER TABLE "loan" DROP CONSTRAINT "FK_447bba13bdca8101c3f9e783de9"`);
        await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "customer_id"`);
        await queryRunner.query(`ALTER TABLE "loan" ADD "customerCustomerId" integer`);
        // Create temporary column
        await queryRunner.query(`ALTER TABLE "account" ADD "security_pin_new" character varying(255)`);
        
        // Copy data from old column to new column
        await queryRunner.query(`UPDATE "account" SET "security_pin_new" = "security_pin"`);
        
        // Drop old column
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "security_pin"`);
        
        // Rename new column to original name
        await queryRunner.query(`ALTER TABLE "account" RENAME COLUMN "security_pin_new" TO "security_pin"`);
        
        // Set NOT NULL constraint
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "security_pin" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "loan_term" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "loan" ADD "status" character varying NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "updated_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "updated_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "card" ADD CONSTRAINT "FK_1d327e4dd5f78db21a1c5fe95ac" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loan" ADD CONSTRAINT "FK_3b9f9262ed08a84c62268b7c324" FOREIGN KEY ("customerCustomerId") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "loan" DROP CONSTRAINT "FK_3b9f9262ed08a84c62268b7c324"`);
        await queryRunner.query(`ALTER TABLE "card" DROP CONSTRAINT "FK_1d327e4dd5f78db21a1c5fe95ac"`);
        await queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "updated_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "loan" ADD "status" character varying(20) DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "loan_term" DROP NOT NULL`);
        // For rolling back, we'll do the same process in reverse
        await queryRunner.query(`ALTER TABLE "account" ADD "security_pin_old" character varying(4)`);
        await queryRunner.query(`UPDATE "account" SET "security_pin_old" = "security_pin"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "security_pin"`);
        await queryRunner.query(`ALTER TABLE "account" RENAME COLUMN "security_pin_old" TO "security_pin"`);
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "security_pin" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "customerCustomerId"`);
        await queryRunner.query(`ALTER TABLE "loan" ADD "customer_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "loan" ADD CONSTRAINT "FK_447bba13bdca8101c3f9e783de9" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "card" ADD CONSTRAINT "FK_77d7cc9d95dccd574d71ba221b0" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
