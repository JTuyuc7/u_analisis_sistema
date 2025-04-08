import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { seedInitialData } from '../seeders/initialData';

const router = Router();

/**
 * @swagger
 * /api/seed:
 *   post:
 *     summary: Seed the database with initial data
 *     tags: [Database]
 *     responses:
 *       200:
 *         description: Database seeded successfully
 *       500:
 *         description: Error seeding database
 */
router.post('/seed', async (req, res) => {
  try {
    await seedInitialData(AppDataSource);
    res.status(200).json({ message: 'Database seeded successfully' });
  } catch (error: unknown) {
    console.error('Error seeding database:', error);
    res.status(500).json({ message: 'Error seeding database', error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
