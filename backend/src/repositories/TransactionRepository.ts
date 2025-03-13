import { EntityRepository, Repository } from 'typeorm';
import { Transaction } from '../entities/Transaction';

@EntityRepository(Transaction)
export class TransactionRepository extends Repository<Transaction> {
  async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.create(data);
    return this.save(transaction);
  }

  async getTransactionsByAccountId(accountId: number): Promise<Transaction[]> {
    return this.find({
      where: { account: { account_id: accountId } },
      order: { transaction_date: 'DESC' }
    });
  }
}
