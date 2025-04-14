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
exports.AddLoanRelation1711657211000 = void 0;
const typeorm_1 = require("typeorm");
class AddLoanRelation1711657211000 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create loan table
            yield queryRunner.createTable(new typeorm_1.Table({
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
            yield queryRunner.createForeignKey("loan", new typeorm_1.TableForeignKey({
                columnNames: ["customer_id"],
                referencedColumnNames: ["customer_id"],
                referencedTableName: "customer",
                onDelete: "CASCADE"
            }));
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            // Drop foreign key first
            const table = yield queryRunner.getTable("loan");
            const foreignKey = table === null || table === void 0 ? void 0 : table.foreignKeys.find(fk => fk.columnNames.indexOf("customer_id") !== -1);
            if (foreignKey) {
                yield queryRunner.dropForeignKey("loan", foreignKey);
            }
            // Drop table
            yield queryRunner.dropTable("loan");
        });
    }
}
exports.AddLoanRelation1711657211000 = AddLoanRelation1711657211000;
