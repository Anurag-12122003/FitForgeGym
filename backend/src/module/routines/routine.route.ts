import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { DayOfWeek } from '../../generated/prisma/client.js';
import { z } from 'zod';

const router = Router();

const routineExerciseSchema = z.object({
  exerciseId: z.string(),
  order: z.number().int().default(1),
  sets: z.number().int().default(3),
  repsMin: z.number().int().default(8),
  repsMax: z.number().int().default(12),
  restSeconds: z.number().int().default(60),
});

const routineDaySchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  name: z.string(),
  isRestDay: z.boolean().default(false),
  exercises: z.array(routineExerciseSchema).default([]),
});

const createRoutineSchema = z.object({
  name: z.string().min(2),
  goal: z.string().optional(),
  days: z.array(routineDaySchema),
});

// GET: Authenticated user's custom routines
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const routines = await prisma.routine.findMany({
    where: { userId },
    include: {
      days: {
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });
  res.json(routines);
});

// POST: Save or replace complete weekly routine
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const body = createRoutineSchema.parse(req.body);

    const routine = await prisma.routine.create({
      data: {
        userId,
        name: body.name,
        goal: body.goal ?? null,
        days: {
          create: body.days.map((d) => ({
            dayOfWeek: d.dayOfWeek,
            name: d.name,
            isRestDay: d.isRestDay,
            exercises: {
              create: d.exercises.map((e) => ({
                exerciseId: e.exerciseId,
                order: e.order,
                sets: e.sets,
                repsMin: e.repsMin,
                repsMax: e.repsMax,
                restSeconds: e.restSeconds,
              })),
            },
          })),
        },
      },
      include: {
        days: {
          include: { exercises: true },
        },
      },
    });

    res.status(201).json(routine);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to save routine' });
  }
});

// DELETE: Delete personal routine
router.delete('/:id', authenticate, async (req: Request<{id:string}>, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    await prisma.routine.deleteMany({
      where: { id: req.params.id, userId },
    });
    res.json({ message: 'Routine removed' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Delete failed' });
  }
});

export default router;