import type { Exercise } from "../types/exercise.types";

export const EXERCISE_DATA: Exercise[] = [
  {
    id: 'ex_1',
    name: 'Barbell Flat Bench Press',
    slug: 'barbell-bench-press',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Anterior Deltoid'],
    equipment: 'Barbell & Bench',
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultReps: '8-12',
    restSeconds: 90,
    caloriesBurnEstimate: '120 - 160 kcal',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Lie flat on the bench with eyes positioned directly beneath the barbell.',
      'Grip the bar slightly wider than shoulder-width with wrists stacked above elbows.',
      'Unrack the bar, inhale, and lower it steadily toward your mid-chest line.',
      'Drive your feet into the floor and press up forcefully until arms lock out.'
    ],
    commonMistakes: [
      'Bouncing the bar off the rib cage instead of controlling eccentric phase.',
      'Flaring elbows outward at a 90-degree angle, causing shoulder impingement.'
    ]
  },
  {
    id: 'ex_2',
    name: 'Incline Dumbbell Press',
    slug: 'incline-dumbbell-press',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Front Delts', 'Triceps'],
    equipment: 'Dumbbells & Incline Bench',
    difficulty: 'Intermediate',
    defaultSets: 3,
    defaultReps: '10-12',
    restSeconds: 75,
    caloriesBurnEstimate: '100 - 140 kcal',
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Set the adjustable bench to a 30-45 degree incline.',
      'Kick dumbbells to shoulder height and brace core with chest proud.',
      'Press the weights vertically without clinking them together at the apex.'
    ],
    commonMistakes: [
      'Setting incline too steep (>45 deg), shifting tension entirely to shoulders.'
    ]
  },
  {
    id: 'ex_3',
    name: 'Barbell Bent-Over Row',
    slug: 'barbell-bent-over-row',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Rear Delts', 'Erector Spinae'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultReps: '8-10',
    restSeconds: 90,
    caloriesBurnEstimate: '140 - 180 kcal',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Hinge at hips with knees softly bent and torso around 45 degrees.',
      'Pull barbell towards belly button by driving elbows straight back.'
    ],
    commonMistakes: [
      'Rounding the lower back under heavy load.',
      'Using body momentum to jerk the bar up.'
    ]
  },
  {
    id: 'ex_4',
    name: 'Barbell Back Squat',
    slug: 'barbell-back-squat',
    primaryMuscle: 'Quads',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Lower Back'],
    equipment: 'Squat Rack & Barbell',
    difficulty: 'Advanced',
    defaultSets: 4,
    defaultReps: '6-8',
    restSeconds: 120,
    caloriesBurnEstimate: '180 - 240 kcal',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    instructions: [
      'Place barbell across upper traps, brace core firmly with Valsalva maneuver.',
      'Squat down by hinging hips back and bending knees until hip crease dips below knees.'
    ],
    commonMistakes: [
      'Knees collapsing inward during ascent.',
      'Heels lifting off the ground.'
    ]
  }
];

// mock data hai ye