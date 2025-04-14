"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.processAccountPayment = exports.processCardPayment = void 0;
const data_source_1 = require("../data-source");
const Transaction_1 = require("../entities/Transaction");
const AuditLog_1 = require("../entities/AuditLog");
const CardRepository_1 = require("../repositories/CardRepository");
const bcrypt = __importStar(require("bcrypt"));
const processCardPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { card_number, expiration_date, security_code, amount, company_name } = req.body;
    const parsedAmount = parseFloat(amount);
    // Input validation
    if (!card_number || !expiration_date || !security_code || !amount) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }
    // Validate card number format
    if (!/^\d{16}$/.test(card_number)) {
        res.status(400).json({ message: 'Invalid card number format' });
        return;
    }
    // Validate expiration date format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(expiration_date)) {
        res.status(400).json({ message: 'Invalid expiration date format' });
        return;
    }
    // Validate security code format
    if (!/^\d{3}$/.test(security_code)) {
        res.status(400).json({ message: 'Invalid security code format' });
        return;
    }
    if (!company_name) {
        res.status(400).json({ message: 'Company name is required' });
        return;
    }
    try {
        const result = yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const cardRepository = new CardRepository_1.CardRepository();
            const card = yield cardRepository.findByCardNumber(card_number);
            if (!card || card.status !== 'active') {
                throw new Error('Card not found or inactive');
            }
            if (card.expiration_date !== expiration_date || card.security_code !== security_code) {
                throw new Error('Invalid card details');
            }
            const account = card.account;
            if (!account || account.status !== 'active') {
                throw new Error('Associated account not found or inactive');
            }
            if (account.balance < parsedAmount) {
                throw new Error('Insufficient funds');
            }
            // Update account balance
            account.balance = Number(account.balance) - parsedAmount;
            yield transactionalEntityManager.save(account);
            // Create transaction record
            const transactionRepository = transactionalEntityManager.getRepository(Transaction_1.Transaction);
            yield transactionRepository.save(transactionRepository.create({
                account: account,
                transaction_type: 'card_payment',
                amount: -parsedAmount,
                description: `Card payment using card ending in ${card_number.slice(-4)}`,
            }));
            // Create audit log
            const auditLogRepository = transactionalEntityManager.getRepository(AuditLog_1.AuditLog);
            yield auditLogRepository.save(auditLogRepository.create({
                customer: account.customer,
                operation: 'CARD_PAYMENT',
                details: `Card payment of ${parsedAmount} processed for card ending in ${card_number.slice(-4)} by ${company_name}`,
            }));
            return { success: true };
        }));
        res.json({
            message: 'Payment processed successfully',
            success: result.success
        });
    }
    catch (error) {
        console.error('Error processing card payment:', error);
        res.status(400).json({
            message: error instanceof Error ? error.message : 'Error processing payment'
        });
    }
});
exports.processCardPayment = processCardPayment;
const processAccountPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { account_number, security_pin, amount, company_name } = req.body;
    const parsedAmount = parseFloat(amount);
    // Input validation
    if (!account_number || !security_pin || !amount || !company_name) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }
    try {
        const result = yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const accountRepository = transactionalEntityManager.getRepository('Account');
            // Find account with account number
            const account = yield accountRepository
                .createQueryBuilder('account')
                .leftJoinAndSelect('account.customer', 'customer')
                .where('account.account_number = :account_number', { account_number })
                .getOne();
            if (!account || account.status !== 'active') {
                throw new Error('Account not found or inactive');
            }
            // Verify security pin
            const isValidPin = yield bcrypt.compare(security_pin, account.security_pin);
            if (!isValidPin) {
                throw new Error('Invalid security PIN');
            }
            if (account.balance < parsedAmount) {
                throw new Error('Insufficient funds');
            }
            if (!company_name) {
                throw new Error('Company name is required to process the payment');
            }
            // Update account balance
            account.balance = Number(account.balance) - parsedAmount;
            yield transactionalEntityManager.save(account);
            // Create transaction record
            const transactionRepository = transactionalEntityManager.getRepository(Transaction_1.Transaction);
            yield transactionRepository.save(transactionRepository.create({
                account: account,
                transaction_type: 'account_payment',
                amount: -parsedAmount,
                description: `Account payment from ${account_number}`,
            }));
            // Create audit log
            const auditLogRepository = transactionalEntityManager.getRepository(AuditLog_1.AuditLog);
            yield auditLogRepository.save(auditLogRepository.create({
                customer: account.customer,
                operation: 'ACCOUNT_PAYMENT',
                details: `Account payment of ${parsedAmount} processed from account ${account_number} by ${company_name}`,
            }));
            return { success: true };
        }));
        res.json({
            message: 'Payment processed successfully',
            success: result.success
        });
    }
    catch (error) {
        console.error('Error processing account payment:', error);
        res.status(400).json({
            message: error instanceof Error ? error.message : 'Error processing payment'
        });
    }
});
exports.processAccountPayment = processAccountPayment;
