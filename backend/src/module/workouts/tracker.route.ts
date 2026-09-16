import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { z } from 'zod';

const router = Router();

// POST: Start Live Session
router.post('/start', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, routineId } = req.body;

    const session = await prisma.workoutSession.create({
      data: {
        userId,
        name: name || 'Custom Workout Session',
        routineId: routineId || null,
        startedAt: new Date(),
      },
    });

    res.status(201).json(session);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to start session' });
  }
});

// POST: Record a completed set in live session
router.post('/:sessionId/sets', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { exerciseId, setNumber, weightKg, reps, isCompleted } = req.body;

    const setRecord = await prisma.workoutSet.create({
      data: {
        workoutSessionId: String(sessionId),
        exerciseId,
        setNumber: Number(setNumber),
        weightKg: parseFloat(weightKg),
        reps: Number(reps),
        isCompleted: isCompleted ?? true,
      },
    });

    res.status(201).json(setRecord);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to log set' });
  }
});

// PUT: Finish Session with total duration
router.put('/:sessionId/finish', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { durationSeconds, notes } = req.body;

    const session = await prisma.workoutSession.update({
      where: { id: String(sessionId) },
      data: {
        endedAt: new Date(),
        durationSeconds: durationSeconds ? Number(durationSeconds) : null,
        notes: notes || null,
      },
      include: { sets: true },
    });

    res.json(session);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to finalize workout' });
  }
});

// GET: Historical previous best performance comparison for an exercise
router.get('/previous-best/:exerciseId', authenticate, async (req: Request<{exerciseId:string}>, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { exerciseId } = req.params;

  const previousSets = await prisma.workoutSet.findMany({
    where: {
      exerciseId,
      workoutSession: { userId },
      isCompleted: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  res.json(previousSets);
});

export default router;