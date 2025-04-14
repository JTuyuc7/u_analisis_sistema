"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController_1 = require("../controllers/profileController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
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
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the profile was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the profile was last updated
 */
/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer:
 *                   $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Profile not found
 */
router.get('/profile', authMiddleware_1.authenticateToken, profileController_1.getProfile);
/**
 * @swagger
 * /api/profile:
 *   patch:
 *     summary: Update authenticated user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: The user's new first name
 *               last_name:
 *                 type: string
 *                 description: The user's new last name
 *               phone:
 *                 type: string
 *                 description: The user's new phone number
 *               address:
 *                 type: string
 *                 description: The user's new address
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 customer:
 *                   $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Profile not found
 */
router.patch('/profile', authMiddleware_1.authenticateToken, profileController_1.updateProfile);
exports.default = router;
