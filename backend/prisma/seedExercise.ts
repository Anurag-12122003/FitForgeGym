import { prisma } from "../src/config/database";

const Difficulty = {
    INTERMEDIATE: 'INTERMEDIATE',
    BEGINNER: 'BEGINNER',
    ADVANCED: 'ADVANCED'
};

async function main() {
    console.log('🌱 Database seeding shuru ho rahi hai...');

    // 1. Muscles Seed
    const muscleNames = [
        'Chest',
        'Back',
        'Shoulders',
        'Biceps',
        'Triceps',
        'Forearms',
        'Quads',
        'Hamstrings',
        'Calves',
        'Glutes',
        'Abs',
    ];

    const muscleMap = new Map<string, string>();
    for (const name of muscleNames) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Determine muscle group based on the muscle name
        let groupName = 'Upper Body';
        if (['Quads', 'Hamstrings', 'Calves', 'Glutes'].includes(name)) {
            groupName = 'Lower Body';
        } else if (name === 'Abs') {
            groupName = 'Core';
        }

        const groupSlug = groupName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const muscle = await prisma.muscle.upsert({
            where: { name },
            update: {},
            create: { 
                name, 
                slug,
                muscleGroup: {
                    connectOrCreate: {
                        where: { name: groupName },
                        create: { 
                            name: groupName, 
                            slug: groupSlug 
                        }
                    }
                }
            },
        });
        muscleMap.set(name, muscle.id);
    }
    console.log('✅ Muscles synced');

    // 2. Equipments Seed
    const equipmentNames = [
        'Barbell',
        'Dumbbell',
        'Cable',
        'Machine',
        'Bodyweight',
        'Kettlebell',
        'EZ Bar',
    ];

    const equipmentMap = new Map<string, string>();
    for (const name of equipmentNames) {
        const eq = await prisma.equipment.upsert({
            where: { name },
            update: {},
            create: { name },
        });
        equipmentMap.set(name, eq.id);
    }
    console.log('✅ Equipments synced');

    // 3. Comprehensive Exercises Data
    const exerciseData = [
        // --- CHEST ---
        {
            name: 'Barbell Flat Bench Press',
            slug: 'barbell-flat-bench-press',
            difficulty: Difficulty.INTERMEDIATE,
            equipment: 'Barbell',
            primaryMuscle: 'Chest',
            secondaryMuscles: ['Triceps', 'Shoulders'],
            defaultSets: 4,
            repsMin: 8,
            repsMax: 12,
            restSeconds: 90,
            imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Incline Dumbbell Press',
            slug: 'incline-dumbbell-press',
            difficulty: Difficulty.INTERMEDIATE,
            equipment: 'Dumbbell',
            primaryMuscle: 'Chest',
            secondaryMuscles: ['Shoulders', 'Triceps'],
            defaultSets: 3,
            repsMin: 10,
            repsMax: 12,
            restSeconds: 75,
            imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Cable Chest Flyes',
            slug: 'cable-chest-flyes',
            difficulty: Difficulty.BEGINNER,
            equipment: 'Cable',
            primaryMuscle: 'Chest',
            secondaryMuscles: ['Shoulders'],
            defaultSets: 3,
            repsMin: 12,
            repsMax: 15,
            restSeconds: 60,
            imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
        },

        // --- BACK ---
        {
            name: 'Barbell Bent-Over Row',
            slug: 'barbell-bent-over-row',
            difficulty: Difficulty.INTERMEDIATE,
            equipment: 'Barbell',
            primaryMuscle: 'Back',
            secondaryMuscles: ['Biceps', 'Forearms'],
            defaultSets: 4,
            repsMin: 8,
            repsMax: 10,
            restSeconds: 90,
            imageUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Lat Pulldown (Wide Grip)',
            slug: 'lat-pulldown-wide-grip',
            difficulty: Difficulty.BEGINNER,
            equipment: 'Cable',
            primaryMuscle: 'Back',
            secondaryMuscles: ['Biceps'],
            defaultSets: 4,
            repsMin: 10,
            repsMax: 12,
            restSeconds: 75,
            imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Seated Cable Row',
            slug: 'seated-cable-row',
            difficulty: Difficulty.BEGINNER,
            equipment: 'Cable',
            primaryMuscle: 'Back',
            secondaryMuscles: ['Biceps', 'Forearms'],
            defaultSets: 3,
            repsMin: 10,
            repsMax: 12,
            restSeconds: 60,
            imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80',
        },

        // --- SHOULDERS ---
        {
            name: 'Overhead Barbell Military Press',
            slug: 'overhead-barbell-military-press',
            difficulty: Difficulty.ADVANCED,
            equipment: 'Barbell',
            primaryMuscle: 'Shoulders',
            secondaryMuscles: ['Triceps'],
            defaultSets: 4,
            repsMin: 6,
            repsMax: 10,
            restSeconds: 90,
            imageUrl: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Dumbbell Lateral Raise',
            slug: 'dumbbell-lateral-raise',
            difficulty: Difficulty.BEGINNER,
            equipment: 'Dumbbell',
            primaryMuscle: 'Shoulders',
            secondaryMuscles: [],
            defaultSets: 4,
            repsMin: 12,
            repsMax: 15,
            restSeconds: 60,
            imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Face Pulls',
            slug: 'face-pulls',
            difficulty: Difficulty.BEGINNER,
            equipment: 'Cable',
            primaryMuscle: 'Shoulders',
            secondaryMuscles: ['Back'],
            defaultSets: 3,
            repsMin: 15,
            repsMax: 20,
            restSeconds: 60,
            imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
        },

        // --- LEGS (QUADS / HAMSTRINGS / CALVES) ---
        {
            name: 'Barbell Back Squat',
            slug: 'barbell-back-squat',
            difficulty: Difficulty.ADVANCED,
            equipment: 'Barbell',
            primaryMuscle: 'Quads',
            secondaryMuscles: ['Glutes', 'Hamstrings'],
            defaultSets: 4,
            repsMin: 6,
            repsMax: 10,
            restSeconds: 120,
            imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Leg Press (45 Degree)',
            slug: 'leg-press-45-degree',
            difficulty: Difficulty.BEGINNER,
            equipment: 'Machine',
            primaryMuscle: 'Quads',
            secondaryMuscles: ['Glutes'],
            defaultSets: 3,
            repsMin: 10,
            repsMax: 12,
            restSeconds: 90,
            imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Romanian Deadlift (RDL)',
            slug: 'romanian-deadlift-rdl',
            difficulty: Difficulty.INTERMEDIATE,
            equipment: 'Barbell',
            primaryMuscle: 'Hamstrings',
            secondaryMuscles: ['Glutes', 'Back'],
            defaultSets: 4,
            repsMin: 8,
            repsMax: 10,
            restSeconds: 90,
            imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Lying Leg Curls',
            slug: 'lying-leg-curls',
            difficulty: Difficulty.BEGINNER,
            equipment: 'Machine',
            primaryMuscle: 'Hamstrings',
            secondaryMuscles: ['Calves'],
            defaultSets: 3,
            repsMin: 12,
            repsMax: 15,
            restSeconds: 60,
            imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Standing Calf Raises',
            slug: 'standing-calf-raises',
            difficulty: Difficulty.BEGINNER,
            equipment: 'Machine',
            primaryMuscle: 'Calves',
            secondaryMuscles: [],
            defaultSets: 4,
            repsMin: 15,
            repsMax: 20,
            restSeconds: 45,
            imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
        },

        // --- ARMS (BICEPS / TRICEPS) ---
        {
            name: 'Incline Dumbbell Bicep Curl',
            slug: 'incline-dumbbell-bicep-curl',
            difficulty: Difficulty.BEGINNER,
            equipment: 'Dumbbell',
            primaryMuscle: 'Biceps',
            secondaryMuscles: ['Forearms'],
            defaultSets: 3,
            repsMin: 10,
            repsMax: 12,
            restSeconds: 60,
            imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'EZ-Bar Preacher Curl',
            slug: 'ez-bar-preacher-curl',
            difficulty: Difficulty.INTERMEDIATE,
            equipment: 'EZ Bar',
            primaryMuscle: 'Biceps',
            secondaryMuscles: [],
            defaultSets: 3,
            repsMin: 10,
            repsMax: 12,
            restSeconds: 60,
            imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Cable Triceps Rope Pushdown',
            slug: 'cable-triceps-rope-pushdown',
            difficulty: Difficulty.BEGINNER,
            equipment: 'Cable',
            primaryMuscle: 'Triceps',
            secondaryMuscles: [],
            defaultSets: 3,
            repsMin: 12,
            repsMax: 15,
            restSeconds: 60,
            imageUrl: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Skull Crushers (Lying Triceps Extension)',
            slug: 'skull-crushers',
            difficulty: Difficulty.INTERMEDIATE,
            equipment: 'EZ Bar',
            primaryMuscle: 'Triceps',
            secondaryMuscles: [],
            defaultSets: 3,
            repsMin: 10,
            repsMax: 12,
            restSeconds: 75,
            imageUrl: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?auto=format&fit=crop&w=600&q=80',
        },

        // --- CORE / ABS ---
        {
            name: 'Hanging Leg Raises',
            slug: 'hanging-leg-raises',
            difficulty: Difficulty.INTERMEDIATE,
            equipment: 'Bodyweight',
            primaryMuscle: 'Abs',
            secondaryMuscles: ['Forearms'],
            defaultSets: 3,
            repsMin: 12,
            repsMax: 15,
            restSeconds: 60,
            imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Cable Woodchoppers',
            slug: 'cable-woodchoppers',
            difficulty: Difficulty.BEGINNER,
            equipment: 'Cable',
            primaryMuscle: 'Abs',
            secondaryMuscles: ['Shoulders'],
            defaultSets: 3,
            repsMin: 12,
            repsMax: 15,
            restSeconds: 60,
            imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
        },
    ];

    // Exercises upsertion
    for (const item of exerciseData) {
        const eqId = equipmentMap.get(item.equipment);
        const primaryId = muscleMap.get(item.primaryMuscle);

        const exercise = await prisma.exercise.upsert({
            where: { name: item.name }, // Fixed: Using name as unique identifier for upsert
            update: {
                slug: item.slug,
                difficulty: item.difficulty,
                equipmentId: eqId,
                defaultSets: item.defaultSets,
                repsMin: item.repsMin,
                repsMax: item.repsMax,
                restSeconds: item.restSeconds,
                imageUrl: item.imageUrl,
            },
            create: {
                name: item.name,
                slug: item.slug,
                difficulty: item.difficulty,
                equipmentId: eqId,
                defaultSets: item.defaultSets,
                repsMin: item.repsMin,
                repsMax: item.repsMax,
                restSeconds: item.restSeconds,
                imageUrl: item.imageUrl,
            },
        });

        // Link Primary Muscle
        if (primaryId) {
            await prisma.exerciseMuscle.deleteMany({
                where: { exerciseId: exercise.id },
            });

            await prisma.exerciseMuscle.create({
                data: {
                    exerciseId: exercise.id,
                    muscleId: primaryId,
                    role: 'PRIMARY',
                },
            });

            // Link Secondary Muscles
            for (const secName of item.secondaryMuscles) {
                const secId = muscleMap.get(secName);
                if (secId) {
                    await prisma.exerciseMuscle.create({
                        data: {
                            exerciseId: exercise.id,
                            muscleId: secId,
                            role: 'SECONDARY',
                        },
                    });
                }
            }
        }
    }

    console.log(`✅ Success: ${exerciseData.length} realistic exercises completely seeded!`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });