import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { MealType } from '../../generated/prisma/client.js';
import { z } from 'zod';

const router = Router();

const createDietPlanSchema = z.object({
    name: z.string().min(2),
    goal: z.string().optional(),
    targetCalories: z.number().positive(),
    targetProtein: z.number().min(0),
    targetCarbs: z.number().min(0),
    targetFat: z.number().min(0),
});

const addMealSchema = z.object({
    name: z.string().min(2),
    type: z.nativeEnum(MealType).default(MealType.BREAKFAST),
    order: z.number().int().default(1),
});

const addMealFoodSchema = z.object({
    foodId: z.string(),
    quantityAmount: z.number().positive().default(100),
});

// GET: Current user's diet plans with meals and foods
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    try {
        const plans = await prisma.dietPlan.findMany({
            where: { userId },
            include: {
                meals: {
                    include: {
                        foods: {
                            include: { food: true },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        res.json(plans);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch diet plans' });
    }
});

// POST: Create a new diet plan
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const data = createDietPlanSchema.parse(req.body);

        const plan = await prisma.dietPlan.create({
            data: {
                userId,
                name: data.name,
                ...(data.goal !== undefined && { goal: data.goal }),
                targetCalories: data.targetCalories,
                targetProtein: data.targetProtein,
                targetCarbs: data.targetCarbs,
                targetFat: data.targetFat,
            },
        });


        res.status(201).json(plan);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to create diet plan' });
    }
});

// POST: Add a meal container to a diet plan (e.g., Breakfast, Lunch)
router.post('/:planId/meals', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const { planId } = req.params;
        const data = addMealSchema.parse(req.body);

        const meal = await prisma.meal.create({
            data: {
                dietPlanId: String(planId),
                ...data,
            },
        });

        res.status(201).json(meal);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to add meal' });
    }
});

// POST: Add catalog food to a specific meal with grams/quantity
router.post('/meals/:mealId/foods', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const { mealId } = req.params;
        const { foodId, quantityAmount } = addMealFoodSchema.parse(req.body);

        const mealFood = await prisma.mealFood.create({
            data: {
                mealId:String(mealId),
                foodId,
                quantityAmount,
            },
            include: { food: true },
        });

        res.status(201).json(mealFood);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to add food to meal' });
    }
});

// DELETE: Remove a food item from a meal
router.delete('/meal-foods/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const {id}=req.params;
        await prisma.mealFood.delete({
            where: { id: String(id) },
        });
        res.json({ message: 'Food removed from meal' });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to remove food' });
    }
});

export default router;