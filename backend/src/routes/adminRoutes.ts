import { Router } from 'express';
import { getLastTransaction, getSystemStats, getRecentUsers } from '../controllers/adminController';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Transaction ID with TX prefix
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the transaction
 *         amount:
 *           type: string
 *           description: Formatted transaction amount with currency symbol
 *         type:
 *           type: string
 *           description: Type of transaction (deposit, transfer, etc.)
 *         customer:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Customer's full name
 *             email:
 *               type: string
 *               description: Customer's email address
 *             accountNumber:
 *               type: string
 *               description: Masked account number
 */

/**
 * @swagger
 * /api/admin/last-transaction:
 *   get:
 *     summary: Get the most recent transaction in the system
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Last transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/AdminTransaction'
 *                     msg:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: No transactions found
 *       500:
 *         description: Server error
 */
router.get('/last-transaction', authenticateToken, isAdmin, getLastTransaction);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics for the admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/stats', authenticateToken, isAdmin, getSystemStats);

/**
 * @swagger
 * /api/admin/recent-users:
 *   get:
 *     summary: Get recent users for the admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/recent-users', authenticateToken, isAdmin, getRecentUsers);

export default router;
