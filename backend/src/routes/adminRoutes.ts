import { Router } from 'express';
import { 
  getLastTransaction, 
  getSystemStats, 
  getRecentUsers,
  createRevenueAccount,
  getRevenueAccounts,
  getRevenueAccountDetails,
  createCompanyUser
} from '../controllers/adminController';
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

/**
 * @swagger
 * /api/admin/revenue-account:
 *   post:
 *     summary: Create a new revenue account for a company
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - account_name
 *               - associated_company
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email for the revenue account
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the revenue account
 *               account_name:
 *                 type: string
 *                 description: Name for the revenue account
 *               associated_company:
 *                 type: string
 *                 description: Name of the company associated with this revenue account
 *     responses:
 *       201:
 *         description: Revenue account created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.post('/revenue-account', authenticateToken, isAdmin, createRevenueAccount);

/**
 * @swagger
 * /api/admin/revenue-accounts:
 *   get:
 *     summary: Get all revenue accounts
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue accounts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/revenue-accounts', authenticateToken, isAdmin, getRevenueAccounts);

/**
 * @swagger
 * /api/admin/revenue-account/{id}:
 *   get:
 *     summary: Get details of a specific revenue account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Revenue account ID
 *     responses:
 *       200:
 *         description: Revenue account details retrieved successfully
 *       400:
 *         description: Invalid account ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Revenue account not found
 *       500:
 *         description: Server error
 */
router.get('/revenue-account/:id', authenticateToken, isAdmin, getRevenueAccountDetails);

/**
 * @swagger
 * /api/admin/create-company-user:
 *   post:
 *     summary: Create a company user with an associated revenue account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - company_name
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: First name of the company user
 *               last_name:
 *                 type: string
 *                 description: Last name of the company user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email for the company user
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the company user
 *               phone:
 *                 type: string
 *                 description: Phone number for the company user (optional)
 *               address:
 *                 type: string
 *                 description: Address for the company user (optional)
 *               company_name:
 *                 type: string
 *                 description: Name of the company
 *     responses:
 *       201:
 *         description: Company user and revenue account created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.post('/create-company-user', authenticateToken, isAdmin, createCompanyUser);

export default router;
