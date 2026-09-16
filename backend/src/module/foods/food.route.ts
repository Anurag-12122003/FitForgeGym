import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { Role } from '../../generated/prisma/client.js';
import { z } from 'zod';

const router = Router();

const createFoodSchema = z.object({
  name: z.string().min(2),
  servingAmount: z.number().positive().default(100),
  servingUnit: z.string().default('g'),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).default(0),
  imageUrl: z.string().url().optional(),
});

// GET: Public list of catalog foods
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const foods = await prisma.food.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(foods);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch foods' });
  }
});

// POST: Admin add food item to catalog
router.post(
  '/admin',
  authenticate,
  requireRole(Role.ADMIN),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const data = createFoodSchema.parse(req.body);
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const food = await prisma.food.create({
        data: {
          name: data.name,
          slug,
          servingAmount: data.servingAmount,
          servingUnit: data.servingUnit,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          fiber: data.fiber,
          imageUrl: data.imageUrl ?? null,
        },
      });

      res.status(201).json(food);
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Failed to create food item' });
    }
  }
);

// DELETE: Admin delete food item
router.delete(
  '/admin/:id',
  authenticate,
  requireRole(Role.ADMIN),
  async (req: Request<{id:string}>, res: Response): Promise<void> => {
    try {
      await prisma.food.delete({
        where: { id: req.params.id },
      });
      res.json({ message: 'Food item deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Failed to delete food item' });
    }
  }
);

export default router;