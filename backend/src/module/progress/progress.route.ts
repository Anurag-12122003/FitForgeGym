import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { z } from 'zod';

const router = Router();

const progressSchema = z.object({
  weightKg: z.number().positive(),
  bodyFatPct: z.number().positive().optional(),
  chestCm: z.number().positive().optional(),
  waistCm: z.number().positive().optional(),
  armsCm: z.number().positive().optional(),
  thighsCm: z.number().positive().optional(),
  shouldersCm: z.number().positive().optional(),
  notes: z.string().optional(),
});

// GET: User progress timeline
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const records = await prisma.progressRecord.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch progress timeline' });
  }
});

// POST: Log current body metrics
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = progressSchema.parse(req.body);

    const record = await prisma.progressRecord.create({
      data: {
        userId,
        date: new Date(),
        weightKg: data.weightKg,
        bodyFatPct: data.bodyFatPct ?? null,
        chestCm: data.chestCm ?? null,
        waistCm: data.waistCm ?? null,
        armsCm: data.armsCm ?? null,
        thighsCm: data.thighsCm ?? null,
        shouldersCm: data.shouldersCm ?? null,
        notes: data.notes ?? null,
      },
    });

    // Sync latest weight with user profile so Dashboard reflects it instantly
    await prisma.profile.updateMany({
      where: { userId },
      data: { weightKg: data.weightKg },
    });

    res.status(201).json(record);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to save progress entry' });
  }
});

// GET: Lifetime summary stats for dashboard & progress cards
router.get('/summary', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Only count completed sessions
    const totalSessions = await prisma.workoutSession.count({
      where: { userId, endedAt: { not: null } },
    });

    // Only sum tonnage from completed sets of finished sessions
    const allSets = await prisma.workoutSet.findMany({
      where: {
        workoutSession: { userId, endedAt: { not: null } },
        isCompleted: true,
      },
      select: { weightKg: true, reps: true },
    });

    const totalVolumeTonnage = allSets.reduce((acc, curr) => acc + curr.weightKg * curr.reps, 0);
    res.json({
      completedSessions: totalSessions,
      totalTonnageKg: Math.round(totalVolumeTonnage),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to calculate summary stats' });
  }
});

// server/src/modules/progress/progress.routes.ts
router.delete('/:id', authenticate, async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    await prisma.progressRecord.deleteMany({
      where: { id: req.params.id, userId },
    });
    res.json({ message: 'Measurement record deleted' });
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to delete record' });
  }
});

export default router;