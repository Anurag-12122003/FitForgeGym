import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { Role } from '../../generated/prisma/client.js';

const router = Router();

/**
 * GET /api/muscles
 *
 * Get all muscles with their muscle groups
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
    try {
        const muscles = await prisma.muscle.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                muscleGroupId: true,
                muscleGroup: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: [
                {
                    muscleGroup: {
                        name: 'asc',
                    },
                },
                {
                    name: 'asc',
                },
            ],
        });

        res.json(muscles);
    } catch (error: any) {
        console.error('Failed to fetch muscles:', error);

        res.status(500).json({
            message: error.message || 'Failed to fetch muscles',
        });
    }
});


/**
 * GET /api/muscles/groups
 *
 * Get muscle groups with their muscles
 */
router.get('/groups', async (_req: Request, res: Response): Promise<void> => {
    try {
        const groups = await prisma.muscleGroup.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                muscles: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                    orderBy: {
                        name: 'asc',
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        res.json(groups);
    } catch (error: any) {
        console.error('Failed to fetch muscle groups:', error);

        res.status(500).json({
            message: error.message || 'Failed to fetch muscle groups',
        });
    }
});


/**
 * GET /api/muscles/:id
 *
 * Get single muscle
 */
router.get('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
        const muscle = await prisma.muscle.findUnique({
            where: {
                id: req.params.id,
            },
            include: {
                muscleGroup: true,
            },
        });

        if (!muscle) {
            res.status(404).json({
                message: 'Muscle not found',
            });
            return;
        }

        res.json(muscle);
    } catch (error: any) {
        console.error('Failed to fetch muscle:', error);

        res.status(500).json({
            message: error.message || 'Failed to fetch muscle',
        });
    }
});


/**
 * POST /api/muscles
 *
 * Admin create muscle
 */
router.post(
    '/',
    authenticate,
    requireRole(Role.ADMIN),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, slug, muscleGroupId } = req.body;

            if (!name || !muscleGroupId) {
                res.status(400).json({
                    message: 'name and muscleGroupId are required',
                });
                return;
            }

            const muscle = await prisma.muscle.create({
                data: {
                    name,
                    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    muscleGroupId,
                },
                include: {
                    muscleGroup: true,
                },
            });

            res.status(201).json(muscle);
        } catch (error: any) {
            console.error('Failed to create muscle:', error);

            res.status(400).json({
                message: error.message || 'Failed to create muscle',
            });
        }
    }
);


/**
 * DELETE /api/muscles/:id
 *
 * Admin delete muscle
 */
router.delete(
    '/:id',
    authenticate,
    requireRole(Role.ADMIN),
    async (req: Request<{ id: string }>, res: Response): Promise<void> => {
        try {
            await prisma.muscle.delete({
                where: {
                    id: req.params.id,
                },
            });

            res.json({
                message: 'Muscle deleted successfully',
            });
        } catch (error: any) {
            console.error('Failed to delete muscle:', error);

            res.status(400).json({
                message: error.message || 'Failed to delete muscle',
            });
        }
    }
);

export default router;
