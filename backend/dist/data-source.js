"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Customer_1 = require("./entities/Customer");
const Account_1 = require("./entities/Account");
const Transaction_1 = require("./entities/Transaction");
const AuditLog_1 = require("./entities/AuditLog");
const Loan_1 = require("./entities/Loan");
const Card_1 = require("./entities/Card");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === 'production';
exports.AppDataSource = new typeorm_1.DataSource(isProduction
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        synchronize: false,
        logging: false,
        entities: [Customer_1.Customer, Account_1.Account, Transaction_1.Transaction, AuditLog_1.AuditLog, Loan_1.Loan, Card_1.Card],
        migrations: ['dist/migrations/*.js'],
        subscribers: [],
    }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'bank_db',
        synchronize: false,
        logging: true,
        entities: [Customer_1.Customer, Account_1.Account, Transaction_1.Transaction, AuditLog_1.AuditLog, Loan_1.Loan, Card_1.Card],
        migrations: ['src/migrations/*.ts'],
        subscribers: [],
    });
