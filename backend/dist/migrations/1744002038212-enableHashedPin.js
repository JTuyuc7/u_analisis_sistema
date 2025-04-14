"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnableHashedPin1744002038212 = void 0;
class EnableHashedPin1744002038212 {
    constructor() {
        this.name = 'EnableHashedPin1744002038212';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "card" DROP CONSTRAINT "FK_77d7cc9d95dccd574d71ba221b0"`);
            yield queryRunner.query(`ALTER TABLE "loan" DROP CONSTRAINT "FK_447bba13bdca8101c3f9e783de9"`);
            yield queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "customer_id"`);
            yield queryRunner.query(`ALTER TABLE "loan" ADD "customerCustomerId" integer`);
            // Create temporary column
            yield queryRunner.query(`ALTER TABLE "account" ADD "security_pin_new" character varying(255)`);
            // Copy data from old column to new column
            yield queryRunner.query(`UPDATE "account" SET "security_pin_new" = "security_pin"`);
            // Drop old column
            yield queryRunner.query(`ALTER TABLE "account" DROP COLUMN "security_pin"`);
            // Rename new column to original name
            yield queryRunner.query(`ALTER TABLE "account" RENAME COLUMN "security_pin_new" TO "security_pin"`);
            // Set NOT NULL constraint
            yield queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "security_pin" SET NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "loan_term" SET NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "status"`);
            yield queryRunner.query(`ALTER TABLE "loan" ADD "status" character varying NOT NULL DEFAULT 'pending'`);
            yield queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "created_at" SET NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "created_at" SET DEFAULT now()`);
            yield queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "updated_at" SET NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "updated_at" SET DEFAULT now()`);
            yield queryRunner.query(`ALTER TABLE "card" ADD CONSTRAINT "FK_1d327e4dd5f78db21a1c5fe95ac" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "loan" ADD CONSTRAINT "FK_3b9f9262ed08a84c62268b7c324" FOREIGN KEY ("customerCustomerId") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "loan" DROP CONSTRAINT "FK_3b9f9262ed08a84c62268b7c324"`);
            yield queryRunner.query(`ALTER TABLE "card" DROP CONSTRAINT "FK_1d327e4dd5f78db21a1c5fe95ac"`);
            yield queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
            yield queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "updated_at" DROP NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);
            yield queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "created_at" DROP NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "status"`);
            yield queryRunner.query(`ALTER TABLE "loan" ADD "status" character varying(20) DEFAULT 'pending'`);
            yield queryRunner.query(`ALTER TABLE "loan" ALTER COLUMN "loan_term" DROP NOT NULL`);
            // For rolling back, we'll do the same process in reverse
            yield queryRunner.query(`ALTER TABLE "account" ADD "security_pin_old" character varying(4)`);
            yield queryRunner.query(`UPDATE "account" SET "security_pin_old" = "security_pin"`);
            yield queryRunner.query(`ALTER TABLE "account" DROP COLUMN "security_pin"`);
            yield queryRunner.query(`ALTER TABLE "account" RENAME COLUMN "security_pin_old" TO "security_pin"`);
            yield queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "security_pin" SET NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "customerCustomerId"`);
            yield queryRunner.query(`ALTER TABLE "loan" ADD "customer_id" integer NOT NULL`);
            yield queryRunner.query(`ALTER TABLE "loan" ADD CONSTRAINT "FK_447bba13bdca8101c3f9e783de9" FOREIGN KEY ("customer_id") REFERENCES "customer"("customer_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
            yield queryRunner.query(`ALTER TABLE "card" ADD CONSTRAINT "FK_77d7cc9d95dccd574d71ba221b0" FOREIGN KEY ("account_id") REFERENCES "account"("account_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        });
    }
}
exports.EnableHashedPin1744002038212 = EnableHashedPin1744002038212;
