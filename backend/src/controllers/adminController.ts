import { Request, Response } from 'express';
import { Transaction } from '../entities/Transaction';
import { Customer } from '../entities/Customer';
import { Account } from '../entities/Account';
import { AuditLog } from '../entities/AuditLog';
import { AppDataSource } from '../data-source';

/**
 * Admin controller for handling admin-specific operations
 */
export const getLastTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const transactionRepository = transactionalEntityManager.getRepository(Transaction);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);
      const customerRepository = transactionalEntityManager.getRepository(Customer);

      // Get the most recent transaction
      const transactions = await transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.account', 'account')
        .leftJoinAndSelect('transaction.customer', 'customer')
        .orderBy('transaction.transaction_date', 'DESC')
        .take(1)
        .getMany();

      if (transactions.length === 0) {
        return null;
      }

      const transaction = transactions[0];
      
      // Get admin user for audit log
      const adminUser = await customerRepository.findOne({ where: { customer_id: req.user?.id } });
      if (adminUser) {
        // Create audit log
        await auditLogRepository.save(auditLogRepository.create({
          customer: adminUser,
          operation: 'ADMIN_VIEW_LAST_TRANSACTION',
          details: `Admin viewed last transaction (ID: ${transaction.transaction_id})`
        }));
      }
      
      // Format the transaction data for the frontend
      return {
        id: `TX${transaction.transaction_id.toString().padStart(6, '0')}`,
        date: transaction.transaction_date || 'N/A',
        amount: `$${parseFloat(transaction.amount.toString()).toFixed(2)}` || 'N/A',
        type: transaction.transaction_type || 'N/A',
        customer: {
          name: `${transaction.customer.first_name} ${transaction.customer.last_name}` || 'N/A',
          email: transaction.customer.email || 'N/A',
          accountNumber: `****${transaction.account.account_number.slice(-4)} ` || 'N/A',
        }
      };
    });

    if (!result) {
      res.status(404).json({
        success: false,
        data: {
          msg: 'No transactions found'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        transaction: result,
        msg: 'Last transaction retrieved successfully'
      }
    });
  } catch (error) {
    console.error('Error fetching last transaction:', error);
    res.status(500).json({
      success: false,
      data: {
        msg: 'Error fetching last transaction'
      }
    });
  }
};

/**
 * Get system statistics for the admin dashboard
 */
export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const customerRepository = transactionalEntityManager.getRepository(Customer);
      const transactionRepository = transactionalEntityManager.getRepository(Transaction);
      const accountRepository = transactionalEntityManager.getRepository(Account);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);
      
      // Get total users count
      const totalUsers = await customerRepository.count();
      
      // Get total transactions count
      const totalTransactions = await transactionRepository.count();
      
      // Get total active accounts
      const totalAccounts = await accountRepository
        .createQueryBuilder('account')
        .where('account.status = :status', { status: 'active' })
        .getCount();
      
      // Calculate monthly growth (placeholder - would need more complex logic in real app)
      // This is a simplified example - in a real app, you'd compare with previous month's data
      // const monthlyGrowth = '+12.5%';
      
      // Get admin user for audit log
      const adminUser = await customerRepository.findOne({ where: { customer_id: req.user?.id } });
      if (adminUser) {
        // Create audit log
        await auditLogRepository.save(auditLogRepository.create({
          customer: adminUser,
          operation: 'ADMIN_VIEW_SYSTEM_STATS',
          details: 'Admin viewed system statistics'
        }));
      }
      
      return [
        { label: 'Total Users', value: totalUsers.toString(), color: 'primary.main' },
        { label: 'Total Transactions', value: totalTransactions.toString(), color: 'success.main' },
        { label: 'Active Accounts', value: totalAccounts.toString(), color: 'secondary.main' },
        // { label: 'Monthly Growth', value: monthlyGrowth, color: 'warning.main' }
      ];
    });
    
    res.status(200).json({
      success: true,
      data: {
        stats,
        msg: 'System statistics retrieved successfully'
      }
    });
  } catch (error) {
    console.error('Error fetching system statistics:', error);
    res.status(500).json({
      success: false,
      data: {
        msg: 'Error fetching system statistics'
      }
    });
  }
};

/**
 * Get recent users for the admin dashboard
 */
export const getRecentUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const customerRepository = transactionalEntityManager.getRepository(Customer);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);
      
      const recentUsers = await customerRepository
        .createQueryBuilder('customer')
        .select([
          'customer.customer_id as id',
          'customer.first_name as firstName',
          'customer.last_name as lastName',
          'customer.email as email',
          'customer.created_at as joinDate'
        ])
        .orderBy('customer.created_at', 'DESC')
        .limit(5)
        .getRawMany();
      
      // Get admin user for audit log
      const adminUser = await customerRepository.findOne({ where: { customer_id: req.user?.id } });
      if (adminUser) {
        // Create audit log
        await auditLogRepository.save(auditLogRepository.create({
          customer: adminUser,
          operation: 'ADMIN_VIEW_RECENT_USERS',
          details: `Admin viewed recent users list (${recentUsers.length} users)`
        }));
      }
      return recentUsers.map(user => ({
        id: user.id.toString(),
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        joinDate: user.joindate,
      }));
    });
    
    res.status(200).json({
      success: true,
      data: {
        users: result,
        msg: 'Recent users retrieved successfully'
      }
    });
  } catch (error) {
    console.error('Error fetching recent users:', error);
    res.status(500).json({
      success: false,
      data: {
        msg: 'Error fetching recent users'
      }
    });
  }
};
