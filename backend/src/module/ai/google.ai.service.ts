import { prisma } from '../../config/database.js';
import { z } from 'zod';

const aiWorkoutExerciseSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  targetMuscle: z.string().optional().default('General'),
  sets: z.coerce.number().int().min(2).max(5).default(3),
  repsMin: z.coerce.number().int().min(5).max(30).default(8),
  repsMax: z.coerce.number().int().min(5).max(30).default(12),
  targetWeightKg: z.coerce.number().nonnegative().default(0),
  restSeconds: z.coerce.number().int().min(30).max(180).default(90),
  coachingCue: z.string().optional().default('Controlled cadence with strict form.'),
});

const aiWorkoutDaySchema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  name: z.string(),
  isRestDay: z.boolean(),
  focus: z.string().optional().default('Hypertrophy & Kinetic Overload'),
  exercises: z.array(aiWorkoutExerciseSchema).default([]),
});

export const aiGeneratedRoutineSchema = z.object({
  routineName: z.string().default('Gymshark Biomechanical Split'),
  targetGoal: z.string().default('Muscle Hypertrophy'),
  reasoning: z.string().default('Periodized progression mapped to biometric profile.'),
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
          select: {
            role: true,
            muscle: { select: { name: true } },
          },
        },
      },
      take: 60,
    });

    if (catalog.length === 0) {
      throw new Error('Database exercise catalog is empty. Run seed first.');
    }

    const formattedCatalog = catalog.map((c) => ({
      id: c.id,
      name: c.name,
      eq: c.equipment?.name || 'Bodyweight',
      primaryMuscle: c.muscles.find((m) => m.role === 'PRIMARY')?.muscle.name || 'General',
    }));

    const apiKey = process.env.GEMINI_API_KEY;
    const heightM = (params.heightCm || 170) / 100;
    const weight = params.weightKg || 79;
    const bmi = (weight / (heightM * heightM)).toFixed(1);
    const requestedDays = Math.min(6, Math.max(2, Number(params.daysPerWeek) || 4));

    // DYNAMIC LAYOUT TEMPLATES STRICTLY CONTROLLED BY requestedDays:
    const splitTemplates: Record<number, { day: typeof ALL_DAYS[number]; name: string; focus: string; isRest: boolean; type: 'PUSH' | 'PULL' | 'LEGS' | 'UPPER' | 'LOWER' | 'FULL' | 'REST' }[]> = {
      // 4-DAY: Upper A / Lower A / Upper B / Lower B
      4: [
        { day: 'MONDAY', name: 'Upper Body A', focus: 'Chest, Back & Shoulders', isRest: false, type: 'UPPER' },
        { day: 'TUESDAY', name: 'Lower Body A', focus: 'Quads, Hamstrings & Calves', isRest: false, type: 'LOWER' },
        { day: 'WEDNESDAY', name: 'Rest & Recovery', focus: 'Active restoration and mobility', isRest: true, type: 'REST' },
        { day: 'THURSDAY', name: 'Upper Body B', focus: 'Chest, Back & Arms', isRest: false, type: 'UPPER' },
        { day: 'FRIDAY', name: 'Lower Body B', focus: 'Glutes, Hamstrings & Calves', isRest: false, type: 'LOWER' },
        { day: 'SATURDAY', name: 'Rest & Recovery', focus: 'CNS Recovery & Synthesis', isRest: true, type: 'REST' },
        { day: 'SUNDAY', name: 'Rest & Recovery', focus: 'CNS Recovery & Synthesis', isRest: true, type: 'REST' },
      ],

      // 5-DAY: Upper / Lower / Push / Pull / Legs
      5: [
        { day: 'MONDAY', name: 'Upper Body Strength', focus: 'Chest, Back & Shoulders', isRest: false, type: 'UPPER' },
        { day: 'TUESDAY', name: 'Lower Body Strength', focus: 'Quads, Hamstrings & Calves', isRest: false, type: 'LOWER' },
        { day: 'WEDNESDAY', name: 'Rest & Recovery', focus: 'Rest Day', isRest: true, type: 'REST' },
        { day: 'THURSDAY', name: 'Push Hypertrophy', focus: 'Chest, Delts & Triceps', isRest: false, type: 'PUSH' },
        { day: 'FRIDAY', name: 'Pull Hypertrophy', focus: 'Lats, Upper Back & Biceps', isRest: false, type: 'PULL' },
        { day: 'SATURDAY', name: 'Legs & Core Hypertrophy', focus: 'Quads, Hamstrings & Abs', isRest: false, type: 'LEGS' },
        { day: 'SUNDAY', name: 'Rest & Recovery', focus: 'Rest Day', isRest: true, type: 'REST' },
      ],

      // 6-DAY: Push / Pull / Legs (Twice)
      6: [
        { day: 'MONDAY', name: 'Push Day 1 (Chest Dominant)', focus: 'Chest, Shoulders & Triceps', isRest: false, type: 'PUSH' },
        { day: 'TUESDAY', name: 'Pull Day 1 (Lat & Width Focus)', focus: 'Lats, Upper Back & Biceps', isRest: false, type: 'PULL' },
        { day: 'WEDNESDAY', name: 'Leg Day 1 (Quad Dominant)', focus: 'Quads, Hamstrings & Calves', isRest: false, type: 'LEGS' },
        { day: 'THURSDAY', name: 'Push Day 2 (Shoulder Focus)', focus: 'Upper Chest, Delts & Triceps', isRest: false, type: 'PUSH' },
        { day: 'FRIDAY', name: 'Pull Day 2 (Thickness Focus)', focus: 'Mid Back, Rear Delts & Biceps', isRest: false, type: 'PULL' },
        { day: 'SATURDAY', name: 'Leg Day 2 (Posterior Chain & Core)', focus: 'Hamstrings, Glutes & Abs', isRest: false, type: 'LEGS' },
        { day: 'SUNDAY', name: 'Rest & Recovery', focus: 'CNS Recovery & Synthesis', isRest: true, type: 'REST' },
      ],

      // 3-DAY: Full Body A / B / C
      3: [
        { day: 'MONDAY', name: 'Full Body A', focus: 'Chest, Quads & Back', isRest: false, type: 'FULL' },
        { day: 'TUESDAY', name: 'Rest & Recovery', focus: 'Rest Day', isRest: true, type: 'REST' },
        { day: 'WEDNESDAY', name: 'Full Body B', focus: 'Hamstrings, Shoulders & Arms', isRest: false, type: 'FULL' },
        { day: 'THURSDAY', name: 'Rest & Recovery', focus: 'Rest Day', isRest: true, type: 'REST' },
        { day: 'FRIDAY', name: 'Full Body C', focus: 'Back, Quads & Core', isRest: false, type: 'FULL' },
        { day: 'SATURDAY', name: 'Rest & Recovery', focus: 'Rest Day', isRest: true, type: 'REST' },
        { day: 'SUNDAY', name: 'Rest & Recovery', focus: 'Rest Day', isRest: true, type: 'REST' },
      ],

      // 2-DAY: Upper / Lower
      2: [
        { day: 'MONDAY', name: 'Upper Body Foundation', focus: 'Chest, Back, Shoulders & Arms', isRest: false, type: 'UPPER' },
        { day: 'TUESDAY', name: 'Rest & Recovery', focus: 'Rest Day', isRest: true, type: 'REST' },
        { day: 'WEDNESDAY', name: 'Rest & Recovery', focus: 'Rest Day', isRest: true, type: 'REST' },
        { day: 'THURSDAY', name: 'Lower Body Foundation', focus: 'Quads, Hamstrings, Glutes & Abs', isRest: false, type: 'LOWER' },
        { day: 'FRIDAY', name: 'Rest & Recovery', focus: 'Rest Day', isRest: true, type: 'REST' },
        { day: 'SATURDAY', name: 'Rest & Recovery', focus: 'Rest Day', isRest: true, type: 'REST' },
        { day: 'SUNDAY', name: 'Rest & Recovery', focus: 'Rest Day', isRest: true, type: 'REST' },
      ],
    };

    const dayLayout = splitTemplates[requestedDays] || splitTemplates[4];

    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY missing. Using algorithmic split.');
      return this.generateGymsharkAlgorithmicSplit(params, formattedCatalog, dayLayout);
    }

    try {
      console.log(`🚀 [AI Engine] Dispatching request to Google Gemini API (Weight: ${weight}kg, Days: ${requestedDays})...`);

      const prompt = `You are an elite bodybuilding coach from Gymshark / Hevy.
Output RAW JSON ONLY strictly following the schedule provided.

ATHLETE BIOMETRICS:
- Bodyweight: ${weight} kg
- Height: ${params.heightCm} cm (BMI: ${bmi})
- Experience: ${params.experienceLevel}
- Target Goal: ${params.goal}
- Session Length: ${params.durationMinutes} mins

CRITICAL SCHEDULE (EXACTLY ${requestedDays} ACTIVE DAYS REQUIRED):
${JSON.stringify(dayLayout)}

RULES:
1. Days where "isRest": false MUST HAVE 5 to 6 exercises each matching that day's focus.
2. Days where "isRest": true MUST HAVE "exercises": [].
3. For Upper body days: Include 2 Chest, 2 Back, 1 Shoulder, 1 Arm movement.
4. For Lower body days: Include 2 Quads (Squats/Leg Press), 2 Hamstrings (RDL/Leg Curl), 1 Calves, 1 Abs.
5. Prescribe realistic starting weights (targetWeightKg) in kg. Pick exercises ONLY from this catalog:
${JSON.stringify(formattedCatalog)}

JSON OUTPUT SCHEMA:
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
          "sets": number (3-4),
          "repsMin": number (8-10),
          "repsMax": number (10-12),
          "targetWeightKg": number,
          "restSeconds": number (60-90),
          "coachingCue": string
        }
      ]
    }
  ]
}`;

      // Working official Gemini 2.5 Flash REST endpoint
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey.trim()}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.15,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('❌ Gemini API error:', err);
        return this.generateGymsharkAlgorithmicSplit(params, formattedCatalog, dayLayout);
      }

      const json = await response.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini');

      const parsedData = JSON.parse(text);
      const validated = aiGeneratedRoutineSchema.parse(parsedData);

      // Verify every day follows the dynamic template
      const dayMap = new Map(validated.days.map((d) => [d.dayOfWeek, d]));
      const fullSevenDays = dayLayout.map((skDay) => {
        const generatedDay = dayMap.get(skDay.day);

        if (!skDay.isRest && (!generatedDay || generatedDay.isRestDay || generatedDay.exercises.length < 4)) {
          return this.buildSpecificGymsharkDay(skDay, formattedCatalog, weight);
        }

        return (
          generatedDay || {
            dayOfWeek: skDay.day,
            name: skDay.name,
            isRestDay: skDay.isRest,
            focus: skDay.focus,
            exercises: [],
          }
        );
      });

      validated.days = fullSevenDays;

      // Validate catalog IDs to avoid hallucinations
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
      console.error('❌ [Gemini Generation Exception]:', err.message || err);
      return this.generateGymsharkAlgorithmicSplit(params, formattedCatalog, dayLayout);
    }
  }

  // Purely dynamic day builder based on day.type (PUSH, PULL, LEGS, UPPER, LOWER, FULL)
  private static buildSpecificGymsharkDay(skDay: any, catalog: any[], bw: number) {
    const findExercise = (keywords: string[]) => {
      return (
        catalog.find((c) =>
          keywords.some(
            (k) =>
              c.name.toLowerCase().includes(k.toLowerCase()) ||
              c.primaryMuscle.toLowerCase().includes(k.toLowerCase())
          )
        ) || catalog[0]
      );
    };

    let templates: { keywords: string[]; targetWeightKg: number; cue: string }[] = [];

    if (skDay.type === 'PUSH') {
      templates = [
        { keywords: ['Flat Barbell Bench', 'Machine Chest Press', 'Chest Press'], targetWeightKg: Math.round((bw * 0.55) / 2.5) * 2.5, cue: 'Retract scapulae and press.' },
        { keywords: ['Incline Dumbbell Press', 'Incline Barbell'], targetWeightKg: Math.round((bw * 0.45) / 2.5) * 2.5, cue: 'Elbows at 45° to load clavicular head.' },
        { keywords: ['Barbell Overhead Press', 'Dumbbell Shoulder Press'], targetWeightKg: Math.round((bw * 0.35) / 2.5) * 2.5, cue: 'Braced core overhead press.' },
        { keywords: ['Dumbbell Lateral Raise', 'Cable Lateral Raise'], targetWeightKg: 8, cue: 'Lead with elbows, 2-sec eccentric.' },
        { keywords: ['Cable Triceps Pushdown', 'Overhead Cable Triceps'], targetWeightKg: 15, cue: 'Elbows pinned to sides, full lockout.' },
      ];
    } else if (skDay.type === 'PULL') {
      templates = [
        { keywords: ['Lat Pulldown', 'Pull-Up'], targetWeightKg: Math.round((bw * 0.5) / 2.5) * 2.5, cue: 'Drive elbows down into back pockets.' },
        { keywords: ['Bent Over Barbell Row', 'Seated Cable Row'], targetWeightKg: Math.round((bw * 0.5) / 2.5) * 2.5, cue: 'Pull to belly button with neutral back.' },
        { keywords: ['Chest Supported Dumbbell Row', 'Barbell Row'], targetWeightKg: Math.round((bw * 0.45) / 2.5) * 2.5, cue: '1-sec squeeze in full retraction.' },
        { keywords: ['Face Pull', 'Reverse Dumbbell Fly'], targetWeightKg: 12.5, cue: 'High pull with external rotation.' },
        { keywords: ['Hammer Curl'], targetWeightKg: 12, cue: 'Neutral grip targeting brachialis.' },
        { keywords: ['Incline Dumbbell Curl', 'Preacher Curl'], targetWeightKg: 10, cue: 'Strict biceps isolation without swinging.' },
      ];
    } else if (skDay.type === 'LEGS' || skDay.type === 'LOWER') {
      templates = [
        { keywords: ['Barbell Back Squat', 'Leg Press'], targetWeightKg: Math.round((bw * 0.65) / 2.5) * 2.5, cue: 'Deep hip hinge, knees tracking toes.' },
        { keywords: ['Barbell Romanian Deadlift', 'Lying Leg Curl'], targetWeightKg: Math.round((bw * 0.6) / 2.5) * 2.5, cue: 'Hinge at hips, stretch hamstrings.' },
        { keywords: ['Dumbbell Walking Lunge', 'Dumbbell Bulgarian'], targetWeightKg: 14, cue: 'Upright torso, drive through front heel.' },
        { keywords: ['Lying Leg Curl', 'Hamstring'], targetWeightKg: 30, cue: 'Controlled knee flexion.' },
        { keywords: ['Standing Calf Raise', 'Seated Calf Raise'], targetWeightKg: 35, cue: 'Full stretch at bottom, squeeze at peak.' },
        { keywords: ['Cable Crunch', 'Hanging Leg Raise'], targetWeightKg: 0, cue: 'Posterior pelvic tilt, curl pelvis.' },
      ];
    } else if (skDay.type === 'UPPER') {
      templates = [
        { keywords: ['Flat Barbell Bench', 'Machine Chest Press'], targetWeightKg: Math.round((bw * 0.55) / 2.5) * 2.5, cue: 'Retract scapulae and press.' },
        { keywords: ['Lat Pulldown', 'Pull-Up'], targetWeightKg: Math.round((bw * 0.5) / 2.5) * 2.5, cue: 'Drive elbows down into pockets.' },
        { keywords: ['Incline Dumbbell Press'], targetWeightKg: Math.round((bw * 0.45) / 2.5) * 2.5, cue: 'Upper chest pressing at 45°.' },
        { keywords: ['Bent Over Barbell Row', 'Seated Cable Row'], targetWeightKg: Math.round((bw * 0.5) / 2.5) * 2.5, cue: 'Pull to navel with flat back.' },
        { keywords: ['Dumbbell Lateral Raise'], targetWeightKg: 8, cue: 'Strict lateral raise for side delts.' },
        { keywords: ['Hammer Curl', 'Cable Triceps Pushdown'], targetWeightKg: 12, cue: 'Control arms cadence.' },
      ];
    } else {
      // FULL BODY
      templates = [
        { keywords: ['Barbell Back Squat', 'Leg Press'], targetWeightKg: Math.round((bw * 0.6) / 2.5) * 2.5, cue: 'Squat depth with chest up.' },
        { keywords: ['Flat Barbell Bench'], targetWeightKg: Math.round((bw * 0.5) / 2.5) * 2.5, cue: 'Horizontal push.' },
        { keywords: ['Lat Pulldown', 'Pull-Up'], targetWeightKg: Math.round((bw * 0.5) / 2.5) * 2.5, cue: 'Vertical pull.' },
        { keywords: ['Barbell Romanian Deadlift'], targetWeightKg: Math.round((bw * 0.55) / 2.5) * 2.5, cue: 'Posterior chain hinge.' },
        { keywords: ['Dumbbell Lateral Raise'], targetWeightKg: 8, cue: 'Side delt raise.' },
      ];
    }

    const exercises = templates.map((t) => {
      const match = findExercise(t.keywords);
      return {
        exerciseId: match.id,
        exerciseName: match.name,
        targetMuscle: match.primaryMuscle,
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        targetWeightKg: t.targetWeightKg,
        restSeconds: 90,
        coachingCue: t.cue,
      };
    });

    return {
      dayOfWeek: skDay.day,
      name: skDay.name,
      isRestDay: false,
      focus: skDay.focus,
      exercises,
    };
  }

  private static generateGymsharkAlgorithmicSplit(params: any, catalog: any[], dayLayout: any[]): AIGeneratedRoutine {
    const bw = params.weightKg || 79;
    const requested = Math.min(6, Math.max(2, Number(params.daysPerWeek) || 4));

    const fullDays = dayLayout.map((sk) => {
      if (sk.isRest) {
        return {
          dayOfWeek: sk.day,
          name: sk.name,
          isRestDay: true,
          focus: sk.focus,
          exercises: [],
        };
      }
      return this.buildSpecificGymsharkDay(sk, catalog, bw);
    });

    return {
      routineName: `Gymshark Biomechanical ${requested}-Day Split`,
      targetGoal: params.goal,
      reasoning: `Structured ${requested}-day progressive overload volume distribution for a ${bw}kg lifter.`,
      days: fullDays,
    };
  }
}