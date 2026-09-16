import {
  Role,
  Gender,
  FitnessLevel,
  MuscleRole,
} from '../src/generated/prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../src/config/database';

async function main() {
  console.log('🌱 Starting FitForge database seeding...');

  // -------------------------------------------------------------
  // 1. PASSWORD HASH
  // -------------------------------------------------------------

  const passwordHash = await bcrypt.hash('FitForge@123', 10);

  // -------------------------------------------------------------
  // 2. USERS
  // -------------------------------------------------------------

  console.log('👤 Seeding users...');

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@fitforge.com',
    },
    update: {
      fullName: 'FitForge Administrator',
    },
    create: {
      email: 'admin@fitforge.com',
      passwordHash,
      fullName: 'FitForge Administrator',
      role: Role.ADMIN,

      profile: {
        create: {
          fitnessLevel: FitnessLevel.ADVANCED,
          primaryGoal: 'Maintain Platform & Coach Athletes',
        },
      },
    },
  });

  const demoUser = await prisma.user.upsert({
    where: {
      email: 'user@fitforge.com',
    },
    update: {
      fullName: 'Rahul Sharma',
    },
    create: {
      email: 'user@fitforge.com',
      passwordHash,
      fullName: 'Rahul Sharma',
      role: Role.USER,

      profile: {
        create: {
          gender: Gender.MALE,
          age: 25,
          heightCm: 178,
          weightKg: 74.5,
          fitnessLevel: FitnessLevel.INTERMEDIATE,
          primaryGoal: 'Hypertrophy / Muscle Gain',
        },
      },
    },
  });

  console.log(`✅ Admin: ${admin.email}`);
  console.log(`✅ Demo user: ${demoUser.email}`);

  // -------------------------------------------------------------
  // 3. MUSCLE GROUPS
  // -------------------------------------------------------------

  console.log('💪 Seeding muscle anatomy...');

  const muscleGroups = {
    chest: await prisma.muscleGroup.upsert({
      where: { slug: 'chest' },
      update: {},
      create: {
        name: 'Chest',
        slug: 'chest',
      },
    }),

    back: await prisma.muscleGroup.upsert({
      where: { slug: 'back' },
      update: {},
      create: {
        name: 'Back',
        slug: 'back',
      },
    }),

    arms: await prisma.muscleGroup.upsert({
      where: { slug: 'arms' },
      update: {},
      create: {
        name: 'Arms',
        slug: 'arms',
      },
    }),

    shoulders: await prisma.muscleGroup.upsert({
      where: { slug: 'shoulders' },
      update: {},
      create: {
        name: 'Shoulders',
        slug: 'shoulders',
      },
    }),

    legs: await prisma.muscleGroup.upsert({
      where: { slug: 'legs' },
      update: {},
      create: {
        name: 'Legs',
        slug: 'legs',
      },
    }),
  };

  // -------------------------------------------------------------
  // 4. MUSCLES
  // -------------------------------------------------------------

  const muscles = {
    pecMajor: await prisma.muscle.upsert({
      where: { slug: 'pectoralis-major' },
      update: {},
      create: {
        name: 'Pectoralis Major',
        slug: 'pectoralis-major',
        muscleGroupId: muscleGroups.chest.id,
      },
    }),

    upperChest: await prisma.muscle.upsert({
      where: { slug: 'clavicular-head' },
      update: {},
      create: {
        name: 'Upper Chest',
        slug: 'clavicular-head',
        muscleGroupId: muscleGroups.chest.id,
      },
    }),

    lats: await prisma.muscle.upsert({
      where: { slug: 'latissimus-dorsi' },
      update: {},
      create: {
        name: 'Latissimus Dorsi',
        slug: 'latissimus-dorsi',
        muscleGroupId: muscleGroups.back.id,
      },
    }),

    rhomboids: await prisma.muscle.upsert({
      where: { slug: 'rhomboids' },
      update: {},
      create: {
        name: 'Rhomboids & Traps',
        slug: 'rhomboids',
        muscleGroupId: muscleGroups.back.id,
      },
    }),

    frontDelt: await prisma.muscle.upsert({
      where: { slug: 'anterior-deltoid' },
      update: {},
      create: {
        name: 'Anterior Deltoid',
        slug: 'anterior-deltoid',
        muscleGroupId: muscleGroups.shoulders.id,
      },
    }),

    sideDelt: await prisma.muscle.upsert({
      where: { slug: 'lateral-deltoid' },
      update: {},
      create: {
        name: 'Lateral Deltoid',
        slug: 'lateral-deltoid',
        muscleGroupId: muscleGroups.shoulders.id,
      },
    }),

    triceps: await prisma.muscle.upsert({
      where: { slug: 'triceps-brachii' },
      update: {},
      create: {
        name: 'Triceps Brachii',
        slug: 'triceps-brachii',
        muscleGroupId: muscleGroups.arms.id,
      },
    }),

    biceps: await prisma.muscle.upsert({
      where: { slug: 'biceps-brachii' },
      update: {},
      create: {
        name: 'Biceps Brachii',
        slug: 'biceps-brachii',
        muscleGroupId: muscleGroups.arms.id,
      },
    }),

    quads: await prisma.muscle.upsert({
      where: { slug: 'quadriceps' },
      update: {},
      create: {
        name: 'Quadriceps',
        slug: 'quadriceps',
        muscleGroupId: muscleGroups.legs.id,
      },
    }),

    hamstrings: await prisma.muscle.upsert({
      where: { slug: 'hamstrings' },
      update: {},
      create: {
        name: 'Hamstrings',
        slug: 'hamstrings',
        muscleGroupId: muscleGroups.legs.id,
      },
    }),
  };

  // -------------------------------------------------------------
  // 5. EQUIPMENT
  // -------------------------------------------------------------

  console.log('🏋️ Seeding equipment...');

  const equipment = {
    barbell: await prisma.equipment.upsert({
      where: { name: 'Barbell' },
      update: {},
      create: {
        name: 'Barbell',
      },
    }),

    dumbbell: await prisma.equipment.upsert({
      where: { name: 'Dumbbells' },
      update: {},
      create: {
        name: 'Dumbbells',
      },
    }),

    cable: await prisma.equipment.upsert({
      where: { name: 'Cable Machine' },
      update: {},
      create: {
        name: 'Cable Machine',
      },
    }),

    bodyweight: await prisma.equipment.upsert({
      where: { name: 'Bodyweight' },
      update: {},
      create: {
        name: 'Bodyweight',
      },
    }),
  };

  // -------------------------------------------------------------
  // 6. EXERCISE CATALOG
  // -------------------------------------------------------------

  console.log('📖 Seeding exercise library...');

  const benchPress = await prisma.exercise.upsert({
    where: { slug: 'barbell-bench-press' },
    update: {},
    create: {
      name: 'Barbell Flat Bench Press',
      slug: 'barbell-bench-press',
      description:
        'The foundation compound exercise for overall chest hypertrophy and pressing power.',
      difficulty: FitnessLevel.INTERMEDIATE,
      equipmentId: equipment.barbell.id,
      defaultSets: 4,
      repsMin: 8,
      repsMax: 12,
      restSeconds: 90,

      instructions: [
        'Lie flat on the bench with eyes under the racked barbell.',
        'Retract your scapula and grip slightly wider than shoulder width.',
        'Lower the bar under control to touch the mid-sternum.',
        'Press upward driven by leg drive and chest contraction until full lockout.',
      ],

      commonMistakes: [
        'Bouncing the barbell off the chest cage.',
        'Elbows flaring directly outward at a 90-degree angle causing shoulder impingement.',
      ],

      imageUrl:
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',

      muscles: {
        create: [
          {
            muscleId: muscles.pecMajor.id,
            role: MuscleRole.PRIMARY,
          },
          {
            muscleId: muscles.triceps.id,
            role: MuscleRole.SECONDARY,
          },
          {
            muscleId: muscles.frontDelt.id,
            role: MuscleRole.SECONDARY,
          },
        ],
      },
    },
  });

  const inclinePress = await prisma.exercise.upsert({
    where: { slug: 'incline-dumbbell-press' },
    update: {},
    create: {
      name: 'Incline Dumbbell Press',
      slug: 'incline-dumbbell-press',
      description:
        'Targets the upper clavicular head of the pectorals with free range of motion.',
      difficulty: FitnessLevel.INTERMEDIATE,
      equipmentId: equipment.dumbbell.id,
      defaultSets: 3,
      repsMin: 10,
      repsMax: 12,
      restSeconds: 75,

      instructions: [
        'Adjust the incline bench to roughly 30-45 degrees.',
        'Kick the dumbbells up to shoulder height and plant your feet firmly.',
        'Press the dumbbells upwards in a slight converging arc without clinking them together.',
        'Lower slowly until you feel a deep stretch in the upper pectorals.',
      ],

      commonMistakes: [
        'Setting the incline bench too steep (>45 deg) shifting load entirely onto shoulders.',
      ],

      imageUrl:
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',

      muscles: {
        create: [
          {
            muscleId: muscles.upperChest.id,
            role: MuscleRole.PRIMARY,
          },
          {
            muscleId: muscles.frontDelt.id,
            role: MuscleRole.SECONDARY,
          },
          {
            muscleId: muscles.triceps.id,
            role: MuscleRole.SECONDARY,
          },
        ],
      },
    },
  });

  const bentRow = await prisma.exercise.upsert({
    where: { slug: 'barbell-bent-over-row' },
    update: {},
    create: {
      name: 'Barbell Bent-Over Row',
      slug: 'barbell-bent-over-row',
      description: 'Mass builder for upper and mid-back density.',
      difficulty: FitnessLevel.INTERMEDIATE,
      equipmentId: equipment.barbell.id,
      defaultSets: 4,
      repsMin: 8,
      repsMax: 10,
      restSeconds: 90,

      instructions: [
        'Hinge at the hips keeping lower back neutral and chest slightly up.',
        'Grip barbell overhand, pull bar towards belly button driving elbows backwards.',
        'Squeeze your lats and rhomboids at the apex before returning down with control.',
      ],

      commonMistakes: [
        'Rounding the lumbar spine.',
        'Jerking the torso upward using momentum.',
      ],

      imageUrl:
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',

      muscles: {
        create: [
          {
            muscleId: muscles.lats.id,
            role: MuscleRole.PRIMARY,
          },
          {
            muscleId: muscles.rhomboids.id,
            role: MuscleRole.PRIMARY,
          },
          {
            muscleId: muscles.biceps.id,
            role: MuscleRole.SECONDARY,
          },
        ],
      },
    },
  });

  const squat = await prisma.exercise.upsert({
    where: { slug: 'barbell-back-squat' },
    update: {},
    create: {
      name: 'Barbell Back Squat',
      slug: 'barbell-back-squat',
      description:
        'The premier compound exercise for total lower body volume and quad thickness.',
      difficulty: FitnessLevel.ADVANCED,
      equipmentId: equipment.barbell.id,
      defaultSets: 4,
      repsMin: 6,
      repsMax: 8,
      restSeconds: 120,

      instructions: [
        'Rest barbell on upper traps, grip firmly and unrack.',
        'Hinge hips backwards and descend until hip crease passes parallel to knees.',
        'Drive through mid-foot to stand up powerfully while keeping chest upright.',
      ],

      commonMistakes: [
        'Valgus knee collapse (knees caving inward during ascent).',
        'Heels rising off the platform.',
      ],

      imageUrl:
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',

      muscles: {
        create: [
          {
            muscleId: muscles.quads.id,
            role: MuscleRole.PRIMARY,
          },
          {
            muscleId: muscles.hamstrings.id,
            role: MuscleRole.SECONDARY,
          },
        ],
      },
    },
  });

  const lateralRaise = await prisma.exercise.upsert({
    where: { slug: 'dumbbell-lateral-raise' },
    update: {},
    create: {
      name: 'Dumbbell Lateral Raise',
      slug: 'dumbbell-lateral-raise',
      description:
        'Isolation exercise targeting side delts for creating the V-taper shoulder width.',
      difficulty: FitnessLevel.BEGINNER,
      equipmentId: equipment.dumbbell.id,
      defaultSets: 4,
      repsMin: 12,
      repsMax: 15,
      restSeconds: 60,

      instructions: [
        'Stand tall with dumbbells resting by your sides.',
        'Raise arms outward in the scapular plane with elbows leading until parallel with floor.',
        'Pause momentarily and lower under steady 2-second eccentric control.',
      ],

      commonMistakes: [
        'Shrugging traps to heave the weight up.',
        'Swinging hips back and forth.',
      ],

      imageUrl:
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',

      muscles: {
        create: [
          {
            muscleId: muscles.sideDelt.id,
            role: MuscleRole.PRIMARY,
          },
          {
            muscleId: muscles.rhomboids.id,
            role: MuscleRole.SECONDARY,
          },
        ],
      },
    },
  });

  // -------------------------------------------------------------
  // 7. FOOD CATALOG
  // -------------------------------------------------------------

  console.log('🥗 Seeding food catalog...');

  const foodData = [
    {
      name: 'Chicken Breast (Boneless / Skinless Raw)',
      slug: 'chicken-breast-raw',
      servingAmount: 100,
      servingUnit: 'g',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Rolled Oats (Raw)',
      slug: 'rolled-oats-raw',
      servingAmount: 100,
      servingUnit: 'g',
      calories: 389,
      protein: 16.9,
      carbs: 66.3,
      fat: 6.9,
      fiber: 10.6,
      imageUrl:
        'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Whole Eggs (Standard Size)',
      slug: 'whole-eggs',
      servingAmount: 100,
      servingUnit: 'g',
      calories: 143,
      protein: 12.6,
      carbs: 0.7,
      fat: 9.5,
      fiber: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'White Basmati Rice (Cooked)',
      slug: 'white-basmati-rice-cooked',
      servingAmount: 100,
      servingUnit: 'g',
      calories: 130,
      protein: 2.7,
      carbs: 28.2,
      fat: 0.3,
      fiber: 0.4,
      imageUrl:
        'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Paneer / Indian Cottage Cheese (Low Fat)',
      slug: 'paneer-low-fat',
      servingAmount: 100,
      servingUnit: 'g',
      calories: 180,
      protein: 18,
      carbs: 4,
      fat: 10,
      fiber: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Whey Protein Isolate',
      slug: 'whey-protein-isolate',
      servingAmount: 30,
      servingUnit: 'g',
      calories: 120,
      protein: 26,
      carbs: 1.5,
      fat: 0.8,
      fiber: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Peanut Butter (Natural Pure)',
      slug: 'peanut-butter-natural',
      servingAmount: 32,
      servingUnit: 'g',
      calories: 190,
      protein: 8,
      carbs: 7,
      fat: 16,
      fiber: 2,
      imageUrl:
        'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Banana (Fresh Medium)',
      slug: 'banana-medium',
      servingAmount: 118,
      servingUnit: 'g',
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.3,
      fiber: 3.1,
      imageUrl:
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const food of foodData) {
    await prisma.food.upsert({
      where: {
        slug: food.slug,
      },
      update: {},
      create: food,
    });
  }

  // -------------------------------------------------------------
  // 8. TEMPLATE WORKOUT PLAN
  // -------------------------------------------------------------

  console.log('📋 Seeding template workout split...');

  const existingPlan = await prisma.workoutPlan.findUnique({
    where: {
      slug: 'hypertrophy-4-day-split',
    },
  });

  let templatePlan;

  if (!existingPlan) {
    templatePlan = await prisma.workoutPlan.create({
      data: {
        title: 'Hypertrophy 4-Day Push & Pull Split',
        slug: 'hypertrophy-4-day-split',
        goal: 'Muscle Growth',
        level: FitnessLevel.INTERMEDIATE,
        daysPerWeek: 4,
        description:
          'Ideal progressive split designed to stimulate muscular hypertrophy twice every 8-9 days.',
        isTemplate: true,

        days: {
          create: [
            {
              dayNumber: 1,
              name: 'Push Day A (Chest & Delts)',
              isRestDay: false,
              exercises: {
                create: [
                  {
                    exerciseId: benchPress.id,
                    order: 1,
                    sets: 4,
                    repsMin: 8,
                    repsMax: 12,
                    restSeconds: 90,
                  },
                  {
                    exerciseId: inclinePress.id,
                    order: 2,
                    sets: 3,
                    repsMin: 10,
                    repsMax: 12,
                    restSeconds: 75,
                  },
                  {
                    exerciseId: lateralRaise.id,
                    order: 3,
                    sets: 4,
                    repsMin: 12,
                    repsMax: 15,
                    restSeconds: 60,
                  },
                ],
              },
            },
            {
              dayNumber: 2,
              name: 'Pull Day A (Back & Biceps)',
              isRestDay: false,
              exercises: {
                create: [
                  {
                    exerciseId: bentRow.id,
                    order: 1,
                    sets: 4,
                    repsMin: 8,
                    repsMax: 10,
                    restSeconds: 90,
                  },
                ],
              },
            },
            {
              dayNumber: 3,
              name: 'Active Rest / Recovery',
              isRestDay: true,
            },
            {
              dayNumber: 4,
              name: 'Leg Day Blast (Quads & Hams)',
              isRestDay: false,
              exercises: {
                create: [
                  {
                    exerciseId: squat.id,
                    order: 1,
                    sets: 4,
                    repsMin: 6,
                    repsMax: 8,
                    restSeconds: 120,
                  },
                ],
              },
            },
          ],
        },
      },
    });
  } else {
    templatePlan = existingPlan;
  }

  // -------------------------------------------------------------
  // 9. DEMO USER ROUTINE
  // -------------------------------------------------------------

  console.log('🏃 Seeding demo user routine...');

  const existingRoutine = await prisma.routine.findFirst({
    where: {
      userId: demoUser.id,
      name: 'Demo Hypertrophy Routine',
    },
  });

  if (!existingRoutine) {
    await prisma.routine.create({
      data: {
        userId: demoUser.id,
        name: 'Demo Hypertrophy Routine',
        goal: 'Muscle Gain',
        isActive: true,

        days: {
          create: [
            {
              dayOfWeek: 'MONDAY',
              name: 'Push',
              isRestDay: false,

              exercises: {
                create: [
                  {
                    exerciseId: benchPress.id,
                    order: 1,
                    sets: 4,
                    repsMin: 8,
                    repsMax: 12,
                    restSeconds: 90,
                  },
                  {
                    exerciseId: inclinePress.id,
                    order: 2,
                    sets: 3,
                    repsMin: 10,
                    repsMax: 12,
                    restSeconds: 75,
                  },
                  {
                    exerciseId: lateralRaise.id,
                    order: 3,
                    sets: 4,
                    repsMin: 12,
                    repsMax: 15,
                    restSeconds: 60,
                  },
                ],
              },
            },
            {
              dayOfWeek: 'TUESDAY',
              name: 'Pull',
              isRestDay: false,

              exercises: {
                create: [
                  {
                    exerciseId: bentRow.id,
                    order: 1,
                    sets: 4,
                    repsMin: 8,
                    repsMax: 10,
                    restSeconds: 90,
                  },
                ],
              },
            },
            {
              dayOfWeek: 'WEDNESDAY',
              name: 'Recovery',
              isRestDay: true,
            },
            {
              dayOfWeek: 'THURSDAY',
              name: 'Legs',
              isRestDay: false,

              exercises: {
                create: [
                  {
                    exerciseId: squat.id,
                    order: 1,
                    sets: 4,
                    repsMin: 6,
                    repsMax: 8,
                    restSeconds: 120,
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  // -------------------------------------------------------------
  // 10. SUMMARY
  // -------------------------------------------------------------

  console.log('');
  console.log('========================================');
  console.log('✅ FitForge database seed completed!');
  console.log('========================================');
  console.log(`👤 Admin: ${admin.email}`);
  console.log(`👤 Demo User: ${demoUser.email}`);
  console.log(`🏋️ Template Plan: ${templatePlan.title}`);
  console.log('🔑 Demo password: FitForge@123');
  console.log('========================================');
}

main()
  .catch((error) => {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
