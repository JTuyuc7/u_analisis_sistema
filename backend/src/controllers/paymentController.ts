import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Card } from '../entities/Card';
import { Transaction } from '../entities/Transaction';
import { AuditLog } from '../entities/AuditLog';
import { CardRepository } from '../repositories/CardRepository';

export const processCardPayment = async (req: Request, res: Response): Promise<void> => {
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

  if(!company_name) {
    res.status(400).json({ message: 'Company name is required' });
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

      // Update account balance
      account.balance = Number(account.balance) - parsedAmount;
      await transactionalEntityManager.save(account);

      // Create transaction record
      const transactionRepository = transactionalEntityManager.getRepository(Transaction);
      await transactionRepository.save(transactionRepository.create({
        account: account,
        transaction_type: 'card_payment',
        amount: -parsedAmount,
        description: `Card payment using card ending in ${card_number.slice(-4)}`,
      }));

      // Create audit log
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);
      await auditLogRepository.save(auditLogRepository.create({
        customer: account.customer,
        operation: 'CARD_PAYMENT',
        details: `Card payment of ${parsedAmount} processed for card ending in ${card_number.slice(-4)} by ${company_name}`,
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
