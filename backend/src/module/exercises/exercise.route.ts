import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { Role, FitnessLevel, MuscleRole } from '../../generated/prisma/client.js';
import { z } from 'zod';

const router = Router();

const createExerciseSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    difficulty: z.nativeEnum(FitnessLevel).default(FitnessLevel.BEGINNER),
    equipmentId: z.string().optional(),
    primaryMuscleId: z.string(),
    secondaryMuscleIds: z.array(z.string()).optional().default([]),
    defaultSets: z.number().int().default(3),
    repsMin: z.number().int().default(8),
    repsMax: z.number().int().default(12),
    restSeconds: z.number().int().default(90),
    imageUrl: z.string().url().optional(),
    instructions: z.array(z.string()).optional().default([]),
    commonMistakes: z.array(z.string()).optional().default([]),
});

// GET: Public list with primary and secondary target muscle tags
router.get('/', async (_req: Request, res: Response): Promise<void> => {
    const exercises = await prisma.exercise.findMany({
        include: {
            equipment: true,
            muscles: {
                include: { muscle: true },
            },
        },
        orderBy: { name: 'asc' },
    });
    res.json(exercises);
});

// GET: Single exercise detail with breakdown
router.get('/:slug', async (req: Request<{ slug: string }>, res: Response): Promise<void> => {
    const exercise = await prisma.exercise.findUnique({

        where: { slug: req.params.slug },
        include: {
            equipment: true,
            muscles: {
                include: { muscle: true },
            },
        },
    });

    if (!exercise) {
        res.status(404).json({ message: 'Exercise not found' });
        return;
    }

    res.json(exercise);
});

// POST: Admin create exercise with muscle bindings
router.post(
    '/admin',
    authenticate,
    requireRole(Role.ADMIN),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const data = createExerciseSchema.parse(req.body);
            const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

            const exercise = await prisma.exercise.create({
                data: {
                    name: data.name,
                    slug,
                    description: data.description ?? null,
                    difficulty: data.difficulty,
                    equipmentId: data.equipmentId ?? null,
                    defaultSets: data.defaultSets,
                    repsMin: data.repsMin,
                    repsMax: data.repsMax,
                    restSeconds: data.restSeconds,
                    imageUrl: data.imageUrl ?? null,
                    instructions: data.instructions,
                    commonMistakes: data.commonMistakes,

                    muscles: {
                        create: [
                            {
                                muscleId: data.primaryMuscleId,
                                role: MuscleRole.PRIMARY,
                            },
                            ...data.secondaryMuscleIds.map((id) => ({
                                muscleId: id,
                                role: MuscleRole.SECONDARY,
                            })),
                        ],
                    },
                },
                include: {
                    muscles: true,
                },
            });


            res.status(201).json(exercise);
        } catch (error: any) {
            res.status(400).json({ message: error.message || 'Failed to create exercise' });
        }
    }
);

// DELETE: Admin remove exercise
router.delete(
    '/admin/:id',
    authenticate,
    requireRole(Role.ADMIN),
    async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            await prisma.exercise.delete({ where: { id: req.params.id } });
            res.json({ message: 'Exercise catalog item deleted' });
        } catch (error: any) {
            res.status(400).json({ message: error.message || 'Failed to delete' });
        }
    }
);

export default router;