import { prisma } from '../../config/database.js';
import { z } from 'zod';

const aiWorkoutExerciseSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  targetMuscle: z.string().optional().default('General'),
  sets: z.coerce.number().int().min(1).max(6).default(3),
  repsMin: z.coerce.number().int().min(1).max(30).default(8),
  repsMax: z.coerce.number().int().min(1).max(30).default(12),
  targetWeightKg: z.coerce.number().nonnegative().default(0),
  restSeconds: z.coerce.number().int().min(30).max(300).default(90),
  coachingCue: z.string().optional().default('Maintain steady form and control.'),
});

const aiWorkoutDaySchema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  name: z.string(),
  isRestDay: z.boolean(),
  focus: z.string().optional().default('Strength & Hypertrophy'),
  exercises: z.array(aiWorkoutExerciseSchema).default([]),
});

export const aiGeneratedRoutineSchema = z.object({
  routineName: z.string().default('AI Personalized Split'),
  targetGoal: z.string().default('Muscle Hypertrophy'),
  reasoning: z.string().default('Scientific split mapped to kinetic profile.'),
  days: z.array(aiWorkoutDaySchema),
});

export type AIGeneratedRoutine = z.infer<typeof aiGeneratedRoutineSchema>;

const ALL_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

export class AIService {
  public static async generateWorkout(params: {
    goal: string;
    experienceLevel: string;
    daysPerWeek: number;
    durationMinutes: number;
    weightKg: number;
    heightCm: number;
    age?: number;
    gender?: string;
  }): Promise<AIGeneratedRoutine> {
    const catalog = await prisma.exercise.findMany({
      select: {
        id: true,
        name: true,
        equipment: { select: { name: true } },
        muscles: {
          where: { role: 'PRIMARY' },
          select: { muscle: { select: { name: true } } },
        },
      },
      take: 40,
    });

    if (catalog.length === 0) {
      throw new Error('Database catalog is empty. Run seed first.');
    }

    const compactCatalog = catalog.map((c) => ({
      id: c.id,
      name: c.name,
      eq: c.equipment?.name || 'Bodyweight',
      target: c.muscles[0]?.muscle.name || 'General',
    }));

    const apiKey = process.env.GROQ_API_KEY;
    const heightM = (params.heightCm || 170) / 100;
    const weight = params.weightKg || 79;
    const bmi = (weight / (heightM * heightM)).toFixed(1);
    const requestedDays = Math.min(6, Math.max(2, params.daysPerWeek));

    // Determine Day Layout in deterministic code
    const layoutMap: Record<number, { name: string; focus: string; isRest: boolean }[]> = {
      6: [
        { name: 'Push Day 1', focus: 'Chest, Shoulders & Triceps', isRest: false },
        { name: 'Pull Day 1', focus: 'Back & Biceps', isRest: false },
        { name: 'Leg Day 1', focus: 'Quads, Hamstrings & Calves', isRest: false },
        { name: 'Push Day 2', focus: 'Chest, Shoulders & Triceps', isRest: false },
        { name: 'Pull Day 2', focus: 'Back & Biceps', isRest: false },
        { name: 'Leg Day 2', focus: 'Quads, Hamstrings & Calves', isRest: false },
        { name: 'Rest & Recovery', focus: 'Active recovery and mobility', isRest: true },
      ],
      5: [
        { name: 'Push Day', focus: 'Chest, Shoulders & Triceps', isRest: false },
        { name: 'Pull Day', focus: 'Back & Biceps', isRest: false },
        { name: 'Leg Day', focus: 'Quads & Hamstrings', isRest: false },
        { name: 'Rest & Recovery', focus: 'Rest Day', isRest: true },
        { name: 'Upper Body Focus', focus: 'Chest, Back & Arms', isRest: false },
        { name: 'Lower Body & Core', focus: 'Legs & Core', isRest: false },
        { name: 'Rest & Recovery', focus: 'Rest Day', isRest: true },
      ],
      4: [
        { name: 'Upper Body A', focus: 'Chest, Back & Shoulders', isRest: false },
        { name: 'Lower Body A', focus: 'Quads & Hamstrings', isRest: false },
        { name: 'Rest & Recovery', focus: 'Rest Day', isRest: true },
        { name: 'Upper Body B', focus: 'Chest, Back & Arms', isRest: false },
        { name: 'Lower Body B', focus: 'Glutes, Hamstrings & Calves', isRest: false },
        { name: 'Rest & Recovery', focus: 'Rest Day', isRest: true },
        { name: 'Rest & Recovery', focus: 'Rest Day', isRest: true },
      ],
      3: [
        { name: 'Full Body A', focus: 'Compound Push & Pull', isRest: false },
        { name: 'Rest & Recovery', focus: 'Rest Day', isRest: true },
        { name: 'Full Body B', focus: 'Lower Body & Core', isRest: false },
        { name: 'Rest & Recovery', focus: 'Rest Day', isRest: true },
        { name: 'Full Body C', focus: 'Full Body Conditioning', isRest: false },
        { name: 'Rest & Recovery', focus: 'Rest Day', isRest: true },
        { name: 'Rest & Recovery', focus: 'Rest Day', isRest: true },
      ],
      2: [
        { name: 'Upper Body', focus: 'Chest, Back & Arms', isRest: false },
        { name: 'Rest & Recovery', focus: 'Rest Day', isRest: true },
        { name: 'Rest & Recovery', focus: 'Rest Day', isRest: true },
        { name: 'Lower Body', focus: 'Quads, Hamstrings & Core', isRest: false },
        { name: 'Rest & Recovery', focus: 'Rest Day', isRest: true },
        { name: 'Rest & Recovery', focus: 'Rest Day', isRest: true },
        { name: 'Rest & Recovery', focus: 'Rest Day', isRest: true },
      ],
    };

    const targetLayout = layoutMap[requestedDays] || layoutMap[4];

    // Pre-seed the 7-day skeleton array
    const skeletonDays = ALL_DAYS.map((dayName, idx) => ({
      dayOfWeek: dayName,
      name: targetLayout[idx].name,
      isRestDay: targetLayout[idx].isRest,
      focus: targetLayout[idx].focus,
    }));

    if (!apiKey) {
      return this.generateSmartAlgorithmicSplit(params, compactCatalog, skeletonDays);
    }

    try {
      console.log(`🚀 [AI Engine] Requesting exact ${requestedDays}-day routine from Groq...`);

      const systemPrompt = `You are a sports science coach. Output valid JSON strictly matching the provided schedule.
You MUST fill exercises for ALL non-rest days in this schedule:
${JSON.stringify(skeletonDays)}

Output format:
{
  "routineName": string,
  "targetGoal": string,
  "reasoning": string,
  "days": [
    {
      "dayOfWeek": "MONDAY",
      "name": "Push Day 1",
      "isRestDay": false,
      "focus": "Chest, Shoulders & Triceps",
      "exercises": [
        {
          "exerciseId": string,
          "exerciseName": string,
          "targetMuscle": string,
          "sets": 3,
          "repsMin": 8,
          "repsMax": 12,
          "targetWeightKg": number,
          "restSeconds": 90,
          "coachingCue": string
        }
      ]
    }
  ]
}

CRITICAL RULES:
1. Every day marked with "isRestDay": false MUST have 3 to 4 populated exercises. DO NOT LEAVE ANY ACTIVE DAY EMPTY.
2. Days marked with "isRestDay": true MUST have "exercises": [].
3. Pick exercises ONLY from this catalog:
${JSON.stringify(compactCatalog)}`;

      const userPrompt = `Fill the workout plan for a ${params.experienceLevel} athlete (${weight}kg, ${params.heightCm}cm, Goal: ${params.goal}).
Prescribe realistic targetWeightKg (in kg). Return strictly raw JSON.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('❌ Groq API error:', err);
        return this.generateSmartAlgorithmicSplit(params, compactCatalog, skeletonDays);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from Groq');

      const parsedData = JSON.parse(content);
      const validated = aiGeneratedRoutineSchema.parse(parsedData);

      // Post-Processing: Guarantee every required active day has exercises
      const dayMap = new Map(validated.days.map((d) => [d.dayOfWeek, d]));

      const fullSevenDays = skeletonDays.map((skDay) => {
        const generatedDay = dayMap.get(skDay.dayOfWeek);

        // If LLM cheated and left an active day empty or marked it as rest:
        if (!skDay.isRestDay && (!generatedDay || generatedDay.isRestDay || generatedDay.exercises.length === 0)) {
          // Fallback-fill exercises for this specific active day
          const daySlice = catalog.slice(0, 3).map((c) => ({
            exerciseId: c.id,
            exerciseName: c.name,
            targetMuscle: c.muscles[0]?.muscle.name || 'General',
            sets: 3,
            repsMin: 8,
            repsMax: 12,
            targetWeightKg: Math.round((weight * 0.45) / 2.5) * 2.5,
            restSeconds: 90,
            coachingCue: 'Controlled cadence and focus on form.',
          }));

          return {
            dayOfWeek: skDay.dayOfWeek,
            name: skDay.name,
            isRestDay: false,
            focus: skDay.focus,
            exercises: daySlice,
          };
        }

        return (
          generatedDay || {
            dayOfWeek: skDay.dayOfWeek,
            name: skDay.name,
            isRestDay: skDay.isRestDay,
            focus: skDay.focus,
            exercises: [],
          }
        );
      });

      validated.days = fullSevenDays;

      // Validate catalog IDs to prevent hallucinations
      const validMap = new Map(catalog.map((c) => [c.id, c.name]));
      for (const day of validated.days) {
        for (const ex of day.exercises) {
          if (!validMap.has(ex.exerciseId)) {
            const match = catalog.find((c) => c.name.toLowerCase() === ex.exerciseName.toLowerCase()) || catalog[0];
            ex.exerciseId = match.id;
            ex.exerciseName = match.name;
          }
        }
      }

      return validated;
    } catch (err: any) {
      console.error('❌ [AI Generation Exception]:', err.message || err);
      return this.generateSmartAlgorithmicSplit(params, compactCatalog, skeletonDays);
    }
  }

  private static generateSmartAlgorithmicSplit(params: any, catalog: any[], skeletonDays: any[]): AIGeneratedRoutine {
    const bw = params.weightKg || 79;
    const levelFactor = params.experienceLevel === 'ADVANCED' ? 0.9 : params.experienceLevel === 'INTERMEDIATE' ? 0.65 : 0.45;

    let trainingIndex = 0;
    const fullDays = skeletonDays.map((sk) => {
      if (sk.isRestDay) {
        return {
          dayOfWeek: sk.dayOfWeek,
          name: sk.name,
          isRestDay: true,
          focus: sk.focus,
          exercises: [],
        };
      }

      trainingIndex++;
      const startIdx = ((trainingIndex - 1) * 3) % Math.max(1, catalog.length - 4);
      const exercises = catalog.slice(startIdx, startIdx + 3).map((ex) => {
        const isBw = (ex.eq || '').toLowerCase().includes('bodyweight');
        const calcWeight = isBw ? 0 : Math.round((bw * levelFactor) / 2.5) * 2.5;

        return {
          exerciseId: ex.id,
          exerciseName: ex.name,
          targetMuscle: ex.target || 'General',
          sets: 3,
          repsMin: 8,
          repsMax: 12,
          targetWeightKg: calcWeight,
          restSeconds: 90,
          coachingCue: 'Controlled tempo with strict muscular contraction.',
        };
      });

      return {
        dayOfWeek: sk.dayOfWeek,
        name: sk.name,
        isRestDay: false,
        focus: sk.focus,
        exercises,
      };
    });

    return {
      routineName: `Optimized ${params.daysPerWeek}-Day Split`,
      targetGoal: params.goal,
      reasoning: `Structured progression programmed for ${bw}kg bodyweight.`,
      days: fullDays,
    };
  }
}