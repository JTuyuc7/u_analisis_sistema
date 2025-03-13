import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1741820057326 implements MigrationInterface {
    name = 'InitialSchema1741820057326'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transaction" ("transaction_id" SERIAL NOT NULL, "transaction_type" character varying NOT NULL, "amount" numeric(15,2) NOT NULL, "description" character varying, "related_account_id" integer, "transaction_date" TIMESTAMP NOT NULL DEFAULT now(), "accountAccountId" integer, CONSTRAINT "PK_6e02e5a0a6a7400e1c944d1e946" PRIMARY KEY ("transaction_id"))`);
        await queryRunner.query(`CREATE TABLE "account" ("account_id" SERIAL NOT NULL, "account_number" character varying NOT NULL, "account_type" character varying NOT NULL, "account_name" character varying NOT NULL, "balance" numeric(15,2) NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "customerCustomerId" integer, CONSTRAINT "UQ_c91a92631ee1ccb9f29e599ba42" UNIQUE ("account_number"), CONSTRAINT "PK_ea08b54a9d7322975ffc57fc612" PRIMARY KEY ("account_id"))`);
        await queryRunner.query(`CREATE TABLE "customer" ("customer_id" SERIAL NOT NULL, "first_name" character varying(50) NOT NULL, "last_name" character varying(50) NOT NULL, "email" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "phone" character varying(20), "address" text, "admin" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fdb2f3ad8115da4c7718109a6eb" UNIQUE ("email"), CONSTRAINT "PK_cde3d123fc6077bcd75eb051226" PRIMARY KEY ("customer_id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("log_id" SERIAL NOT NULL, "operation" character varying NOT NULL, "details" text, "log_date" TIMESTAMP NOT NULL DEFAULT now(), "customerCustomerId" integer, CONSTRAINT "PK_cf5aa90f5cf01b22aacd6d5a997" PRIMARY KEY ("log_id"))`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_3c8747d9c9d4f264e2ca8653f71" FOREIGN KEY ("accountAccountId") REFERENCES "account"("account_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "FK_673d98baa793f14b7aaa0e54eb7" FOREIGN KEY ("customerCustomerId") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_1af195f3116e8745b7d4ea56460" FOREIGN KEY ("customerCustomerId") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_1af195f3116e8745b7d4ea56460"`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "FK_673d98baa793f14b7aaa0e54eb7"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_3c8747d9c9d4f264e2ca8653f71"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
    }

}
