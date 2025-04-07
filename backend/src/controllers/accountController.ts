import { Request, Response } from 'express';
import { Account } from '../entities/Account';
import { Customer } from '../entities/Customer';
import { Transaction } from '../entities/Transaction';
import { AuditLog } from '../entities/AuditLog';
import { Card } from '../entities/Card';
import { generateAccountNumber } from '../utils/generateAccountNumber';
import { generateCardDetails } from '../utils/generateCardDetails';
import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';

// Create a new account
export const createAccount = async (req: Request, res: Response): Promise<void> => {
  const { accountType, accountName, security_pin } = req.body;

  try {
    //* TODO: Implement a method to validate that a customer can have up to 5 accounts
    const accountRepository = AppDataSource.getRepository(Account);
    const customerRepository = AppDataSource.getRepository(Customer);

    // Check if customer exists
    const customer = await customerRepository.findOne({ where: { customer_id: req.user?.id } });
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    const hashedSecurityPin = await bcrypt.hash(security_pin, 10);

    // Generate unique account number
    const accountNumber = generateAccountNumber();

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
    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      // Save the account first
      await transactionalEntityManager.save(newAccount);

      // Create default card
      const cardDetails = generateCardDetails();
      const cardRepository = transactionalEntityManager.getRepository(Card);
      const newCard = cardRepository.create({
        card_number: cardDetails.cardNumber,
        expiration_date: cardDetails.expirationDate,
        security_code: cardDetails.securityCode,
        account: newAccount,
        status: 'active'
      });
      await transactionalEntityManager.save(newCard);

      // Create audit log
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);
      await auditLogRepository.save(auditLogRepository.create({
        customer,
        operation: 'ACCOUNT_CREATION',
        details: `Created new ${accountType} account: ${accountNumber} with default card`
      }));
    });

    res.status(201).json({
      message: 'Account created successfully',
      account: {
        account_id: newAccount.account_id,
        account_number: newAccount.account_number
      }
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ message: 'Error creating account' });
  }
};

// List all accounts for a customer
export const listAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const accounts = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const accountRepository = transactionalEntityManager.getRepository(Account);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);
      const customerRepository = transactionalEntityManager.getRepository(Customer);

      // Get customer for the audit log
      const customer = await customerRepository.findOne({ where: { customer_id: req.user?.id } });
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Get accounts
      const accounts = await accountRepository.find({
        where: { customer: { customer_id: req.user?.id } },
        select: ['account_id', 'account_number', 'account_type', 'account_name', 'balance', 'status', 'created_at'],
        order: { created_at: 'DESC' }
      });

      // Create audit log
      await auditLogRepository.save(auditLogRepository.create({
        customer,
        operation: 'ACCOUNT_LISTING',
        details: `Listed ${accounts.length} accounts`
      }));

      return accounts;
    });

    res.json({ accounts: accounts || [] , msg: 'Listed accounts successfully' });
  } catch (error) {
    console.error('Error listing accounts:', error);
    res.status(500).json({ message: 'Error retrieving accounts' });
  }
};

// Transfer money between accounts
export const transferMoney = async (req: Request, res: Response): Promise<void> => {
  const { fromAccountId, toAccountId, amount, description } = req.body;

  let parsedAmount = parseFloat(amount);

  try {
    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const accountRepository = transactionalEntityManager.getRepository(Account);
      const transactionRepository = transactionalEntityManager.getRepository(Transaction);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);

      // Get accounts with their associated customers using query builder
      const fromAccount = await accountRepository
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.customer', 'customer')
        .where('account.account_number = :id', { id: fromAccountId })
        .getOne();

      const toAccount = await accountRepository
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.customer', 'customer')
        .where('account.account_number = :id', { id: toAccountId })
        .getOne();

      if (!fromAccount || !toAccount) {
        throw new Error('One or both accounts not found');
      }

      if (fromAccount.customer.customer_id !== req.user?.id) { 
        throw new Error('You are not authorized to perform this operation');
      }

      if (fromAccount.balance < parsedAmount) {
        throw new Error('Insufficient funds');
      }
      
      // Update balances
      fromAccount.balance = Number(fromAccount.balance) - parsedAmount;
      toAccount.balance = Number(toAccount.balance) + parsedAmount;

      // Save updated accounts
      await transactionalEntityManager.save([fromAccount, toAccount]);

      // Create transactions
      await transactionRepository.save(transactionRepository.create({
        account: fromAccount,
        transaction_type: 'transfer',
        amount: -parsedAmount,
        description,
        related_account_id: toAccount.account_id
      }));

      await transactionRepository.save(transactionRepository.create({
        account: toAccount,
        transaction_type: 'deposit',
        amount: parsedAmount,
        description,
        related_account_id: fromAccount.account_id
      }));

      // Create audit log
      await auditLogRepository.save(auditLogRepository.create({
        customer: fromAccount.customer,
        operation: 'MONEY_TRANSFER',
        details: `Transferred ${parsedAmount} from account ${fromAccount.account_number} to ${toAccount.account_number}`
      }));
    });

    res.json({ message: 'Transfer completed successfully' });
  } catch (error) {
    console.error('Error transferring money:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Error transferring money' });
  }
};

// List all transactions for a given account
export const listTransactions = async (req: Request, res: Response): Promise<void> => {
  const accountId = parseInt(req.params.accountId);

  try {
    const transactionList = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const transactionRepository = transactionalEntityManager.getRepository(Transaction);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);
      const transactions = await transactionRepository.find({
        where: { account: { account_id: accountId } },
        order: { transaction_date: 'DESC' },
        relations: ['account']
      });

      await auditLogRepository.save(auditLogRepository.create({
        customer: transactions[0].account.customer,
        operation: 'TRANSACTION_LISTING',
        details: `Listed ${transactions.length} transactions for account ${accountId}`
      }));
      
      return transactions;
    });

    res.json({ transactionList, msg: 'Listed transactions successfully' });
  } catch (error) {
    console.error('Error listing transactions:', error);
    res.status(500).json({ message: 'Error retrieving transactions' });
  }
};

export const findValidAccount = async (req: Request, res: Response): Promise<void> => {

  try {
    const result = await AppDataSource.manager.transaction(async (transactionalEntityManager) => { 
      const accountRepository = transactionalEntityManager.getRepository(Account);
      // const transactionRepository = transactionalEntityManager.getRepository(Transaction);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);

      const accountUser = await accountRepository
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.customer', 'customer')
        .where('account.account_number = :id', { id: req.params.accountId })
        .getOne();

      if (!accountUser) {
        throw new Error('Account not found');
      }

      await auditLogRepository.save(auditLogRepository.create({
        customer: accountUser.customer,
        operation: 'ACCOUNT_FIND',
        details: `Find account ${accountUser.account_number} for transaction operation`
      }));

      const { account_number, account_type, customer: { customer_id, first_name, last_name } } = accountUser;
      return { accountDetails: { account_number, account_type, customer_id, first_name, last_name } };
    });

    if (!result) {
      res.status(404).json({ message: 'Account not found or invalid account number provided' });
      return;
    }

    res.json({ message: 'Account found', account: result?.accountDetails });
  } catch (error) {
    console.error('Error finding account:', error);
    res.status(500).json({ message: 'Error finding account' });
  }
};
