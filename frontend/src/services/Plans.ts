import type { PredefinedPlan } from "../types/routine.types";

export const PREDEFINED_PLANS: PredefinedPlan[] = [
  {
    id: 'plan_1',
    title: 'Linear Progression Foundation',
    goal: 'Beginner Strength',
    level: 'Beginner',
    daysPerWeek: 3,
    description: 'Master compound movements with adequate recovery intervals.',
    scheduleSummary: [
      { day: 'Mon', focus: 'Full Body A' },
      { day: 'Tue', focus: 'Rest' },
      { day: 'Wed', focus: 'Full Body B' },
      { day: 'Thu', focus: 'Rest' },
      { day: 'Fri', focus: 'Full Body A' },
      { day: 'Sat', focus: 'Rest' },
      { day: 'Sun', focus: 'Rest' },
    ],
  },
  {
    id: 'plan_2',
    title: 'Hypertrophy 4-Day Push/Pull',
    goal: 'Muscle Gain',
    level: 'Intermediate',
    daysPerWeek: 4,
    description: 'Balanced upper and lower splits designed for maximum muscle fiber recruitment.',
    scheduleSummary: [
      { day: 'Mon', focus: 'Push (Chest/Triceps/Front Delts)' },
      { day: 'Tue', focus: 'Pull (Back/Biceps/Rear Delts)' },
      { day: 'Wed', focus: 'Rest' },
      { day: 'Thu', focus: 'Legs & Core' },
      { day: 'Fri', focus: 'Upper Body Focus' },
      { day: 'Sat', focus: 'Rest' },
      { day: 'Sun', focus: 'Rest' },
    ],
  },
  {
    id: 'plan_3',
    title: 'Metabolic Conditioning Shred',
    goal: 'Fat Loss',
    level: 'All Levels',
    daysPerWeek: 5,
    description: 'High-density resistance sessions coupled with core and metabolic volume.',
    scheduleSummary: [
      { day: 'Mon', focus: 'Full Body Density' },
      { day: 'Tue', focus: 'Cardio Intervals & Abs' },
      { day: 'Wed', focus: 'Upper Body Pump' },
      { day: 'Thu', focus: 'Active Recovery' },
      { day: 'Fri', focus: 'Lower Body Blast' },
      { day: 'Sat', focus: 'Athletic Circuit' },
      { day: 'Sun', focus: 'Rest' },
    ],
  },
];

// mock data hai ye