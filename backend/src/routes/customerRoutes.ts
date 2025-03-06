import express from 'express';
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticateToken, getCustomers);
// router.get('/', getCustomers);
router.get('/:id', authenticateToken, getCustomerById);
router.post('/', authenticateToken, isAdmin, createCustomer);
router.put('/:id', authenticateToken, isAdmin, updateCustomer);
router.delete('/:id', authenticateToken, isAdmin, deleteCustomer);

export default router;
