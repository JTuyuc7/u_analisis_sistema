import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: Test route
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Test route is working
 */
router.get('/', (req, res) => {
  res.status(200).json({ message: 'App from Render small change' });
}
);

export default router;