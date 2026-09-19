import { Router } from 'express';
import type { Request, Response } from 'express';
import { AIService } from './ai.service.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/generate-routine', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { goal, experienceLevel, daysPerWeek, durationMinutes } = req.body;

    const routine = await AIService.generateWorkout({
      goal: goal || 'Muscle Hypertrophy',
      experienceLevel: experienceLevel || 'INTERMEDIATE',
      daysPerWeek: Number(daysPerWeek) || 4,
      durationMinutes: Number(durationMinutes) || 60,
    });

    res.json(routine);
  } catch (error: any) {
    console.error('AI Routine generation error:', error);
    res.status(400).json({ message: error.message || 'Failed to generate routine' });
  }
});

export default router;