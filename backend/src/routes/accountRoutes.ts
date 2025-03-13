import { Router } from 'express';
import { createAccount, listAccounts, transferMoney, listTransactions } from '../controllers/accountController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new account
router.post('/', createAccount);

// List all accounts for a customer
router.get('/customer/list', listAccounts);

// Transfer money between accounts
router.post('/transfer', transferMoney);

// List all transactions for a given account
router.get('/:accountId/transactions', listTransactions);

export default router;
