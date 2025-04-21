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
    const accountRepository = AppDataSource.getRepository(Account);
    const customerRepository = AppDataSource.getRepository(Customer);

    // Check if customer exists
    const customer = await customerRepository.findOne({ where: { customer_id: req.user?.id } });
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    // Count existing accounts for the customer
    const accountCount = await accountRepository.count({ where: { customer: { customer_id: customer.customer_id } } });
    
    // Check if the customer already has 3 or more accounts
    if (accountCount >= 3) {
      res.status(400).json({ message: 'You cannot create more than 3 accounts, please contact our support channel.' });
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
      balance: 500, // Default balance
      // balance: 0 // TODO: check which is appropriate
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

    res.json({ accounts: accounts || [], msg: 'Listed accounts successfully' });
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
      
      if (fromAccount?.account_number === toAccount?.account_number) { 
        throw new Error('Cannot transfer money to the same account');
      }

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
        customer: fromAccount.customer,
        transaction_type: 'transfer',
        amount: -parsedAmount,
        description,
        related_account_id: toAccount.account_id
      }));

      await transactionRepository.save(transactionRepository.create({
        account: toAccount,
        customer: toAccount.customer,
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
export const listTransactionsByAccountNumber = async (req: Request, res: Response): Promise<void> => {
  console.log(req.params.accountId, 'from listTransactionsByAccountNumber');
  // Ensure accountId is a valid number
  const accountId = req.params.accountId;
  
  if (!accountId) {
    res.status(400).json({ message: 'Invalid account number format' });
    return;
  }

  try {
    const transactionList = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const transactionRepository = transactionalEntityManager.getRepository(Transaction);
      const accountRepository = transactionalEntityManager.getRepository(Account);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);
      
      // First verify the account exists and belongs to the user
      const account = await accountRepository
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.customer', 'customer')
        .where('account.account_number = :accountId', { accountId })
        .getOne();

      if (!account) {
        throw new Error('Account not found');
      }

      // Check if the user is authorized to access this account
      if (account.customer.customer_id !== req.user?.id) {
        throw new Error('You are not authorized to view transactions for this account');
      }
      
      // Get transactions by account ID with limited fields
      const transactions = await transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.account', 'account')
        .leftJoinAndSelect('transaction.customer', 'customer')
        .select([
          'transaction.transaction_id',
          'transaction.transaction_type',
          'transaction.amount',
          'transaction.description',
          'transaction.related_account_id',
          'transaction.transaction_date',
          'account.account_id',
          'account.account_number',
          'account.account_type',
          'account.account_name',
          'account.status',
          'customer.customer_id',
          'customer.first_name',
          'customer.last_name'
        ])
        .where('account.account_number = :accountId', { accountId })
        .orderBy('transaction.transaction_date', 'DESC')
        .getMany();

      await auditLogRepository.save(auditLogRepository.create({
        customer: account.customer,
        operation: 'TRANSACTION_LISTING',
        details: `Listed ${transactions.length} transactions for account ${accountId}`
      }));

      return transactions;
    });

    res.json({ transactionList, msg: 'Listed transactions successfully' });
  } catch (error) {
    console.error('Error listing transactions:', error);
    const status = error instanceof Error && error.message.includes('not authorized') ? 403 : 500;
    const message = error instanceof Error ? error.message : 'Error retrieving transactions';
    res.status(status).json({ message });
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
    res.status(404).json({ message: 'Account not found, please check the number' });
  }
};

export const changeAccountBalance = async (req: Request, res: Response): Promise<void> => {
  const { accountId, newBalance } = req.body;

  if (!req.user?.admin) {
    res.status(403).json({ message: 'Unauthorized: Admin access required' });
    return;
  }

  try {
    await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const accountRepository = transactionalEntityManager.getRepository(Account);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);
      const transactionRepository = transactionalEntityManager.getRepository(Transaction);

      // const account = await accountRepository.findOne({
      //   where: { account_id: accountId },
      //   relations: ['customer']
      // });

      const account = await accountRepository
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.customer', 'customer')
        .where('account.account_number = :id', { id: accountId })
        .getOne();

      if (!account) {
        throw new Error('Account not found');
      }

      let oldBalance = account.balance;

      // const balanceDifference = newBalance - oldBalance;
      account.balance = newBalance;
      await transactionalEntityManager.save(account);

      // Create a transaction record
      await transactionRepository.save(transactionRepository.create({
        account: account,
        customer: account.customer,
        transaction_type: 'admin_balance_change from `' + oldBalance + ' to ' + newBalance,
        amount: Math.abs(newBalance),
        description: 'Admin balance adjustment',
      }));

      await auditLogRepository.save(auditLogRepository.create({
        customer: account.customer,
        operation: 'BALANCE_CHANGE',
        details: `Admin changed balance for account ${account.account_number} from ${oldBalance} to ${newBalance}`
      }));
    });

    res.json({ message: 'Account balance updated successfully' });
  } catch (error) {
    console.error('Error changing account balance:', error);
    res.status(500).json({ message: 'Error changing account balance' });
  }
};

export const getAccountBalanceByAccountNumber = async (req: Request, res: Response): Promise<void> => {
  const accountId = req.params.accountId;
  try {
    const account = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const accountRepository = transactionalEntityManager.getRepository(Account);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);

      const accountUser = await accountRepository
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.customer', 'customer')
        .where('account.account_number = :id', { id: accountId })
        .getOne();
      

      if (accountUser?.customer.customer_id !== req.user?.id) {
        throw new Error('You are not authorized to perform this operation');
      }

      if (!accountUser) {
        throw new Error('Account not found');
      }

      await auditLogRepository.save(auditLogRepository.create({
        customer: accountUser.customer,
        operation: 'ACCOUNT_BALANCE_CHECK',
        details: `Checked balance for account ${accountUser.account_number}`
      }));

      return { balance: accountUser.balance };
    });

    res.json({ message: 'Account balance retrieved successfully', balance: account?.balance });
  } catch (error) {
    console.error('Error retrieving account balance:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Error retrieving account balance' });
  }
};

// Get card associated with an account number
export const getCardByAccountNumber = async (req: Request, res: Response): Promise<void> => {
  const accountNumber = req.params.accountNumber;
  
  try {
    const result = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const accountRepository = transactionalEntityManager.getRepository(Account);
      const cardRepository = transactionalEntityManager.getRepository(Card);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);

      // First find the account
      const account = await accountRepository
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.customer', 'customer')
        .where('account.account_number = :accountNumber', { accountNumber })
        .getOne();

      if (!account) {
        throw new Error('Account not found');
      }

      // Check if the user is authorized to access this account
      if (account.customer.customer_id !== req.user?.id) {
        throw new Error('You are not authorized to perform this operation');
      }

      // Find the card associated with the account
      const card = await cardRepository
        .createQueryBuilder('card')
        .where('card.account = :accountId', { accountId: account.account_id })
        .getOne();

      if (!card) {
        throw new Error('No card found for this account');
      }

      // Create audit log
      await auditLogRepository.save(auditLogRepository.create({
        customer: account.customer,
        operation: 'CARD_RETRIEVAL',
        details: `Retrieved card information for account ${account.account_number}`
      }));

      // Return masked card details for security
      return {
        // card_number: card.card_number.replace(/\d(?=\d{4})/g, '*'), // Mask all but last 4 digits
        card_number: card.card_number, // Mask all but last 4 digits
        expiration_date: card.expiration_date,
        status: card.status,
        cvv: card.security_code,
      };
    });

    res.json({ 
      message: 'Card retrieved successfully', 
      card: result 
    });
  } catch (error) {
    console.error('Error retrieving card:', error);
    res.status(error instanceof Error && error.message.includes('not authorized') ? 403 : 500)
      .json({ message: error instanceof Error ? error.message : 'Error retrieving card information' });
  }
};

// List all transactions for a customer
export const listCustomerTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactionList = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const transactionRepository = transactionalEntityManager.getRepository(Transaction);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);
      const customerRepository = transactionalEntityManager.getRepository(Customer);
      
      // Get customer
      const customer = await customerRepository.findOne({ where: { customer_id: req.user?.id } });
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      // Get transactions by customer ID using query builder with limited fields
      const transactions = await transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.account', 'account')
        .leftJoinAndSelect('transaction.customer', 'customer')
        .select([
          'transaction.transaction_id',
          'transaction.transaction_type',
          'transaction.amount',
          'transaction.description',
          'transaction.related_account_id',
          'transaction.transaction_date',
          'account.account_id',
          'account.account_number',
          'account.account_type',
          'account.account_name',
          'account.status',
          'customer.customer_id',
          'customer.first_name',
          'customer.last_name'
        ])
        .where('transaction.customer_id = :customerId', { customerId: customer.customer_id })
        .orderBy('transaction.transaction_date', 'DESC')
        .getMany();
      
      console.log(`Found ${transactions.length} transactions for customer ${customer.customer_id}`);

      // Create audit log
      await auditLogRepository.save(auditLogRepository.create({
        customer,
        operation: 'CUSTOMER_TRANSACTION_LISTING',
        details: `Listed ${transactions.length} transactions for customer ${customer.customer_id}`
      }));

      return transactions || [];
    });
    console.log('Transaction list:', transactionList);
    res.status(200).json({ transactionList, msg: 'Listed customer transactions successfully' });
  } catch (error) {
    console.error('Error listing customer transactions:', error);
    res.status(500).json({ message: 'Error retrieving customer transactions' });
  }
};

export const getAllCardsAssociatedWithAccount = async (req: Request, res: Response): Promise<void> => {
  const accountId = parseInt(req.params.accountId, 10);

  try {
    const cards = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const accountRepository = transactionalEntityManager.getRepository(Account);
      const cardRepository = transactionalEntityManager.getRepository(Card);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);

      // First verify the account exists and belongs to the user
      const account = await accountRepository
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.customer', 'customer')
        .where('account.account_id = :accountId', { accountId })
        .getOne();

      if (!account) {
        throw new Error('Account not found');
      }

      // Check if the user is authorized to access this account
      if (account.customer.customer_id !== req.user?.id) {
        throw new Error('You are not authorized to perform this operation');
      }

      // Get cards associated with the account using query builder
      const cards = await cardRepository
        .createQueryBuilder('card')
        .leftJoinAndSelect('card.account', 'account')
        .where('account.account_id = :accountId', { accountId })
        .getMany();

      if (cards.length === 0) {
        throw new Error('No cards found for this account');
      }

      // Create audit log
      await auditLogRepository.save(auditLogRepository.create({
        customer: account.customer,
        operation: 'CARD_LISTING',
        details: `Listed ${cards.length} cards for account ${account.account_number}`
      }));

      // Return masked card details for security
      return cards.map(card => ({
        card_id: card.card_id,
        card_number: card.card_number.replace(/\d(?=\d{4})/g, '*'), // Mask all but last 4 digits
        expiration_date: card.expiration_date,
        status: card.status,
        created_at: card.created_at
      }));
    });

    res.json({ 
      message: 'Cards retrieved successfully', 
      cards:  cards || []
    });
  } catch (error) {
    console.error('Error retrieving cards:', error);
    res.status(error instanceof Error && error.message.includes('not authorized') ? 403 : 500)
      .json({ message: error instanceof Error ? error.message : 'Error retrieving cards' });
  }
};
