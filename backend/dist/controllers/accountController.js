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
exports.changeAccountBalance = exports.findValidAccount = exports.listTransactions = exports.transferMoney = exports.listAccounts = exports.createAccount = void 0;
const Account_1 = require("../entities/Account");
const Customer_1 = require("../entities/Customer");
const Transaction_1 = require("../entities/Transaction");
const AuditLog_1 = require("../entities/AuditLog");
const Card_1 = require("../entities/Card");
const generateAccountNumber_1 = require("../utils/generateAccountNumber");
const generateCardDetails_1 = require("../utils/generateCardDetails");
const data_source_1 = require("../data-source");
const bcrypt = __importStar(require("bcrypt"));
// Create a new account
const createAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { accountType, accountName, security_pin } = req.body;
    try {
        //* TODO: Implement a method to validate that a customer can have up to 5 accounts
        const accountRepository = data_source_1.AppDataSource.getRepository(Account_1.Account);
        const customerRepository = data_source_1.AppDataSource.getRepository(Customer_1.Customer);
        // Check if customer exists
        const customer = yield customerRepository.findOne({ where: { customer_id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id } });
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        const hashedSecurityPin = yield bcrypt.hash(security_pin, 10);
        // Generate unique account number
        const accountNumber = (0, generateAccountNumber_1.generateAccountNumber)();
        // Create new account
        const newAccount = accountRepository.create({
            customer,
            account_number: accountNumber,
            account_type: accountType,
            account_name: accountName,
            security_pin: hashedSecurityPin,
            balance: 0
        });
        // Save account, create default card and audit log
        yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            // Save the account first
            yield transactionalEntityManager.save(newAccount);
            // Create default card
            const cardDetails = (0, generateCardDetails_1.generateCardDetails)();
            const cardRepository = transactionalEntityManager.getRepository(Card_1.Card);
            const newCard = cardRepository.create({
                card_number: cardDetails.cardNumber,
                expiration_date: cardDetails.expirationDate,
                security_code: cardDetails.securityCode,
                account: newAccount,
                status: 'active'
            });
            yield transactionalEntityManager.save(newCard);
            // Create audit log
            const auditLogRepository = transactionalEntityManager.getRepository(AuditLog_1.AuditLog);
            yield auditLogRepository.save(auditLogRepository.create({
                customer,
                operation: 'ACCOUNT_CREATION',
                details: `Created new ${accountType} account: ${accountNumber} with default card`
            }));
        }));
        res.status(201).json({
            message: 'Account created successfully',
            account: {
                account_id: newAccount.account_id,
                account_number: newAccount.account_number
            }
        });
    }
    catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ message: 'Error creating account' });
    }
});
exports.createAccount = createAccount;
// List all accounts for a customer
const listAccounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accounts = yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            var _b, _c;
            const accountRepository = transactionalEntityManager.getRepository(Account_1.Account);
            const auditLogRepository = transactionalEntityManager.getRepository(AuditLog_1.AuditLog);
            const customerRepository = transactionalEntityManager.getRepository(Customer_1.Customer);
            // Get customer for the audit log
            const customer = yield customerRepository.findOne({ where: { customer_id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id } });
            if (!customer) {
                throw new Error('Customer not found');
            }
            // Get accounts
            const accounts = yield accountRepository.find({
                where: { customer: { customer_id: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id } },
                select: ['account_id', 'account_number', 'account_type', 'account_name', 'balance', 'status', 'created_at'],
                order: { created_at: 'DESC' }
            });
            // Create audit log
            yield auditLogRepository.save(auditLogRepository.create({
                customer,
                operation: 'ACCOUNT_LISTING',
                details: `Listed ${accounts.length} accounts`
            }));
            return accounts;
        }));
        res.json({ accounts: accounts || [], msg: 'Listed accounts successfully' });
    }
    catch (error) {
        console.error('Error listing accounts:', error);
        res.status(500).json({ message: 'Error retrieving accounts' });
    }
});
exports.listAccounts = listAccounts;
// Transfer money between accounts
const transferMoney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fromAccountId, toAccountId, amount, description } = req.body;
    let parsedAmount = parseFloat(amount);
    try {
        yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            var _d;
            const accountRepository = transactionalEntityManager.getRepository(Account_1.Account);
            const transactionRepository = transactionalEntityManager.getRepository(Transaction_1.Transaction);
            const auditLogRepository = transactionalEntityManager.getRepository(AuditLog_1.AuditLog);
            // Get accounts with their associated customers using query builder
            const fromAccount = yield accountRepository
                .createQueryBuilder('account')
                .leftJoinAndSelect('account.customer', 'customer')
                .where('account.account_number = :id', { id: fromAccountId })
                .getOne();
            const toAccount = yield accountRepository
                .createQueryBuilder('account')
                .leftJoinAndSelect('account.customer', 'customer')
                .where('account.account_number = :id', { id: toAccountId })
                .getOne();
            if (!fromAccount || !toAccount) {
                throw new Error('One or both accounts not found');
            }
            if (fromAccount.customer.customer_id !== ((_d = req.user) === null || _d === void 0 ? void 0 : _d.id)) {
                throw new Error('You are not authorized to perform this operation');
            }
            if (fromAccount.balance < parsedAmount) {
                throw new Error('Insufficient funds');
            }
            // Update balances
            fromAccount.balance = Number(fromAccount.balance) - parsedAmount;
            toAccount.balance = Number(toAccount.balance) + parsedAmount;
            // Save updated accounts
            yield transactionalEntityManager.save([fromAccount, toAccount]);
            // Create transactions
            yield transactionRepository.save(transactionRepository.create({
                account: fromAccount,
                transaction_type: 'transfer',
                amount: -parsedAmount,
                description,
                related_account_id: toAccount.account_id
            }));
            yield transactionRepository.save(transactionRepository.create({
                account: toAccount,
                transaction_type: 'deposit',
                amount: parsedAmount,
                description,
                related_account_id: fromAccount.account_id
            }));
            // Create audit log
            yield auditLogRepository.save(auditLogRepository.create({
                customer: fromAccount.customer,
                operation: 'MONEY_TRANSFER',
                details: `Transferred ${parsedAmount} from account ${fromAccount.account_number} to ${toAccount.account_number}`
            }));
        }));
        res.json({ message: 'Transfer completed successfully' });
    }
    catch (error) {
        console.error('Error transferring money:', error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'Error transferring money' });
    }
});
exports.transferMoney = transferMoney;
// List all transactions for a given account
const listTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accountId = parseInt(req.params.accountId);
    try {
        const transactionList = yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const transactionRepository = transactionalEntityManager.getRepository(Transaction_1.Transaction);
            const auditLogRepository = transactionalEntityManager.getRepository(AuditLog_1.AuditLog);
            const transactions = yield transactionRepository.find({
                where: { account: { account_id: accountId } },
                order: { transaction_date: 'DESC' },
                relations: ['account']
            });
            yield auditLogRepository.save(auditLogRepository.create({
                customer: transactions[0].account.customer,
                operation: 'TRANSACTION_LISTING',
                details: `Listed ${transactions.length} transactions for account ${accountId}`
            }));
            return transactions;
        }));
        res.json({ transactionList, msg: 'Listed transactions successfully' });
    }
    catch (error) {
        console.error('Error listing transactions:', error);
        res.status(500).json({ message: 'Error retrieving transactions' });
    }
});
exports.listTransactions = listTransactions;
const findValidAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const accountRepository = transactionalEntityManager.getRepository(Account_1.Account);
            // const transactionRepository = transactionalEntityManager.getRepository(Transaction);
            const auditLogRepository = transactionalEntityManager.getRepository(AuditLog_1.AuditLog);
            const accountUser = yield accountRepository
                .createQueryBuilder('account')
                .leftJoinAndSelect('account.customer', 'customer')
                .where('account.account_number = :id', { id: req.params.accountId })
                .getOne();
            if (!accountUser) {
                throw new Error('Account not found');
            }
            yield auditLogRepository.save(auditLogRepository.create({
                customer: accountUser.customer,
                operation: 'ACCOUNT_FIND',
                details: `Find account ${accountUser.account_number} for transaction operation`
            }));
            const { account_number, account_type, customer: { customer_id, first_name, last_name } } = accountUser;
            return { accountDetails: { account_number, account_type, customer_id, first_name, last_name } };
        }));
        if (!result) {
            res.status(404).json({ message: 'Account not found or invalid account number provided' });
            return;
        }
        res.json({ message: 'Account found', account: result === null || result === void 0 ? void 0 : result.accountDetails });
    }
    catch (error) {
        console.error('Error finding account:', error);
        res.status(500).json({ message: 'Error finding account' });
    }
});
exports.findValidAccount = findValidAccount;
const changeAccountBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const { accountId, newBalance } = req.body;
    if (!((_e = req.user) === null || _e === void 0 ? void 0 : _e.admin)) {
        res.status(403).json({ message: 'Unauthorized: Admin access required' });
        return;
    }
    try {
        yield data_source_1.AppDataSource.manager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const accountRepository = transactionalEntityManager.getRepository(Account_1.Account);
            const auditLogRepository = transactionalEntityManager.getRepository(AuditLog_1.AuditLog);
            const transactionRepository = transactionalEntityManager.getRepository(Transaction_1.Transaction);
            // const account = await accountRepository.findOne({
            //   where: { account_id: accountId },
            //   relations: ['customer']
            // });
            const account = yield accountRepository
                .createQueryBuilder('account')
                .where('account.account_number = :id', { id: accountId })
                .getOne();
            if (!account) {
                throw new Error('Account not found');
            }
            let oldBalance = account.balance;
            // const balanceDifference = newBalance - oldBalance;
            account.balance = newBalance;
            yield transactionalEntityManager.save(account);
            // Create a transaction record
            yield transactionRepository.save(transactionRepository.create({
                account: account,
                transaction_type: 'admin_balance_change from `' + oldBalance + ' to ' + newBalance,
                amount: Math.abs(newBalance),
                description: 'Admin balance adjustment',
            }));
            yield auditLogRepository.save(auditLogRepository.create({
                customer: account.customer,
                operation: 'BALANCE_CHANGE',
                details: `Admin changed balance for account ${account.account_number} from ${oldBalance} to ${newBalance}`
            }));
        }));
        res.json({ message: 'Account balance updated successfully' });
    }
    catch (error) {
        console.error('Error changing account balance:', error);
        res.status(500).json({ message: 'Error changing account balance' });
    }
});
exports.changeAccountBalance = changeAccountBalance;
