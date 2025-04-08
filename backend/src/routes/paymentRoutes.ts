import express from 'express';
import { processCardPayment, processAccountPayment } from '../controllers/paymentController';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Payment processed successfully
 *         success:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /api/payments/card:
 *   post:
 *     summary: Process a card payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - card_number
 *               - expiration_date
 *               - security_code
 *               - amount
 *               - company_name
 *             properties:
 *               card_number:
 *                 type: string
 *                 description: 16-digit card number
 *               expiration_date:
 *                 type: string
 *                 description: Card expiration date in MM/YY format
 *               security_code:
 *                 type: string
 *                 description: 3-digit security code
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *               company_name:
 *                 type: string
 *                 description: Name of the company receiving the payment
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Invalid input or insufficient funds
 *       500:
 *         description: Server error
 */
router.post('/card', processCardPayment);

/**
 * @swagger
 * /api/payments/account:
 *   post:
 *     summary: Process a payment using account number and PIN
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_number
 *               - security_pin
 *               - amount
 *               - company_name
 *             properties:
 *               account_number:
 *                 type: string
 *                 description: Account number
 *               security_pin:
 *                 type: string
 *                 description: Account security PIN
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *               company_name:
 *                 type: string
 *                 description: Name of the company receiving the payment
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Invalid input, incorrect PIN, or insufficient funds
 *       500:
 *         description: Server error
 */
router.post('/account', processAccountPayment);

export default router;
