import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class AddLoanRelation1711657211000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create loan table
        await queryRunner.createTable(new Table({
            name: "loan",
            columns: [
                {
                    name: "loan_id",
                    type: "serial",
                    isPrimary: true
                },
                {
                    name: "customer_id",
                    type: "integer"
                },
                {
                    name: "loan_amount",
                    type: "decimal",
                    precision: 15,
                    scale: 2
                },
                {
                    name: "interest_rate",
                    type: "decimal",
                    precision: 5,
                    scale: 2
                },
                {
                    name: "loan_term",
                    type: "integer"
                },
                {
                    name: "status",
                    type: "varchar",
                    length: "20",
                    default: "'pending'"
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Add foreign key
        await queryRunner.createForeignKey("loan", new TableForeignKey({
            columnNames: ["customer_id"],
            referencedColumnNames: ["customer_id"],
            referencedTableName: "customer",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key first
        const table = await queryRunner.getTable("loan");
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf("customer_id") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("loan", foreignKey);
        }

        // Drop table
        await queryRunner.dropTable("loan");
    }
}
