import { prisma } from '../../config/database.js';
import { z } from 'zod';

const aiWorkoutExerciseSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  targetMuscle: z.string(),
  sets: z.number().int().min(1).max(6),
  repsMin: z.number().int().min(1).max(30),
  repsMax: z.number().int().min(1).max(30),
  targetWeightKg: z.number().nonnegative(), // AI recommended working weight in kg
  restSeconds: z.number().int().min(30).max(300),
  coachingCue: z.string(), // Form cue tailored to biometrics
});

const aiWorkoutDaySchema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  name: z.string(),
  isRestDay: z.boolean(),
  focus: z.string(),
  exercises: z.array(aiWorkoutExerciseSchema),
});

export const aiGeneratedRoutineSchema = z.object({
  routineName: z.string(),
  targetGoal: z.string(),
  reasoning: z.string(),
  days: z.array(aiWorkoutDaySchema).length(7),
});

export type AIGeneratedRoutine = z.infer<typeof aiGeneratedRoutineSchema>;

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
    // 1. Fetch catalog exercises with equipment and muscles
    const catalog = await prisma.exercise.findMany({
      select: {
        id: true,
        name: true,
        difficulty: true,
        equipment: { select: { name: true } },
        muscles: {
          select: {
            role: true,
            muscle: { select: { name: true } },
          },
        },
      },
      take: 60,
    });

    if (catalog.length === 0) {
      throw new Error('Database mein exercises nahi hain. Pehle seed run karein.');
    }

    const formattedCatalog = catalog.map((c) => ({
      id: c.id,
      name: c.name,
      equipment: c.equipment?.name || 'Bodyweight',
      targetMuscle: c.muscles.find((m) => m.role === 'PRIMARY')?.muscle.name || 'General',
      difficulty: c.difficulty,
    }));

    const apiKey = process.env.GROQ_API_KEY;

    // Calculate BMI & Strength Baselines
    const heightM = (params.heightCm || 175) / 100;
    const weight = params.weightKg || 70;
    const bmi = (weight / (heightM * heightM)).toFixed(1);

    if (!apiKey) {
      console.warn('⚠️ GROQ_API_KEY missing in .env. Falling back to algorithmic split.');
      return this.generateSmartAlgorithmicSplit(params, formattedCatalog);
    }

    try {
      console.log(`🚀 [AI Engine] Generating biometric split for ${weight}kg, ${params.heightCm}cm (BMI: ${bmi})...`);

      const systemPrompt = `You are a world-class biomechanics specialist and master strength coach.
Output ONLY valid, parseable JSON strictly matching this schema:
{
  "routineName": string,
  "targetGoal": string,
  "reasoning": string,
  "days": [
    {
      "dayOfWeek": "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY",
      "name": string,
      "isRestDay": boolean,
      "focus": string,
      "exercises": [
        {
          "exerciseId": string,
          "exerciseName": string,
          "targetMuscle": string,
          "sets": number (2-5),
          "repsMin": number (6-15),
          "repsMax": number (8-20),
          "targetWeightKg": number (exact starting working weight in kg, calculated rationally),
          "restSeconds": number (45-120),
          "coachingCue": string (concise biomechanical cue)
        }
      ]
    }
  ]
}

CRITICAL WEIGHT & BIOMETRIC PRESCRIPTION FORMULA:
- Athlete: Weight ${weight} kg, Height ${params.heightCm} cm, BMI ${bmi}, Level ${params.experienceLevel}, Gender ${params.gender || 'MALE'}, Age ${params.age || 25}.
- You MUST prescribe realistic starting "targetWeightKg" for EVERY exercise:
  * Bodyweight movements (Pushups, Pullups, Crunches): targetWeightKg = 0.
  * Dumbbell isolation (Lateral raises, curls): prescribe pair/single weight (e.g., 5 to 12.5 kg).
  * Heavy compounds (Squats, Bench, Rows): calculate realistic fraction of bodyweight based on ${params.experienceLevel}:
    - BEGINNER: ~0.4x to 0.6x bodyweight.
    - INTERMEDIATE: ~0.7x to 1.1x bodyweight.
    - ADVANCED: ~1.2x to 1.6x bodyweight.
- DO NOT invent exercises. You MUST pick ONLY from this catalog:
${JSON.stringify(formattedCatalog)}
- For a session duration of ${params.durationMinutes} minutes, include exactly 3 to 5 exercises per active training day.
- Exactly ${7 - params.daysPerWeek} days MUST have "isRestDay": true with an empty exercises array [].
- All 7 days (MONDAY through SUNDAY) must be present.`;

      const userPrompt = `
Generate a personalized ${params.daysPerWeek}-day split for:
- Goal: ${params.goal}
- Experience: ${params.experienceLevel}
- Duration per session: ${params.durationMinutes} mins
- Bodyweight: ${weight} kg
- Height: ${params.heightCm} cm
- Gender: ${params.gender || 'MALE'}
- Age: ${params.age || 25}
Prescribe exact working weights (in kg) for each movement so the athlete knows exactly what dumbbells/barbell load to pick.`;

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
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('❌ Groq API error:', err);
        return this.generateSmartAlgorithmicSplit(params, formattedCatalog);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty payload from Groq');

      const parsedData = JSON.parse(content);
      const validated = aiGeneratedRoutineSchema.parse(parsedData);

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
      console.error('❌ [AI Generation Exception]:', err.message);
      return this.generateSmartAlgorithmicSplit(params, formattedCatalog);
    }
  }

  private static generateSmartAlgorithmicSplit(params: any, catalog: any[]): AIGeneratedRoutine {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
    const bw = params.weightKg || 70;
    const levelFactor = params.experienceLevel === 'ADVANCED' ? 1.0 : params.experienceLevel === 'INTERMEDIATE' ? 0.7 : 0.45;

    const daysCount = Math.min(6, Math.max(2, params.daysPerWeek));
    let tIndex = 0;

    const routineDays = days.map((day, idx) => {
      const isRest = idx === 2 || idx === 6 || tIndex >= daysCount;
      if (isRest) {
        return {
          dayOfWeek: day,
          name: 'Rest & Recovery',
          isRestDay: true,
          focus: 'Full body active restoration and mobility',
          exercises: [],
        };
      }

      tIndex++;
      const dayExercises = catalog.slice((tIndex - 1) * 3, (tIndex - 1) * 3 + 3).map((ex) => {
        const isBw = ex.equipment?.toLowerCase().includes('bodyweight');
        const calcWeight = isBw ? 0 : Math.round((bw * levelFactor) / 2.5) * 2.5; // nearest 2.5kg plate

        return {
          exerciseId: ex.id,
          exerciseName: ex.name,
          targetMuscle: ex.targetMuscle,
          sets: 3,
          repsMin: 8,
          repsMax: 12,
          targetWeightKg: calcWeight,
          restSeconds: 90,
          coachingCue: 'Maintain controlled eccentric tempo of 3 seconds.',
        };
      });

      return {
        dayOfWeek: day,
        name: `Day ${tIndex} Focus Session`,
        isRestDay: false,
        focus: 'Compound strength and progressive tension',
        exercises: dayExercises,
      };
    });

    return {
      routineName: `${params.goal} Biometric Blueprint`,
      targetGoal: params.goal,
      reasoning: `Custom strength curve calculated for ${bw}kg bodyweight using progressive plate load increments.`,
      days: routineDays,
    };
  }
}