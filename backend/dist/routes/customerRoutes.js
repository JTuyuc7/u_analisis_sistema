"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerController_1 = require("../controllers/customerController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - email
 *         - phone
 *         - address
 *       properties:
 *         customer_id:
 *           type: integer
 *           description: The auto-generated id of the customer
 *         first_name:
 *           type: string
 *           description: The customer's first name
 *         last_name:
 *           type: string
 *           description: The customer's last name
 *         email:
 *           type: string
 *           description: The customer's email address
 *         phone:
 *           type: string
 *           description: The customer's phone number
 *         address:
 *           type: string
 *           description: The customer's address
 *         admin:
 *           type: boolean
 *           description: Whether the customer has admin privileges
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the customer was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the customer was last updated
 */
/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Retrieve all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin, customerController_1.getCustomers);
/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get a customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 */
router.get('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin, customerController_1.getCustomerById);
/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin, customerController_1.createCustomer);
/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 */
router.put('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin, customerController_1.updateCustomer);
/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 */
router.delete('/:id', authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin, customerController_1.deleteCustomer);
/**
 * @swagger
 * /api/customers/set-admin:
 *   post:
 *     summary: Set admin permissions for a customer
 *     tags: [Customers]
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
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the customer to grant admin permissions
 *     responses:
 *       200:
 *         description: Admin privileges granted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 customer:
 *                   type: object
 *                   properties:
 *                     customer_id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     admin:
 *                       type: boolean
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Error setting admin status
 */
router.post('/set-admin', authMiddleware_1.authenticateToken, authMiddleware_1.isAdmin, customerController_1.setAdminStatus);
exports.default = router;
