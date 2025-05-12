import { Request, Response } from 'express';
import { Transaction } from '../entities/Transaction';
import { Customer } from '../entities/Customer';
import { Account } from '../entities/Account';
import { AuditLog } from '../entities/AuditLog';
import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';
import { generateAccountNumber } from '../utils/generateAccountNumber';

/**
 * Admin controller for handling admin-specific operations
 */

/**
 * Create a company user with an associated revenue account
 */
export const createCompanyUser = async (req: Request, res: Response): Promise<void> => {
  const { first_name, last_name, email, password, phone, address, company_name } = req.body;

  // Validate input
  if (!email || !password || !first_name || !last_name || !company_name) {
    res.status(400).json({
      success: false,
      data: {
        msg: 'Required fields missing: first_name, last_name, email, password, company_name'
      }
    });
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      data: {
        msg: 'Invalid email format'
      }
    });
    return;
  }

  try {
    const result = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const customerRepository = transactionalEntityManager.getRepository(Customer);
      const accountRepository = transactionalEntityManager.getRepository(Account);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);

      // Check if email already exists
      const existingCustomer = await customerRepository.findOne({ where: { email } });
      if (existingCustomer) {
        throw new Error('Email already in use');
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create a new customer for the company
      const customer = new Customer();
      customer.email = email;
      customer.password = hashedPassword;
      customer.first_name = first_name;
      customer.last_name = last_name;
      customer.phone = phone || null;
      customer.address = address || null;
      customer.admin = false; // Company users are not admins by default
      await customerRepository.save(customer);

      // Generate a unique account number
      const accountNumber = generateAccountNumber();

      // Generate a security PIN
      const securityPin = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit PIN
      const hashedPin = await bcrypt.hash(securityPin, saltRounds);

      // Create the revenue account
      const account = new Account();
      account.customer = customer;
      account.account_number = accountNumber;
      account.account_type = 'company_revenue';
      account.account_name = `${company_name} Revenue Account`;
      account.balance = 0;
      account.status = 'active';
      account.security_pin = hashedPin;
      account.is_revenue_account = true;
      account.associated_company = company_name;
      await accountRepository.save(account);

      // Get admin user for audit log
      const adminUser = await customerRepository.findOne({ where: { customer_id: req.user?.id } });
      if (adminUser) {
        // Create audit log
        await auditLogRepository.save(auditLogRepository.create({
          customer: adminUser,
          operation: 'ADMIN_CREATE_COMPANY_USER',
          details: `Admin created company user and revenue account for ${company_name}`
        }));
      }

      // Remove password from response
      const { password: _, ...customerWithoutPassword } = customer;

      return {
        user: customerWithoutPassword,
        account: {
          account_id: account.account_id,
          account_number: account.account_number,
          account_name: account.account_name,
          associated_company: account.associated_company,
          security_pin: securityPin // Return the unhashed PIN to the admin
        }
      };
    });

    res.status(201).json({
      success: true,
      data: {
        msg: 'Company user and revenue account created successfully',
        user: result.user,
        account: result.account
      }
    });
  } catch (error) {
    console.error('Error creating company user:', error);
    res.status(500).json({
      success: false,
      data: {
        msg: error instanceof Error ? error.message : 'Error creating company user and revenue account'
      }
    });
  }
};


/**
 * Create a new revenue account for a company
 */
export const createRevenueAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, account_name, associated_company, security_pin } = req.body;

    // Validate input
    if (!email || !password || !account_name || !associated_company || !security_pin) {
      res.status(400).json({
        success: false,
        data: {
          msg: 'All fields are required: email, password, account_name, associated_company'
        }
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        data: {
          msg: 'Invalid email format'
        }
      });
      return;
    }

    const result = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const customerRepository = transactionalEntityManager.getRepository(Customer);
      const accountRepository = transactionalEntityManager.getRepository(Account);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);

      // Check if email already exists
      const existingCustomer = await customerRepository.findOne({ where: { email } });
      if (existingCustomer) {
        throw new Error('Email already in use');
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create a new customer for the revenue account
      const customer = new Customer();
      customer.email = email;
      customer.password = hashedPassword;
      customer.first_name = 'Revenue';
      customer.last_name = 'Account';
      customer.admin = false; // Revenue accounts are not admin accounts
      await customerRepository.save(customer);

      // Generate a unique account number
      const accountNumber = generateAccountNumber();

      // Generate a security PIN
      const securityPin = Math.floor(100000 + Math.random() * 9000).toString(); // 4-digit PIN
      const hashedPin = await bcrypt.hash(security_pin, saltRounds);

      // Create the revenue account
      const account = new Account();
      account.customer = customer;
      account.account_number = accountNumber;
      account.account_type = 'company_revenue';
      account.account_name = account_name;
      account.balance = 0;
      account.status = 'active';
      account.security_pin = hashedPin;
      account.is_revenue_account = true;
      account.associated_company = associated_company;
      await accountRepository.save(account);

      // Get admin user for audit log
      const adminUser = await customerRepository.findOne({ where: { customer_id: req.user?.id } });
      if (adminUser) {
        // Create audit log
        await auditLogRepository.save(auditLogRepository.create({
          customer: adminUser,
          operation: 'ADMIN_CREATE_REVENUE_ACCOUNT',
          details: `Admin created revenue account for ${associated_company}`
        }));
      }

      return {
        account_id: account.account_id,
        account_number: account.account_number,
        account_name: account.account_name,
        associated_company: account.associated_company,
        security_pin: securityPin // Return the unhashed PIN to the admin
      };
    });

    res.status(201).json({
      success: true,
      data: {
        account: result,
        msg: 'Revenue account created successfully'
      }
    });
  } catch (error) {
    console.error('Error creating revenue account:', error);
    res.status(500).json({
      success: false,
      data: {
        msg: error instanceof Error ? error.message : 'Error creating revenue account'
      }
    });
  }
};

/**
 * Get all revenue accounts
 */
export const getRevenueAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const accountRepository = transactionalEntityManager.getRepository(Account);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);
      const customerRepository = transactionalEntityManager.getRepository(Customer);

      // Get all revenue accounts
      const accounts = await accountRepository
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.customer', 'customer')
        .where('account.is_revenue_account = :isRevenueAccount', { isRevenueAccount: true })
        .getMany();

      // Get admin user for audit log
      const adminUser = await customerRepository.findOne({ where: { customer_id: req.user?.id } });
      if (adminUser) {
        // Create audit log
        await auditLogRepository.save(auditLogRepository.create({
          customer: adminUser,
          operation: 'ADMIN_VIEW_REVENUE_ACCOUNTS',
          details: `Admin viewed revenue accounts (${accounts.length} accounts)`
        }));
      }

      return accounts.map(account => ({
        account_id: account.account_id,
        account_number: account.account_number,
        account_name: account.account_name,
        associated_company: account.associated_company,
        balance: account.balance,
        status: account.status,
        created_at: account.created_at
      }));
    });

    res.status(200).json({
      success: true,
      data: {
        accounts: result,
        msg: 'Revenue accounts retrieved successfully'
      }
    });
  } catch (error) {
    console.error('Error fetching revenue accounts:', error);
    res.status(500).json({
      success: false,
      data: {
        msg: 'Error fetching revenue accounts'
      }
    });
  }
};

/**
 * Get details of a specific revenue account
 */
export const getRevenueAccountDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        data: {
          msg: 'Valid account ID is required'
        }
      });
      return;
    }

    const result = await AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const accountRepository = transactionalEntityManager.getRepository(Account);
      const auditLogRepository = transactionalEntityManager.getRepository(AuditLog);
      const customerRepository = transactionalEntityManager.getRepository(Customer);
      const transactionRepository = transactionalEntityManager.getRepository(Transaction);

      // Get the revenue account
      const account = await accountRepository
        .createQueryBuilder('account')
        .leftJoinAndSelect('account.customer', 'customer')
        .where('account.account_id = :id', { id })
        .andWhere('account.is_revenue_account = :isRevenueAccount', { isRevenueAccount: true })
        .getOne();

      if (!account) {
        throw new Error('Revenue account not found');
      }

      // Get recent transactions for this account
      const transactions = await transactionRepository
        .createQueryBuilder('transaction')
        .where('transaction.account_id = :accountId', { accountId: account.account_id })
        .orderBy('transaction.transaction_date', 'DESC')
        .take(10)
        .getMany();

      // Get admin user for audit log
      const adminUser = await customerRepository.findOne({ where: { customer_id: req.user?.id } });
      if (adminUser) {
        // Create audit log
        await auditLogRepository.save(auditLogRepository.create({
          customer: adminUser,
          operation: 'ADMIN_VIEW_REVENUE_ACCOUNT_DETAILS',
          details: `Admin viewed details of revenue account ${account.account_number}`
        }));
      }

      return {
        account_id: account.account_id,
        account_number: account.account_number,
        account_name: account.account_name,
        associated_company: account.associated_company,
        balance: account.balance,
        status: account.status,
        created_at: account.created_at,
        customer: {
          email: account.customer.email
        },
        recent_transactions: transactions.map(tx => ({
          transaction_id: tx.transaction_id,
          transaction_type: tx.transaction_type,
          amount: tx.amount,
          description: tx.description,
          transaction_date: tx.transaction_date
        }))
      };
    });

    res.status(200).json({
      success: true,
      data: {
        account: result,
        msg: 'Revenue account details retrieved successfully'
      }
    });
  } catch (error) {
    console.error('Error fetching revenue account details:', error);
    res.status(500).json({
      success: false,
      data: {
        msg: error instanceof Error ? error.message : 'Error fetching revenue account details'
      }
    });
  }
};

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
      
      // Get total company accounts
      const totalCompanyAccounts = await accountRepository
        .createQueryBuilder('account')
        .where('account.is_revenue_account = :isRevenueAccount', { isRevenueAccount: true })
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
        { label: 'Company Accounts', value: totalCompanyAccounts.toString() ?? 0, color: 'warning.main' }
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
