"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accountController_1 = require("../controllers/accountController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       required:
 *         - account_type
 *         - account_name
 *       properties:
 *         account_id:
 *           type: integer
 *           description: The auto-generated id of the account
 *         account_number:
 *           type: string
 *           description: The unique account number
 *         account_type:
 *           type: string
 *           enum: [checking, savings]
 *           description: The type of account
 *         account_name:
 *           type: string
 *           description: The name of the account
 *         balance:
 *           type: number
 *           format: float
 *           description: Current balance of the account
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Current status of the account
 *     Transaction:
 *       type: object
 *       properties:
 *         transaction_id:
 *           type: integer
 *           description: The auto-generated id of the transaction
 *         amount:
 *           type: number
 *           format: float
 *           description: Transaction amount
 *         transaction_type:
 *           type: string
 *           enum: [transfer, deposit, withdrawal]
 *           description: Type of transaction
 *         description:
 *           type: string
 *           description: Transaction description
 */
/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_type
 *               - account_name
 *             properties:
 *               account_type:
 *                 type: string
 *                 enum: [checking, savings]
 *               account_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/accounts/customer/list:
 *   get:
 *     summary: List all accounts for the authenticated customer
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/accounts/transfer:
 *   post:
 *     summary: Transfer money between accounts
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromAccountId
 *               - toAccountId
 *               - amount
 *             properties:
 *               fromAccountId:
 *                 type: integer
 *                 description: Source account ID
 *               toAccountId:
 *                 type: integer
 *                 description: Destination account ID
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Amount to transfer
 *               description:
 *                 type: string
 *                 description: Transfer description
 *     responses:
 *       200:
 *         description: Transfer completed successfully
 *       400:
 *         description: Invalid transfer request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 */
/**
 * @swagger
 * /api/accounts/{accountId}/transactions:
 *   get:
 *     summary: List all transactions for a given account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account ID
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 */
/**
 * @swagger
 * /api/accounts/{accountId}:
 *   get:
 *     summary: Find if an account exists
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 */
// All routes require authentication
router.use(authMiddleware_1.authenticateToken);
// Create a new account
router.post('/', accountController_1.createAccount);
// List all accounts for a customer
router.get('/customer/list', accountController_1.listAccounts);
// Transfer money between accounts
router.post('/transfer', accountController_1.transferMoney);
// List all transactions for a given account
router.get('/:accountId/transactions', accountController_1.listTransactions);
// Find if an account exists
router.get('/:accountId', accountController_1.findValidAccount);
/**
 * @swagger
 * /api/accounts/change-balance:
 *   post:
 *     summary: Change account balance (Admin only)
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - newBalance
 *             properties:
 *               accountId:
 *                 type: integer
 *                 description: Account ID
 *               newBalance:
 *                 type: number
 *                 format: float
 *                 description: New balance for the account
 *     responses:
 *       200:
 *         description: Account balance updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Account not found
 */
router.post('/change-balance', authMiddleware_1.isAdmin, accountController_1.changeAccountBalance);
exports.default = router;
