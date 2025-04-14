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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedInitialData = void 0;
const Customer_1 = require("../entities/Customer");
const Account_1 = require("../entities/Account");
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateAccountNumber_1 = require("../utils/generateAccountNumber");
function clearDatabase(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        // Clear tables in order (respecting foreign key constraints)
        yield connection.query('TRUNCATE TABLE "card" CASCADE');
        yield connection.query('TRUNCATE TABLE "transaction" CASCADE');
        yield connection.query('TRUNCATE TABLE "account" CASCADE');
        yield connection.query('TRUNCATE TABLE "loan" CASCADE');
        yield connection.query('TRUNCATE TABLE "customer" CASCADE');
        // Reset sequences
        yield connection.query('ALTER SEQUENCE card_card_id_seq RESTART WITH 1');
        yield connection.query('ALTER SEQUENCE transaction_transaction_id_seq RESTART WITH 1');
        yield connection.query('ALTER SEQUENCE account_account_id_seq RESTART WITH 1');
        yield connection.query('ALTER SEQUENCE loan_loan_id_seq RESTART WITH 1');
        yield connection.query('ALTER SEQUENCE customer_customer_id_seq RESTART WITH 1');
        console.log('Database cleared and sequences reset successfully');
    });
}
const seedInitialData = (connection) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clear existing data
        yield clearDatabase(connection);
        const customerRepository = connection.getRepository(Customer_1.Customer);
        const accountRepository = connection.getRepository(Account_1.Account);
        // Create initial customers
        const hashedPassword = yield bcrypt_1.default.hash('12345678', 10);
        const customer1 = customerRepository.create({
            first_name: 'user1',
            last_name: 'test1',
            email: 'test1@test.com',
            phone: '123-456-7890',
            address: '123 Main St',
            password: hashedPassword,
            admin: false
        });
        const customer2 = customerRepository.create({
            first_name: 'user2',
            last_name: 'test2',
            email: 'test2@test.com',
            phone: '987-654-3210',
            address: '456 Elm St',
            password: hashedPassword,
            admin: false
        });
        const savedCustomers = yield customerRepository.save([customer1, customer2]);
        // Create initial accounts using direct SQL queries
        const account1Number = (0, generateAccountNumber_1.generateAccountNumber)();
        const account2Number = (0, generateAccountNumber_1.generateAccountNumber)();
        console.log('Creating accounts with details:', {
            account1: {
                customer_id: savedCustomers[0].customer_id,
                account_number: account1Number
            },
            account2: {
                customer_id: savedCustomers[1].customer_id,
                account_number: account2Number
            }
        });
        // Insert accounts directly
        yield connection.query(`
      INSERT INTO "account" 
      ("customerCustomerId", "account_number", "account_type", "account_name", "balance", "security_pin", "status", "created_at", "updated_at")
      VALUES 
      ($1, $2, 'checking', 'John Doe Checking', 1000.00, '1234', 'active', NOW(), NOW()),
      ($3, $4, 'savings', 'Jane Smith Savings', 5000.00, '5678', 'active', NOW(), NOW())
    `, [savedCustomers[0].customer_id, account1Number, savedCustomers[1].customer_id, account2Number]);
        console.log('Accounts created successfully via direct SQL insertion');
        // Verify final state with more details
        const finalAccounts = yield accountRepository.find({
            relations: ['customer']
        });
        console.log('Final accounts state:', finalAccounts.map(acc => {
            var _a;
            return ({
                account_id: acc.account_id,
                account_number: acc.account_number,
                customer_id: (_a = acc.customer) === null || _a === void 0 ? void 0 : _a.customer_id
            });
        }));
        console.log('Initial data seeded successfully');
    }
    catch (error) {
        console.error('Error seeding initial data:', error);
        throw error;
    }
});
exports.seedInitialData = seedInitialData;
