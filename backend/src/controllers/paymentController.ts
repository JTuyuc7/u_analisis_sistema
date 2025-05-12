import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Transaction } from '../entities/Transaction';
import { AuditLog } from '../entities/AuditLog';
import { CardRepository } from '../repositories/CardRepository';
import { Account } from '../entities/Account';
import * as bcrypt from 'bcrypt';

export const processCardPayment = async (req: Request, res: Response): Promise<void> => {
  const { card_number, expiration_date, security_code, amount, company_account_number } = req.body;
  const parsedAmount = parseFloat(amount);

  // Input validation
  if (!card_number || !expiration_date || !security_code || !amount) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  if(isNaN(parsedAmount) || parsedAmount <= 0) {
    res.status(400).json({ message: 'Invalid amount' });
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


  if(!company_account_number) {
    res.status(400).json({ message: 'Company account number is required' });
    return;
  }

  try {
    const result = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const cardRepository = new CardRepository();
      const card = await cardRepository.findByCardNumber(card_number);

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

      // Find the company revenue account
      const accountRepository = transactionalEntityManager.getRepository(Account);
      const revenueAccount = await accountRepository
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.customer', 'customer')
        .where('account.account_number = :account_number', { account_number: company_account_number })
        .andWhere('account.is_revenue_account = :isRevenueAccount', { isRevenueAccount: true })
        .getOne();

      if (!revenueAccount || revenueAccount.status !== 'active') {
        throw new Error('Company revenue account not found or inactive');
      }

      // Update customer account balance (deduct money)
      account.balance = Number(account.balance) - parsedAmount;
      await transactionalEntityManager.save(account);

      // Update revenue account balance (add money)
      revenueAccount.balance = Number(revenueAccount.balance) + parsedAmount;
      await transactionalEntityManager.save(revenueAccount);

      // Create transaction record for customer account
      const transactionRepository = transactionalEntityManager.getRepository(Transaction);
      await transactionRepository.save(transactionRepository.create({
        account: account,
        customer: account.customer,
        transaction_type: 'card_payment',
        amount: -parsedAmount,
        description: `Card payment using card ending in ${card_number.slice(-4)} to ${revenueAccount.account_name}`,
        is_revenue_transaction: true,
        revenue_account_id: revenueAccount.account_id
      }));

      // Create transaction record for revenue account
      await transactionRepository.save(transactionRepository.create({
        account: revenueAccount,
        customer: revenueAccount.customer,
        transaction_type: 'revenue_receipt',
        amount: parsedAmount,
        description: `Revenue registered to account reveneue ${revenueAccount.account_name}`,
        is_revenue_transaction: true,
        related_account_id: account.account_id
      }));

      // Create audit log
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);
      await auditLogRepository.save(auditLogRepository.create({
        customer: account.customer,
        operation: 'CARD_PAYMENT',
        details: `Card payment of ${parsedAmount} processed for card ending in ${card_number.slice(-4)} To ${revenueAccount.account_name} to account ${company_account_number}`,
      }));

      return { success: true };
    });

    res.json({ 
      message: 'Payment processed successfully',
      success: result.success
    });
  } catch (error) {
    console.error('Error processing card payment:', error);
    res.status(400).json({ 
      message: error instanceof Error ? error.message : 'Error processing payment'
    });
  }
};

export const processAccountPayment = async (req: Request, res: Response): Promise<void> => {
  const { account_number, security_pin, amount, company_account_number } = req.body;
  const parsedAmount = parseFloat(amount);

  // Input validation
  if (!account_number || !security_pin || !amount || !company_account_number) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  if(isNaN(parsedAmount) || parsedAmount <= 0) {
    res.status(400).json({ message: 'Invalid amount' });
    return;
  }

  // if(!company_account_number) {
  //   res.status(400).json({ message: 'Company account number is required' });
  //   return;
  // }

  try {
    const result = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const accountRepository = transactionalEntityManager.getRepository(Account);
      
      // Find account with account number
      const account = await accountRepository
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.customer', 'customer')
        .where('account.account_number = :account_number', { account_number })
        .getOne();

      if (!account || account.status !== 'active') {
        throw new Error('Account not found or inactive');
      }

      // Verify security pin
      const isValidPin = await bcrypt.compare(security_pin, account.security_pin);
      if (!isValidPin) {
        throw new Error('Invalid security PIN');
      }

      if (account.balance < parsedAmount) {
        throw new Error('Insufficient funds');
      }


      // Find the company revenue account
      const revenueAccount = await accountRepository
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.customer', 'customer')
        .where('account.account_number = :account_number', { account_number: company_account_number })
        .andWhere('account.is_revenue_account = :isRevenueAccount', { isRevenueAccount: true })
        .getOne();

      if (!revenueAccount || revenueAccount.status !== 'active') {
        throw new Error('Company revenue account not found or inactive');
      }

      // Update customer account balance (deduct money)
      account.balance = Number(account.balance) - parsedAmount;
      await transactionalEntityManager.save(account);

      // Update revenue account balance (add money)
      revenueAccount.balance = Number(revenueAccount.balance) + parsedAmount;
      await transactionalEntityManager.save(revenueAccount);

      // Create transaction record for customer account
      const transactionRepository = transactionalEntityManager.getRepository(Transaction);
      await transactionRepository.save(transactionRepository.create({
        account: account,
        customer: account.customer,
        transaction_type: 'account_payment',
        amount: -parsedAmount,
        description: `Account payment to ${revenueAccount.account_name}`,
        is_revenue_transaction: true,
        revenue_account_id: revenueAccount.account_id
      }));

      // Create transaction record for revenue account
      await transactionRepository.save(transactionRepository.create({
        account: revenueAccount,
        customer: revenueAccount.customer,
        transaction_type: 'revenue_receipt',
        amount: parsedAmount,
        description: `Revenue from account payment by ${account.customer.first_name} ${account.customer.last_name}`,
        is_revenue_transaction: true,
        related_account_id: account.account_id
      }));

      // Create audit log
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);
      await auditLogRepository.save(auditLogRepository.create({
        customer: account.customer,
        operation: 'ACCOUNT_PAYMENT',
        details: `Account payment of ${parsedAmount} processed from account ${account_number} by ${account.customer.first_name} ${account.customer.last_name} to account ${company_account_number}`,
      }));

      return { success: true };
    });

    res.json({ 
      message: 'Payment processed successfully',
      success: result.success
    });
  } catch (error) {
    console.error('Error processing account payment:', error);
    res.status(400).json({ 
      message: error instanceof Error ? error.message : 'Error processing payment'
    });
  }
};
