import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';

const router = Router();

// GET /api/equipment - Fetch all equipment
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(equipment);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch equipment catalog' });
  }
});

export default router;