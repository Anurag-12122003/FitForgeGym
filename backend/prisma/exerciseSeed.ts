import { prisma } from "../src/config/database";
import { FitnessLevel, Gender, MuscleRole, Role } from "../src/generated/prisma/enums";
import bcrypt from 'bcrypt';

const Difficulty = {
    INTERMEDIATE: 'INTERMEDIATE',
    BEGINNER: 'BEGINNER',
    ADVANCED: 'ADVANCED'
}

/**
 * =============================================================
 * FITFORGE DATABASE SEED
 * =============================================================
 *
 * Seed order:
 *
 * 1. Equipment
 * 2. Muscle Groups
 * 3. Muscles / Regions
 * 4. Exercises
 * 5. Exercise <-> Muscle relationships
 *
 * This seed is intentionally idempotent.
 * You can run:
 *
 *     npx prisma db seed
 *
 * multiple times without creating duplicate records.
 *
 * =============================================================
 */

// =============================================================
// TYPES
// =============================================================

type MuscleSeed = {
    name: string;
    slug: string;
    groupSlug: string;
};

type ExerciseMuscleSeed = {
    muscleSlug: string;
    role: MuscleRole;
    region?: string;
};

type ExerciseSeed = {
    name: string;
    slug: string;
    description: string;
    difficulty: FitnessLevel;
    equipment: string;
    videoUrl?: string;
    imageUrl: string;
    instructions: string[];
    commonMistakes: string[];
    defaultSets: number;
    repsMin: number;
    repsMax: number;
    restSeconds: number;
    muscles: ExerciseMuscleSeed[];
};

// =============================================================
// 1. EQUIPMENT
// =============================================================

const equipmentData = [
    {
        name: "Barbell",
    },
    {
        name: "Dumbbell",
    },
    {
        name: "Cable",
    },
    {
        name: "Machine",
    },
    {
        name: "Bodyweight",
    },
];

// =============================================================
// 2. MUSCLE GROUPS
// =============================================================

const muscleGroups = [
    {
        name: "Chest",
        slug: "chest",
    },
    {
        name: "Back",
        slug: "back",
    },
    {
        name: "Shoulders",
        slug: "shoulders",
    },
    {
        name: "Biceps",
        slug: "biceps",
    },
    {
        name: "Triceps",
        slug: "triceps",
    },
    {
        name: "Legs",
        slug: "legs",
    },
    {
        name: "Abs",
        slug: "abs",
    },
    {
        name: "Glutes",
        slug: "glutes",
    },
];

// =============================================================
// 3. MUSCLES / REGIONS
// =============================================================

const muscles: MuscleSeed[] = [
    // -----------------------------------------------------------
    // CHEST
    // -----------------------------------------------------------

    {
        name: "Upper Chest",
        slug: "upper-chest",
        groupSlug: "chest",
    },
    {
        name: "Middle Chest",
        slug: "middle-chest",
        groupSlug: "chest",
    },
    {
        name: "Lower Chest",
        slug: "lower-chest",
        groupSlug: "chest",
    },

    // -----------------------------------------------------------
    // BACK
    // -----------------------------------------------------------

    {
        name: "Lats",
        slug: "lats",
        groupSlug: "back",
    },
    {
        name: "Mid Back",
        slug: "mid-back",
        groupSlug: "back",
    },
    {
        name: "Upper Back",
        slug: "upper-back",
        groupSlug: "back",
    },
    {
        name: "Lower Back",
        slug: "lower-back",
        groupSlug: "back",
    },

    // -----------------------------------------------------------
    // SHOULDERS
    // -----------------------------------------------------------

    {
        name: "Front Delts",
        slug: "front-delts",
        groupSlug: "shoulders",
    },
    {
        name: "Side Delts",
        slug: "side-delts",
        groupSlug: "shoulders",
    },
    {
        name: "Rear Delts",
        slug: "rear-delts",
        groupSlug: "shoulders",
    },

    // -----------------------------------------------------------
    // BICEPS
    // -----------------------------------------------------------

    {
        name: "Biceps Long Head",
        slug: "biceps-long-head",
        groupSlug: "biceps",
    },
    {
        name: "Biceps Short Head",
        slug: "biceps-short-head",
        groupSlug: "biceps",
    },
    {
        name: "Brachialis",
        slug: "brachialis",
        groupSlug: "biceps",
    },

    // -----------------------------------------------------------
    // TRICEPS
    // -----------------------------------------------------------

    {
        name: "Triceps Long Head",
        slug: "triceps-long-head",
        groupSlug: "triceps",
    },
    {
        name: "Triceps Lateral Head",
        slug: "triceps-lateral-head",
        groupSlug: "triceps",
    },
    {
        name: "Triceps Medial Head",
        slug: "triceps-medial-head",
        groupSlug: "triceps",
    },

    // -----------------------------------------------------------
    // LEGS
    // -----------------------------------------------------------

    {
        name: "Quads",
        slug: "quads",
        groupSlug: "legs",
    },
    {
        name: "Hamstrings",
        slug: "hamstrings",
        groupSlug: "legs",
    },
    {
        name: "Calves",
        slug: "calves",
        groupSlug: "legs",
    },

    // -----------------------------------------------------------
    // ABS
    // -----------------------------------------------------------

    {
        name: "Upper Abs",
        slug: "upper-abs",
        groupSlug: "abs",
    },
    {
        name: "Lower Abs",
        slug: "lower-abs",
        groupSlug: "abs",
    },
    {
        name: "Obliques",
        slug: "obliques",
        groupSlug: "abs",
    },

    // -----------------------------------------------------------
    // GLUTES
    // -----------------------------------------------------------

    {
        name: "Glute Max",
        slug: "glute-max",
        groupSlug: "glutes",
    },
    {
        name: "Glute Medius",
        slug: "glute-medius",
        groupSlug: "glutes",
    },
];

// =============================================================
// IMAGE HELPERS
// =============================================================

/**
 * Wikimedia Commons Special:Redirect/file URLs are used here
 * instead of generic image search URLs.
 *
 * IMPORTANT:
 * For production, download/verify these assets and host them
 * under your own CDN/storage.
 */

const WIKI = (fileName: string) =>
    `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(
        fileName
    )}`;

// =============================================================
// 4. EXERCISES
// =============================================================

const exercises: ExerciseSeed[] = [
    // ===========================================================
    // CHEST - UPPER
    // ===========================================================

    {
        name: "Incline Barbell Bench Press",
        slug: "incline-barbell-bench-press",
        description:
            "A compound pressing exercise emphasizing the upper portion of the chest while also training the front delts and triceps.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Barbell",
        imageUrl: WIKI("Bench-press-1.png"),
        videoUrl:
            "https://www.youtube.com/watch?v=SrqOu55lrYU",
        defaultSets: 4,
        repsMin: 6,
        repsMax: 10,
        restSeconds: 120,
        instructions: [
            "Set the bench to approximately 30 to 45 degrees.",
            "Lie back with your feet firmly planted.",
            "Grip the bar slightly wider than shoulder width.",
            "Unrack the bar and position it over your upper chest.",
            "Lower the bar under control toward the upper chest.",
            "Press the bar upward while keeping your shoulders stable.",
            "Return to the starting position without bouncing the bar."
        ],
        commonMistakes: [
            "Using an excessively steep bench angle.",
            "Bouncing the bar off the chest.",
            "Flaring the elbows excessively.",
            "Lifting the hips from the bench."
        ],
        muscles: [
            {
                muscleSlug: "upper-chest",
                role: MuscleRole.PRIMARY,
                region: "Upper Chest",
            },
            {
                muscleSlug: "front-delts",
                role: MuscleRole.SECONDARY,
                region: "Front Delts",
            },
            {
                muscleSlug: "triceps-lateral-head",
                role: MuscleRole.SECONDARY,
                region: "Lateral Head",
            },
        ],
    },

    {
        name: "Incline Dumbbell Press",
        slug: "incline-dumbbell-press",
        description:
            "A dumbbell pressing movement that trains the upper chest with additional front-delt and triceps involvement.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Dumbbell",
        imageUrl: WIKI("Incline_dumbbell_press.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=8iPEnn-ltC8",
        defaultSets: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 90,
        instructions: [
            "Set an adjustable bench to a moderate incline.",
            "Hold a dumbbell in each hand at chest level.",
            "Retract your shoulder blades and brace your core.",
            "Press both dumbbells upward.",
            "Keep the dumbbells controlled at the top.",
            "Lower them slowly toward the sides of your chest."
        ],
        commonMistakes: [
            "Using too much weight.",
            "Allowing the elbows to flare excessively.",
            "Dropping the dumbbells too quickly.",
            "Arching the lower back excessively."
        ],
        muscles: [
            {
                muscleSlug: "upper-chest",
                role: MuscleRole.PRIMARY,
                region: "Upper Chest",
            },
            {
                muscleSlug: "front-delts",
                role: MuscleRole.SECONDARY,
                region: "Front Delts",
            },
            {
                muscleSlug: "triceps-lateral-head",
                role: MuscleRole.SECONDARY,
                region: "Lateral Head",
            },
        ],
    },

    {
        name: "Low-to-High Cable Fly",
        slug: "low-to-high-cable-fly",
        description:
            "An isolation-focused cable movement emphasizing the upper chest through an upward and inward arm path.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Cable",
        imageUrl: WIKI("Cable_crossover.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=Iwe6AmxVf7o",
        defaultSets: 3,
        repsMin: 10,
        repsMax: 15,
        restSeconds: 75,
        instructions: [
            "Set both cable pulleys to a low position.",
            "Hold one handle in each hand.",
            "Take a stable staggered stance.",
            "Start with your hands beside your hips.",
            "Sweep the handles upward and inward.",
            "Squeeze the upper chest when your hands meet.",
            "Return slowly to the starting position."
        ],
        commonMistakes: [
            "Using excessive weight.",
            "Turning the movement into a pressing motion.",
            "Bending the elbows excessively.",
            "Using momentum."
        ],
        muscles: [
            {
                muscleSlug: "upper-chest",
                role: MuscleRole.PRIMARY,
                region: "Upper Chest",
            },
            {
                muscleSlug: "front-delts",
                role: MuscleRole.SECONDARY,
                region: "Front Delts",
            },
        ],
    },

    // ===========================================================
    // CHEST - MIDDLE
    // ===========================================================

    {
        name: "Flat Barbell Bench Press",
        slug: "flat-barbell-bench-press",
        description:
            "A foundational compound chest exercise primarily training the middle chest with assistance from the triceps and front delts.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Barbell",
        imageUrl: WIKI("Bench_press.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=rT7rgXQtDcI",
        defaultSets: 4,
        repsMin: 5,
        repsMax: 8,
        restSeconds: 150,
        instructions: [
            "Lie flat on the bench with your eyes below the bar.",
            "Plant your feet firmly on the floor.",
            "Grip the bar slightly wider than shoulder width.",
            "Unrack the bar carefully.",
            "Lower the bar toward the middle of your chest.",
            "Press the bar upward.",
            "Keep your wrists stacked over your forearms."
        ],
        commonMistakes: [
            "Bouncing the bar.",
            "Using an unstable grip.",
            "Lifting the feet from the floor.",
            "Excessive elbow flare."
        ],
        muscles: [
            {
                muscleSlug: "middle-chest",
                role: MuscleRole.PRIMARY,
                region: "Middle Chest",
            },
            {
                muscleSlug: "front-delts",
                role: MuscleRole.SECONDARY,
                region: "Front Delts",
            },
            {
                muscleSlug: "triceps-lateral-head",
                role: MuscleRole.SECONDARY,
                region: "Lateral Head",
            },
        ],
    },

    {
        name: "Flat Dumbbell Press",
        slug: "flat-dumbbell-press",
        description:
            "A free-weight horizontal pressing exercise that trains the middle chest while allowing independent movement of each arm.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Dumbbell",
        imageUrl: WIKI("Dumbbell_bench_press.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=VmB1G1K7v94",
        defaultSets: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 90,
        instructions: [
            "Lie flat on a bench with a dumbbell in each hand.",
            "Position the dumbbells beside your chest.",
            "Keep your shoulder blades retracted.",
            "Press both dumbbells upward.",
            "Pause briefly near the top.",
            "Lower the dumbbells under control."
        ],
        commonMistakes: [
            "Allowing the dumbbells to drift too far outward.",
            "Using momentum.",
            "Dropping the weights rapidly.",
            "Losing shoulder stability."
        ],
        muscles: [
            {
                muscleSlug: "middle-chest",
                role: MuscleRole.PRIMARY,
                region: "Middle Chest",
            },
            {
                muscleSlug: "front-delts",
                role: MuscleRole.SECONDARY,
                region: "Front Delts",
            },
            {
                muscleSlug: "triceps-lateral-head",
                role: MuscleRole.SECONDARY,
                region: "Lateral Head",
            },
        ],
    },

    {
        name: "Machine Chest Press",
        slug: "machine-chest-press",
        description:
            "A machine-based horizontal press providing a stable setup for training the middle chest.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Machine",
        imageUrl: WIKI("Chest_press_machine.jpg"),
        defaultSets: 3,
        repsMin: 10,
        repsMax: 15,
        restSeconds: 75,
        instructions: [
            "Adjust the seat so the handles align with your mid-chest.",
            "Sit with your back against the pad.",
            "Grip the handles firmly.",
            "Press the handles forward.",
            "Pause briefly at full contraction.",
            "Return the handles slowly."
        ],
        commonMistakes: [
            "Setting the seat too high or too low.",
            "Locking the elbows aggressively.",
            "Allowing the shoulders to roll forward.",
            "Using excessive momentum."
        ],
        muscles: [
            {
                muscleSlug: "middle-chest",
                role: MuscleRole.PRIMARY,
                region: "Middle Chest",
            },
            {
                muscleSlug: "front-delts",
                role: MuscleRole.SECONDARY,
                region: "Front Delts",
            },
            {
                muscleSlug: "triceps-lateral-head",
                role: MuscleRole.SECONDARY,
                region: "Lateral Head",
            },
        ],
    },

    // ===========================================================
    // CHEST - LOWER
    // ===========================================================

    {
        name: "Decline Barbell Bench Press",
        slug: "decline-barbell-bench-press",
        description:
            "A decline pressing variation emphasizing the lower portion of the chest.",
        difficulty: FitnessLevel.ADVANCED,
        equipment: "Barbell",
        imageUrl: WIKI("Decline_bench_press.jpg"),
        defaultSets: 4,
        repsMin: 6,
        repsMax: 10,
        restSeconds: 120,
        instructions: [
            "Secure your legs under the bench supports.",
            "Grip the bar slightly wider than shoulder width.",
            "Unrack the bar with control.",
            "Lower the bar toward the lower chest.",
            "Keep the shoulder blades retracted.",
            "Press the bar upward.",
            "Return to the starting position."
        ],
        commonMistakes: [
            "Using excessive decline angle.",
            "Bouncing the bar.",
            "Losing shoulder position.",
            "Using a grip that is too narrow."
        ],
        muscles: [
            {
                muscleSlug: "lower-chest",
                role: MuscleRole.PRIMARY,
                region: "Lower Chest",
            },
            {
                muscleSlug: "triceps-lateral-head",
                role: MuscleRole.SECONDARY,
                region: "Lateral Head",
            },
            {
                muscleSlug: "front-delts",
                role: MuscleRole.SECONDARY,
                region: "Front Delts",
            },
        ],
    },

    {
        name: "Chest Dips",
        slug: "chest-dips",
        description:
            "A bodyweight pressing movement that can emphasize the lower chest when performed with a forward torso lean.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Bodyweight",
        imageUrl: WIKI("Dips_exercise.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=2z8JmcrW-As",
        defaultSets: 3,
        repsMin: 8,
        repsMax: 15,
        restSeconds: 90,
        instructions: [
            "Grip the parallel bars and support your body.",
            "Lean your torso slightly forward.",
            "Bend your elbows and lower your body.",
            "Descend to a comfortable depth.",
            "Drive through your hands.",
            "Return to the starting position."
        ],
        commonMistakes: [
            "Dropping too deeply.",
            "Swinging the body.",
            "Shrugging the shoulders.",
            "Using uncontrolled repetitions."
        ],
        muscles: [
            {
                muscleSlug: "lower-chest",
                role: MuscleRole.PRIMARY,
                region: "Lower Chest",
            },
            {
                muscleSlug: "triceps-lateral-head",
                role: MuscleRole.SECONDARY,
                region: "Lateral Head",
            },
            {
                muscleSlug: "front-delts",
                role: MuscleRole.SECONDARY,
                region: "Front Delts",
            },
        ],
    },

    // ===========================================================
    // BACK - LATS
    // ===========================================================

    {
        name: "Pull-Up",
        slug: "pull-up",
        description:
            "A bodyweight vertical pulling exercise targeting the lats and upper back with significant biceps involvement.",
        difficulty: FitnessLevel.ADVANCED,
        equipment: "Bodyweight",
        imageUrl: WIKI("Pull_up.JPG"),
        videoUrl:
            "https://www.youtube.com/watch?v=eGo4IYlbE5g",
        defaultSets: 4,
        repsMin: 5,
        repsMax: 12,
        restSeconds: 120,
        instructions: [
            "Grip the bar slightly wider than shoulder width.",
            "Hang with your arms extended.",
            "Brace your core.",
            "Pull your elbows down toward your sides.",
            "Continue until your chin reaches the bar.",
            "Lower yourself under control."
        ],
        commonMistakes: [
            "Kipping excessively.",
            "Using only the arms.",
            "Incomplete repetitions.",
            "Swinging the legs."
        ],
        muscles: [
            {
                muscleSlug: "lats",
                role: MuscleRole.PRIMARY,
                region: "Lats",
            },
            {
                muscleSlug: "biceps-long-head",
                role: MuscleRole.SECONDARY,
                region: "Long Head",
            },
            {
                muscleSlug: "rear-delts",
                role: MuscleRole.SECONDARY,
                region: "Rear Delts",
            },
        ],
    },

    {
        name: "Lat Pulldown",
        slug: "lat-pulldown",
        description:
            "A cable-based vertical pulling exercise designed to develop the lat muscles.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Cable",
        imageUrl: WIKI("Lat_pulldown.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=CAwf7n6Luuc",
        defaultSets: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 90,
        instructions: [
            "Sit at the pulldown station.",
            "Secure your thighs under the pads.",
            "Grip the bar slightly wider than shoulder width.",
            "Keep your torso upright.",
            "Pull the bar toward your upper chest.",
            "Drive your elbows downward.",
            "Return the bar slowly."
        ],
        commonMistakes: [
            "Pulling the bar behind the neck.",
            "Swinging the torso.",
            "Using excessive weight.",
            "Pulling mainly with the hands."
        ],
        muscles: [
            {
                muscleSlug: "lats",
                role: MuscleRole.PRIMARY,
                region: "Lats",
            },
            {
                muscleSlug: "biceps-long-head",
                role: MuscleRole.SECONDARY,
                region: "Long Head",
            },
            {
                muscleSlug: "rear-delts",
                role: MuscleRole.SECONDARY,
                region: "Rear Delts",
            },
        ],
    },

    {
        name: "Single Arm Cable Lat Pulldown",
        slug: "single-arm-cable-lat-pulldown",
        description:
            "A unilateral cable pulling exercise allowing focused lat contraction and independent movement of each side.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Cable",
        imageUrl: WIKI("Lat_pulldown.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=CAwf7n6Luuc",
        defaultSets: 3,
        repsMin: 10,
        repsMax: 15,
        restSeconds: 75,
        instructions: [
            "Attach a single handle to a high pulley.",
            "Sit or kneel beneath the cable.",
            "Reach upward and grip the handle.",
            "Pull your elbow down toward your hip.",
            "Keep your torso stable.",
            "Return the handle slowly."
        ],
        commonMistakes: [
            "Rotating the torso excessively.",
            "Pulling with the biceps only.",
            "Using momentum.",
            "Shrugging the shoulder."
        ],
        muscles: [
            {
                muscleSlug: "lats",
                role: MuscleRole.PRIMARY,
                region: "Lats",
            },
            {
                muscleSlug: "biceps-long-head",
                role: MuscleRole.SECONDARY,
                region: "Long Head",
            },
        ],
    },

    // ===========================================================
    // BACK - MID BACK
    // ===========================================================

    {
        name: "Bent Over Barbell Row",
        slug: "bent-over-barbell-row",
        description:
            "A compound horizontal pulling movement targeting the mid-back and lats.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Barbell",
        imageUrl: WIKI("Bent-over-row.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=FWJR5Ve8bnQ",
        defaultSets: 4,
        repsMin: 6,
        repsMax: 10,
        restSeconds: 120,
        instructions: [
            "Stand with your feet around hip width apart.",
            "Hinge forward at the hips.",
            "Keep your spine neutral.",
            "Grip the bar slightly wider than shoulder width.",
            "Pull the bar toward your lower ribs.",
            "Drive the elbows backward.",
            "Lower the bar under control."
        ],
        commonMistakes: [
            "Rounding the lower back.",
            "Using excessive torso momentum.",
            "Shrugging the shoulders.",
            "Turning the exercise into a deadlift."
        ],
        muscles: [
            {
                muscleSlug: "mid-back",
                role: MuscleRole.PRIMARY,
                region: "Mid Back",
            },
            {
                muscleSlug: "lats",
                role: MuscleRole.SECONDARY,
                region: "Lats",
            },
            {
                muscleSlug: "rear-delts",
                role: MuscleRole.SECONDARY,
                region: "Rear Delts",
            },
            {
                muscleSlug: "biceps-long-head",
                role: MuscleRole.SECONDARY,
                region: "Long Head",
            },
        ],
    },

    {
        name: "Seated Cable Row",
        slug: "seated-cable-row",
        description:
            "A horizontal pulling exercise emphasizing the mid-back and scapular retractors.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Cable",
        imageUrl: WIKI("Seated_cable_row.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=GZbfZ033f74",
        defaultSets: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 90,
        instructions: [
            "Sit at the cable row station.",
            "Place your feet firmly on the platform.",
            "Keep your torso upright.",
            "Pull the handle toward your abdomen.",
            "Drive your elbows behind your body.",
            "Squeeze your shoulder blades together.",
            "Extend your arms slowly."
        ],
        commonMistakes: [
            "Excessive torso rocking.",
            "Rounding the back.",
            "Pulling only with the arms.",
            "Using excessive weight."
        ],
        muscles: [
            {
                muscleSlug: "mid-back",
                role: MuscleRole.PRIMARY,
                region: "Mid Back",
            },
            {
                muscleSlug: "lats",
                role: MuscleRole.SECONDARY,
                region: "Lats",
            },
            {
                muscleSlug: "rear-delts",
                role: MuscleRole.SECONDARY,
                region: "Rear Delts",
            },
            {
                muscleSlug: "biceps-long-head",
                role: MuscleRole.SECONDARY,
                region: "Long Head",
            },
        ],
    },

    {
        name: "Chest Supported Dumbbell Row",
        slug: "chest-supported-dumbbell-row",
        description:
            "A supported dumbbell row that minimizes lower-body momentum and focuses on the upper and middle back.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Dumbbell",
        imageUrl: WIKI("Dumbbell_row.jpg"),
        defaultSets: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 90,
        instructions: [
            "Set an incline bench around 30 to 45 degrees.",
            "Lie chest-down on the bench.",
            "Allow the dumbbells to hang naturally.",
            "Pull the dumbbells toward your lower ribs.",
            "Squeeze the shoulder blades together.",
            "Lower the dumbbells slowly."
        ],
        commonMistakes: [
            "Lifting the chest from the bench.",
            "Shrugging the shoulders.",
            "Using momentum.",
            "Pulling too high toward the neck."
        ],
        muscles: [
            {
                muscleSlug: "mid-back",
                role: MuscleRole.PRIMARY,
                region: "Mid Back",
            },
            {
                muscleSlug: "lats",
                role: MuscleRole.SECONDARY,
                region: "Lats",
            },
            {
                muscleSlug: "rear-delts",
                role: MuscleRole.SECONDARY,
                region: "Rear Delts",
            },
        ],
    },

    // ===========================================================
    // BACK - UPPER
    // ===========================================================

    {
        name: "Barbell Shrug",
        slug: "barbell-shrug",
        description:
            "A loaded shoulder elevation exercise targeting the upper trapezius region of the upper back.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Barbell",
        imageUrl: WIKI("Barbell_shrug.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=cJRVVxmytaM",
        defaultSets: 3,
        repsMin: 8,
        repsMax: 15,
        restSeconds: 75,
        instructions: [
            "Stand upright holding the barbell.",
            "Keep your arms straight.",
            "Brace your core.",
            "Elevate your shoulders upward.",
            "Pause briefly at the top.",
            "Lower your shoulders under control."
        ],
        commonMistakes: [
            "Rolling the shoulders.",
            "Using excessive momentum.",
            "Bending the elbows.",
            "Using more weight than you can control."
        ],
        muscles: [
            {
                muscleSlug: "upper-back",
                role: MuscleRole.PRIMARY,
                region: "Upper Back",
            },
        ],
    },

    {
        name: "Face Pull",
        slug: "face-pull",
        description:
            "A cable exercise emphasizing the rear delts and upper back while training external rotation.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Cable",
        imageUrl: WIKI("Face_pull.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=rep-qVOkqgk",
        defaultSets: 3,
        repsMin: 12,
        repsMax: 20,
        restSeconds: 60,
        instructions: [
            "Attach a rope to a cable around face height.",
            "Grip both ends of the rope.",
            "Step backward to create tension.",
            "Pull the rope toward your face.",
            "Rotate your hands outward.",
            "Squeeze the rear delts and upper back.",
            "Return slowly."
        ],
        commonMistakes: [
            "Using excessive weight.",
            "Pulling the rope toward the chest.",
            "Shrugging the shoulders.",
            "Using fast uncontrolled repetitions."
        ],
        muscles: [
            {
                muscleSlug: "upper-back",
                role: MuscleRole.PRIMARY,
                region: "Upper Back",
            },
            {
                muscleSlug: "rear-delts",
                role: MuscleRole.SECONDARY,
                region: "Rear Delts",
            },
            {
                muscleSlug: "side-delts",
                role: MuscleRole.SECONDARY,
                region: "Side Delts",
            },
        ],
    },

    // ===========================================================
    // SHOULDERS - FRONT
    // ===========================================================

    {
        name: "Barbell Overhead Press",
        slug: "barbell-overhead-press",
        description:
            "A compound vertical pressing exercise primarily targeting the front delts and also training the side delts and triceps.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Barbell",
        imageUrl: WIKI("Military_press_ez-bar_25022008.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=2yjwXTZQDDI",
        defaultSets: 4,
        repsMin: 6,
        repsMax: 10,
        restSeconds: 120,
        instructions: [
            "Position the bar across the front of your shoulders.",
            "Grip the bar slightly wider than shoulder width.",
            "Brace your core and glutes.",
            "Press the bar overhead.",
            "Move your head slightly backward as the bar passes.",
            "Finish with the bar stacked above your shoulders.",
            "Lower the bar under control."
        ],
        commonMistakes: [
            "Overarching the lower back.",
            "Pressing the bar around the face instead of vertically.",
            "Using excessive weight.",
            "Losing core tension."
        ],
        muscles: [
            {
                muscleSlug: "front-delts",
                role: MuscleRole.PRIMARY,
                region: "Front Delts",
            },
            {
                muscleSlug: "side-delts",
                role: MuscleRole.SECONDARY,
                region: "Side Delts",
            },
            {
                muscleSlug: "triceps-lateral-head",
                role: MuscleRole.SECONDARY,
                region: "Lateral Head",
            },
        ],
    },

    {
        name: "Dumbbell Shoulder Press",
        slug: "dumbbell-shoulder-press",
        description:
            "A seated dumbbell pressing exercise emphasizing the front and side portions of the shoulders.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Dumbbell",
        imageUrl: WIKI("Dumbbell_shoulder_press.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=qEwKCR5JCog",
        defaultSets: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 90,
        instructions: [
            "Sit on an upright bench.",
            "Hold a dumbbell in each hand at shoulder height.",
            "Brace your core.",
            "Press the dumbbells overhead.",
            "Keep the wrists stacked over the elbows.",
            "Lower the dumbbells slowly."
        ],
        commonMistakes: [
            "Excessive lower-back arch.",
            "Dropping the dumbbells too quickly.",
            "Using excessive weight.",
            "Pressing with uneven arms."
        ],
        muscles: [
            {
                muscleSlug: "front-delts",
                role: MuscleRole.PRIMARY,
                region: "Front Delts",
            },
            {
                muscleSlug: "side-delts",
                role: MuscleRole.SECONDARY,
                region: "Side Delts",
            },
            {
                muscleSlug: "triceps-lateral-head",
                role: MuscleRole.SECONDARY,
                region: "Lateral Head",
            },
        ],
    },

    // ===========================================================
    // SHOULDERS - SIDE
    // ===========================================================

    {
        name: "Dumbbell Lateral Raise",
        slug: "dumbbell-lateral-raise",
        description:
            "An isolation exercise designed to emphasize the side delts and shoulder width.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Dumbbell",
        imageUrl: WIKI("Lateral_raise.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=3VcKaXpzqRo",
        defaultSets: 3,
        repsMin: 12,
        repsMax: 20,
        restSeconds: 60,
        instructions: [
            "Stand holding dumbbells beside your body.",
            "Keep a slight bend in your elbows.",
            "Raise both arms outward.",
            "Stop approximately at shoulder height.",
            "Pause briefly.",
            "Lower the dumbbells slowly."
        ],
        commonMistakes: [
            "Swinging the dumbbells.",
            "Shrugging the shoulders.",
            "Using excessive weight.",
            "Raising the arms far above shoulder level."
        ],
        muscles: [
            {
                muscleSlug: "side-delts",
                role: MuscleRole.PRIMARY,
                region: "Side Delts",
            },
        ],
    },

    {
        name: "Cable Lateral Raise",
        slug: "cable-lateral-raise",
        description:
            "A cable-based lateral raise providing continuous resistance to the side delts.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Cable",
        imageUrl: WIKI("Cable_lateral_raise.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=PPrzBWZDOhA",
        defaultSets: 3,
        repsMin: 12,
        repsMax: 18,
        restSeconds: 60,
        instructions: [
            "Set the pulley to the lowest position.",
            "Stand sideways to the cable machine.",
            "Hold the handle with the outside hand.",
            "Raise your arm laterally.",
            "Stop around shoulder height.",
            "Lower slowly while maintaining cable tension."
        ],
        commonMistakes: [
            "Using momentum.",
            "Shrugging the shoulder.",
            "Using excessive weight.",
            "Rotating the torso."
        ],
        muscles: [
            {
                muscleSlug: "side-delts",
                role: MuscleRole.PRIMARY,
                region: "Side Delts",
            },
        ],
    },

    // ===========================================================
    // SHOULDERS - REAR
    // ===========================================================

    {
        name: "Reverse Dumbbell Fly",
        slug: "reverse-dumbbell-fly",
        description:
            "An isolation movement targeting the rear delts and supporting upper-back musculature.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Dumbbell",
        imageUrl: WIKI("Reverse_fly.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=T5cZ6m3wT5I",
        defaultSets: 3,
        repsMin: 12,
        repsMax: 20,
        restSeconds: 60,
        instructions: [
            "Hold a dumbbell in each hand.",
            "Hinge forward while keeping your spine neutral.",
            "Allow the dumbbells to hang below your chest.",
            "Raise both arms outward.",
            "Squeeze the rear delts.",
            "Lower the dumbbells slowly."
        ],
        commonMistakes: [
            "Using momentum.",
            "Turning the movement into a row.",
            "Shrugging excessively.",
            "Using weights that are too heavy."
        ],
        muscles: [
            {
                muscleSlug: "rear-delts",
                role: MuscleRole.PRIMARY,
                region: "Rear Delts",
            },
            {
                muscleSlug: "upper-back",
                role: MuscleRole.SECONDARY,
                region: "Upper Back",
            },
        ],
    },

    // ===========================================================
    // BICEPS - LONG HEAD
    // ===========================================================

    {
        name: "Incline Dumbbell Curl",
        slug: "incline-dumbbell-curl",
        description:
            "A biceps curl performed on an incline bench that places the shoulder behind the torso and emphasizes the long head.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Dumbbell",
        imageUrl: WIKI("Alternate-incline-curl-1.png"),
        videoUrl:
            "https://www.youtube.com/watch?v=soxrZlIl35U",
        defaultSets: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 75,
        instructions: [
            "Set an incline bench around 45 to 60 degrees.",
            "Sit back holding a dumbbell in each hand.",
            "Allow your arms to hang naturally.",
            "Curl the dumbbells without moving your upper arms.",
            "Squeeze the biceps at the top.",
            "Lower the dumbbells under control."
        ],
        commonMistakes: [
            "Moving the elbows forward.",
            "Swinging the dumbbells.",
            "Using excessive weight.",
            "Dropping the weights rapidly."
        ],
        muscles: [
            {
                muscleSlug: "biceps-long-head",
                role: MuscleRole.PRIMARY,
                region: "Long Head",
            },
            {
                muscleSlug: "brachialis",
                role: MuscleRole.SECONDARY,
                region: "Brachialis",
            },
        ],
    },

    {
        name: "Close Grip Barbell Curl",
        slug: "close-grip-barbell-curl",
        description:
            "A narrow-grip barbell curl that provides strong biceps involvement with additional emphasis on the long head.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Barbell",
        imageUrl: WIKI("Barbell_curl.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=kwG2ipFRgfo",
        defaultSets: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 75,
        instructions: [
            "Stand upright holding the bar with a narrow grip.",
            "Keep your elbows close to your sides.",
            "Curl the bar upward.",
            "Avoid moving your upper arms.",
            "Squeeze the biceps at the top.",
            "Lower the bar slowly."
        ],
        commonMistakes: [
            "Swinging the torso.",
            "Moving the elbows forward.",
            "Using excessive weight.",
            "Dropping the bar quickly."
        ],
        muscles: [
            {
                muscleSlug: "biceps-long-head",
                role: MuscleRole.PRIMARY,
                region: "Long Head",
            },
            {
                muscleSlug: "brachialis",
                role: MuscleRole.SECONDARY,
                region: "Brachialis",
            },
        ],
    },

    // ===========================================================
    // BICEPS - SHORT HEAD
    // ===========================================================

    {
        name: "Preacher Curl",
        slug: "preacher-curl",
        description:
            "A supported curl that limits upper-arm movement and provides focused biceps training.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Machine",
        imageUrl: WIKI("Preacher_curl.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=fIWP-FRFNU0",
        defaultSets: 3,
        repsMin: 10,
        repsMax: 15,
        restSeconds: 75,
        instructions: [
            "Adjust the preacher pad so your upper arms rest securely.",
            "Grip the bar or machine handles.",
            "Start with your arms extended comfortably.",
            "Curl the weight upward.",
            "Squeeze the biceps.",
            "Lower the weight slowly."
        ],
        commonMistakes: [
            "Locking the elbows aggressively.",
            "Lifting the shoulders from the pad.",
            "Using momentum.",
            "Using excessive weight."
        ],
        muscles: [
            {
                muscleSlug: "biceps-short-head",
                role: MuscleRole.PRIMARY,
                region: "Short Head",
            },
            {
                muscleSlug: "brachialis",
                role: MuscleRole.SECONDARY,
                region: "Brachialis",
            },
        ],
    },

    {
        name: "Wide Grip Barbell Curl",
        slug: "wide-grip-barbell-curl",
        description:
            "A wide-grip barbell curl commonly used to emphasize the short-head region of the biceps.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Barbell",
        imageUrl: WIKI("Bicep_Curl.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=kwG2ipFRgfo",
        defaultSets: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 75,
        instructions: [
            "Stand upright holding the bar with a wider grip.",
            "Keep your elbows near your torso.",
            "Curl the bar upward.",
            "Squeeze the biceps at the top.",
            "Lower under control."
        ],
        commonMistakes: [
            "Leaning backward.",
            "Swinging the bar.",
            "Moving the elbows.",
            "Using excessive weight."
        ],
        muscles: [
            {
                muscleSlug: "biceps-short-head",
                role: MuscleRole.PRIMARY,
                region: "Short Head",
            },
            {
                muscleSlug: "brachialis",
                role: MuscleRole.SECONDARY,
                region: "Brachialis",
            },
        ],
    },

    // ===========================================================
    // BICEPS - BRACHIALIS
    // ===========================================================

    {
        name: "Hammer Curl",
        slug: "hammer-curl",
        description:
            "A neutral-grip curl that strongly trains the brachialis and brachioradialis while also developing the biceps.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Dumbbell",
        imageUrl: WIKI("Hammer_curl.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=zC3nLlEvin4",
        defaultSets: 3,
        repsMin: 10,
        repsMax: 15,
        restSeconds: 75,
        instructions: [
            "Stand holding dumbbells with a neutral grip.",
            "Keep your elbows close to your torso.",
            "Curl the dumbbells upward.",
            "Maintain the neutral hand position.",
            "Squeeze the upper arm muscles.",
            "Lower the dumbbells slowly."
        ],
        commonMistakes: [
            "Rotating the wrists.",
            "Swinging the torso.",
            "Moving the elbows forward.",
            "Using excessive weight."
        ],
        muscles: [
            {
                muscleSlug: "brachialis",
                role: MuscleRole.PRIMARY,
                region: "Brachialis",
            },
            {
                muscleSlug: "biceps-long-head",
                role: MuscleRole.SECONDARY,
                region: "Long Head",
            },
        ],
    },

    // ===========================================================
    // TRICEPS - LONG HEAD
    // ===========================================================

    {
        name: "Overhead Dumbbell Triceps Extension",
        slug: "overhead-dumbbell-triceps-extension",
        description:
            "An overhead extension that places the triceps in a lengthened shoulder position and strongly trains the long head.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Dumbbell",
        imageUrl: WIKI("Triceps_extension.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=YbX7Wd8jQ-Q",
        defaultSets: 3,
        repsMin: 10,
        repsMax: 15,
        restSeconds: 75,
        instructions: [
            "Hold one dumbbell with both hands above your head.",
            "Keep your elbows pointed mostly forward.",
            "Lower the dumbbell behind your head.",
            "Keep your upper arms relatively stationary.",
            "Extend your elbows.",
            "Squeeze the triceps at the top."
        ],
        commonMistakes: [
            "Flaring the elbows excessively.",
            "Moving the upper arms.",
            "Using excessive weight.",
            "Arching the lower back."
        ],
        muscles: [
            {
                muscleSlug: "triceps-long-head",
                role: MuscleRole.PRIMARY,
                region: "Long Head",
            },
            {
                muscleSlug: "triceps-medial-head",
                role: MuscleRole.SECONDARY,
                region: "Medial Head",
            },
        ],
    },

    {
        name: "Overhead Cable Triceps Extension",
        slug: "overhead-cable-triceps-extension",
        description:
            "A cable-based overhead triceps extension providing continuous resistance through the movement.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Cable",
        imageUrl: WIKI("Cable_triceps_extension.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=_gsUck-7M74",
        defaultSets: 3,
        repsMin: 10,
        repsMax: 15,
        restSeconds: 75,
        instructions: [
            "Attach a rope to a low cable pulley.",
            "Face away from the machine.",
            "Bring the rope behind your head.",
            "Keep your elbows pointed forward.",
            "Extend your elbows.",
            "Squeeze the triceps.",
            "Return slowly."
        ],
        commonMistakes: [
            "Allowing the elbows to flare.",
            "Using excessive weight.",
            "Moving the torso excessively.",
            "Rushing the eccentric phase."
        ],
        muscles: [
            {
                muscleSlug: "triceps-long-head",
                role: MuscleRole.PRIMARY,
                region: "Long Head",
            },
            {
                muscleSlug: "triceps-medial-head",
                role: MuscleRole.SECONDARY,
                region: "Medial Head",
            },
        ],
    },

    // ===========================================================
    // TRICEPS - LATERAL
    // ===========================================================

    {
        name: "Cable Triceps Pushdown",
        slug: "cable-triceps-pushdown",
        description:
            "A cable extension movement that trains the triceps through controlled elbow extension.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Cable",
        imageUrl: WIKI("Triceps_pushdown.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=2-LAMcpzODU",
        defaultSets: 3,
        repsMin: 10,
        repsMax: 15,
        restSeconds: 60,
        instructions: [
            "Attach a rope or straight bar to a high pulley.",
            "Stand upright with elbows close to your torso.",
            "Push the handle downward.",
            "Fully extend the elbows without excessive locking.",
            "Squeeze the triceps.",
            "Return the handle slowly."
        ],
        commonMistakes: [
            "Moving the upper arms.",
            "Leaning excessively over the cable.",
            "Using momentum.",
            "Using excessive weight."
        ],
        muscles: [
            {
                muscleSlug: "triceps-lateral-head",
                role: MuscleRole.PRIMARY,
                region: "Lateral Head",
            },
            {
                muscleSlug: "triceps-medial-head",
                role: MuscleRole.SECONDARY,
                region: "Medial Head",
            },
        ],
    },

    {
        name: "Close Grip Bench Press",
        slug: "close-grip-bench-press",
        description:
            "A compound pressing movement using a narrower grip to increase triceps contribution.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Barbell",
        imageUrl: WIKI("Bench-press-2.png"),
        videoUrl:
            "https://www.youtube.com/watch?v=nEF0bv2FW94",
        defaultSets: 4,
        repsMin: 6,
        repsMax: 10,
        restSeconds: 120,
        instructions: [
            "Lie flat on the bench.",
            "Use a grip narrower than a traditional bench press.",
            "Unrack the bar carefully.",
            "Lower it toward the lower chest.",
            "Keep the elbows relatively close to the torso.",
            "Press the bar upward."
        ],
        commonMistakes: [
            "Using an extremely narrow grip.",
            "Allowing the elbows to flare.",
            "Bouncing the bar.",
            "Losing wrist alignment."
        ],
        muscles: [
            {
                muscleSlug: "triceps-lateral-head",
                role: MuscleRole.PRIMARY,
                region: "Lateral Head",
            },
            {
                muscleSlug: "triceps-medial-head",
                role: MuscleRole.SECONDARY,
                region: "Medial Head",
            },
            {
                muscleSlug: "middle-chest",
                role: MuscleRole.SECONDARY,
                region: "Middle Chest",
            },
        ],
    },

    // ===========================================================
    // QUADS
    // ===========================================================

    {
        name: "Barbell Back Squat",
        slug: "barbell-back-squat",
        description:
            "A compound lower-body exercise primarily training the quadriceps while also involving the glutes and hamstrings.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Barbell",
        imageUrl: WIKI("Squat.png"),
        videoUrl:
            "https://www.youtube.com/watch?v=SW_C1A-rejs",
        defaultSets: 4,
        repsMin: 5,
        repsMax: 8,
        restSeconds: 150,
        instructions: [
            "Position the bar securely across your upper back.",
            "Stand with your feet approximately shoulder width apart.",
            "Brace your core.",
            "Bend your knees and hips to descend.",
            "Maintain a controlled torso position.",
            "Descend to a comfortable depth.",
            "Drive through the floor to stand."
        ],
        commonMistakes: [
            "Allowing the knees to collapse inward.",
            "Rounding the lower back.",
            "Lifting the heels.",
            "Using excessive weight."
        ],
        muscles: [
            {
                muscleSlug: "quads",
                role: MuscleRole.PRIMARY,
                region: "Quads",
            },
            {
                muscleSlug: "glute-max",
                role: MuscleRole.SECONDARY,
                region: "Glutes",
            },
            {
                muscleSlug: "hamstrings",
                role: MuscleRole.SECONDARY,
                region: "Hamstrings",
            },
        ],
    },

    {
        name: "Leg Press",
        slug: "leg-press",
        description:
            "A machine-based compound leg exercise that can strongly train the quadriceps with controlled resistance.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Machine",
        imageUrl: WIKI("Leg_press.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
        defaultSets: 4,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 120,
        instructions: [
            "Sit securely in the leg press machine.",
            "Place your feet around shoulder width apart.",
            "Release the safety mechanism.",
            "Lower the platform under control.",
            "Keep your lower back against the pad.",
            "Drive through your feet to extend the legs.",
            "Return without aggressively locking the knees."
        ],
        commonMistakes: [
            "Allowing the lower back to round.",
            "Locking the knees forcefully.",
            "Using excessive depth.",
            "Allowing the knees to collapse inward."
        ],
        muscles: [
            {
                muscleSlug: "quads",
                role: MuscleRole.PRIMARY,
                region: "Quads",
            },
            {
                muscleSlug: "glute-max",
                role: MuscleRole.SECONDARY,
                region: "Glutes",
            },
            {
                muscleSlug: "hamstrings",
                role: MuscleRole.SECONDARY,
                region: "Hamstrings",
            },
        ],
    },

    {
        name: "Dumbbell Walking Lunge",
        slug: "dumbbell-walking-lunge",
        description:
            "A unilateral leg exercise that develops the quads and glutes while challenging balance and coordination.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Dumbbell",
        imageUrl: WIKI("Dumbbell_lunges.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
        defaultSets: 3,
        repsMin: 10,
        repsMax: 16,
        restSeconds: 90,
        instructions: [
            "Stand upright holding dumbbells.",
            "Take a controlled step forward.",
            "Lower your body toward the floor.",
            "Keep the front knee aligned with the foot.",
            "Drive through the front foot.",
            "Step forward with the opposite leg.",
            "Continue for the desired distance."
        ],
        commonMistakes: [
            "Taking extremely short steps.",
            "Allowing the knee to collapse inward.",
            "Losing balance.",
            "Using excessive weight."
        ],
        muscles: [
            {
                muscleSlug: "quads",
                role: MuscleRole.PRIMARY,
                region: "Quads",
            },
            {
                muscleSlug: "glute-max",
                role: MuscleRole.SECONDARY,
                region: "Glutes",
            },
            {
                muscleSlug: "hamstrings",
                role: MuscleRole.SECONDARY,
                region: "Hamstrings",
            },
        ],
    },

    // ===========================================================
    // HAMSTRINGS
    // ===========================================================

    {
        name: "Barbell Romanian Deadlift",
        slug: "barbell-romanian-deadlift",
        description:
            "A hip-hinge exercise emphasizing the hamstrings and glutes through controlled eccentric loading.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Barbell",
        imageUrl: WIKI("Deadlift-phase_2.JPG"),
        videoUrl:
            "https://www.youtube.com/watch?v=JCXUYuzwNrM",
        defaultSets: 4,
        repsMin: 6,
        repsMax: 10,
        restSeconds: 120,
        instructions: [
            "Stand holding the bar close to your thighs.",
            "Keep your knees slightly bent.",
            "Push your hips backward.",
            "Lower the bar along your legs.",
            "Stop when you feel a strong hamstring stretch.",
            "Drive your hips forward.",
            "Return to standing while keeping the spine neutral."
        ],
        commonMistakes: [
            "Rounding the lower back.",
            "Bending the knees too much.",
            "Moving the bar away from the legs.",
            "Descending farther than mobility allows."
        ],
        muscles: [
            {
                muscleSlug: "hamstrings",
                role: MuscleRole.PRIMARY,
                region: "Hamstrings",
            },
            {
                muscleSlug: "glute-max",
                role: MuscleRole.SECONDARY,
                region: "Glutes",
            },
            {
                muscleSlug: "lower-back",
                role: MuscleRole.SECONDARY,
                region: "Lower Back",
            },
        ],
    },

    {
        name: "Lying Leg Curl",
        slug: "lying-leg-curl",
        description:
            "A machine-based knee flexion exercise primarily training the hamstrings.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Machine",
        imageUrl: WIKI("Leg_curl.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=1Tq3QdYUuHs",
        defaultSets: 3,
        repsMin: 10,
        repsMax: 15,
        restSeconds: 75,
        instructions: [
            "Lie face down on the machine.",
            "Position the ankle pad just above the heels.",
            "Keep your hips against the pad.",
            "Curl your heels toward your glutes.",
            "Squeeze the hamstrings.",
            "Lower the weight slowly."
        ],
        commonMistakes: [
            "Lifting the hips from the pad.",
            "Using momentum.",
            "Using excessive weight.",
            "Dropping the weight quickly."
        ],
        muscles: [
            {
                muscleSlug: "hamstrings",
                role: MuscleRole.PRIMARY,
                region: "Hamstrings",
            },
            {
                muscleSlug: "calves",
                role: MuscleRole.SECONDARY,
                region: "Calves",
            },
        ],
    },

    // ===========================================================
    // CALVES
    // ===========================================================

    {
        name: "Standing Calf Raise",
        slug: "standing-calf-raise",
        description:
            "A standing calf exercise emphasizing the gastrocnemius through plantar flexion.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Machine",
        imageUrl: WIKI("Standing_calf_raise.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=YMmgqO8Jo-k",
        defaultSets: 4,
        repsMin: 10,
        repsMax: 20,
        restSeconds: 60,
        instructions: [
            "Position your shoulders under the machine pads.",
            "Place the balls of your feet on the platform.",
            "Allow your heels to lower into a controlled stretch.",
            "Raise your heels as high as comfortably possible.",
            "Pause at the top.",
            "Lower slowly."
        ],
        commonMistakes: [
            "Bouncing at the bottom.",
            "Using partial range of motion.",
            "Using excessive weight.",
            "Moving the knees unnecessarily."
        ],
        muscles: [
            {
                muscleSlug: "calves",
                role: MuscleRole.PRIMARY,
                region: "Calves",
            },
        ],
    },

    {
        name: "Seated Calf Raise",
        slug: "seated-calf-raise",
        description:
            "A seated calf movement that trains the calf complex with greater knee flexion.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Machine",
        imageUrl: WIKI("Seated_calf_raise.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=JbyjNymZOt0",
        defaultSets: 3,
        repsMin: 12,
        repsMax: 20,
        restSeconds: 60,
        instructions: [
            "Sit on the calf raise machine.",
            "Place the balls of your feet on the platform.",
            "Position the machine pad securely above your knees.",
            "Lower your heels slowly.",
            "Drive through the balls of your feet.",
            "Pause at the top before lowering."
        ],
        commonMistakes: [
            "Using a bouncing motion.",
            "Performing very short repetitions.",
            "Using excessive weight.",
            "Moving the knees excessively."
        ],
        muscles: [
            {
                muscleSlug: "calves",
                role: MuscleRole.PRIMARY,
                region: "Calves",
            },
        ],
    },

    // ===========================================================
    // UPPER ABS
    // ===========================================================

    {
        name: "Cable Crunch",
        slug: "cable-crunch",
        description:
            "A weighted spinal-flexion exercise designed to progressively overload the abdominal muscles.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Cable",
        imageUrl: WIKI("Cable_crunch.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=2fbujeH3F0E",
        defaultSets: 3,
        repsMin: 10,
        repsMax: 15,
        restSeconds: 60,
        instructions: [
            "Attach a rope to a high cable pulley.",
            "Kneel facing the machine.",
            "Hold the rope beside your head.",
            "Brace your abdomen.",
            "Curl your torso downward.",
            "Squeeze your abs at the bottom.",
            "Return slowly."
        ],
        commonMistakes: [
            "Moving mainly through the hips.",
            "Pulling with the arms.",
            "Using excessive weight.",
            "Returning too quickly."
        ],
        muscles: [
            {
                muscleSlug: "upper-abs",
                role: MuscleRole.PRIMARY,
                region: "Upper Abs",
            },
            {
                muscleSlug: "lower-abs",
                role: MuscleRole.SECONDARY,
                region: "Lower Abs",
            },
        ],
    },

    {
        name: "Weighted Crunch",
        slug: "weighted-crunch",
        description:
            "A weighted abdominal crunch that provides additional resistance for progressive core training.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Dumbbell",
        imageUrl: WIKI("Crunch_exercise.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=Xyd_fa5zoEU",
        defaultSets: 3,
        repsMin: 12,
        repsMax: 20,
        restSeconds: 60,
        instructions: [
            "Lie on your back with your knees bent.",
            "Hold a light dumbbell against your chest.",
            "Brace your abdomen.",
            "Curl your upper torso upward.",
            "Squeeze your abdominal muscles.",
            "Lower your shoulders slowly."
        ],
        commonMistakes: [
            "Pulling on the neck.",
            "Using momentum.",
            "Performing excessive range of motion.",
            "Using too much weight."
        ],
        muscles: [
            {
                muscleSlug: "upper-abs",
                role: MuscleRole.PRIMARY,
                region: "Upper Abs",
            },
        ],
    },

    {
        name: "Ab Wheel Rollout",
        slug: "ab-wheel-rollout",
        description:
            "An advanced anti-extension core exercise that challenges the abdominal wall and surrounding stabilizers.",
        difficulty: FitnessLevel.ADVANCED,
        equipment: "Bodyweight",
        imageUrl: WIKI("Ab_wheel_rollout.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=ry5W6gF5r7I",
        defaultSets: 3,
        repsMin: 6,
        repsMax: 12,
        restSeconds: 90,
        instructions: [
            "Kneel with the wheel in front of you.",
            "Grip the handles firmly.",
            "Brace your core and squeeze your glutes.",
            "Roll forward slowly.",
            "Stop before your lower back overextends.",
            "Pull the wheel back toward your knees."
        ],
        commonMistakes: [
            "Allowing the lower back to arch.",
            "Moving too quickly.",
            "Starting with excessive range of motion.",
            "Relaxing the core."
        ],
        muscles: [
            {
                muscleSlug: "upper-abs",
                role: MuscleRole.PRIMARY,
                region: "Upper Abs",
            },
            {
                muscleSlug: "lower-abs",
                role: MuscleRole.SECONDARY,
                region: "Lower Abs",
            },
            {
                muscleSlug: "lats",
                role: MuscleRole.SECONDARY,
                region: "Lats",
            },
        ],
    },

    // ===========================================================
    // LOWER ABS
    // ===========================================================

    {
        name: "Hanging Leg Raise",
        slug: "hanging-leg-raise",
        description:
            "A hanging core exercise involving hip flexion and pelvic control with strong abdominal involvement.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Bodyweight",
        imageUrl: WIKI("Hanging_leg_raise.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=Pr1ieGZ5atk",
        defaultSets: 3,
        repsMin: 8,
        repsMax: 15,
        restSeconds: 75,
        instructions: [
            "Hang from a pull-up bar.",
            "Brace your core.",
            "Keep your legs together.",
            "Raise your legs while controlling the pelvis.",
            "Lift to a comfortable height.",
            "Avoid excessive swinging.",
            "Lower slowly."
        ],
        commonMistakes: [
            "Swinging the legs.",
            "Using momentum.",
            "Only lifting from the hips.",
            "Dropping the legs rapidly."
        ],
        muscles: [
            {
                muscleSlug: "lower-abs",
                role: MuscleRole.PRIMARY,
                region: "Lower Abs",
            },
            {
                muscleSlug: "upper-abs",
                role: MuscleRole.SECONDARY,
                region: "Upper Abs",
            },
        ],
    },

    {
        name: "Reverse Crunch",
        slug: "reverse-crunch",
        description:
            "A bodyweight abdominal exercise emphasizing pelvic curl and lower abdominal control.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Bodyweight",
        imageUrl: WIKI("Reverse_crunch.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=hyv14e2QDq0",
        defaultSets: 3,
        repsMin: 12,
        repsMax: 20,
        restSeconds: 60,
        instructions: [
            "Lie flat on your back.",
            "Bend your knees to approximately 90 degrees.",
            "Brace your abdomen.",
            "Curl your pelvis upward.",
            "Bring your knees toward your chest.",
            "Lower your hips slowly."
        ],
        commonMistakes: [
            "Swinging the legs.",
            "Using momentum.",
            "Lifting the entire back.",
            "Dropping the hips quickly."
        ],
        muscles: [
            {
                muscleSlug: "lower-abs",
                role: MuscleRole.PRIMARY,
                region: "Lower Abs",
            },
            {
                muscleSlug: "upper-abs",
                role: MuscleRole.SECONDARY,
                region: "Upper Abs",
            },
        ],
    },

    {
        name: "Lying Leg Raise",
        slug: "lying-leg-raise",
        description:
            "A bodyweight leg-raising exercise that challenges abdominal control and hip flexion.",
        difficulty: FitnessLevel.BEGINNER,
        equipment: "Bodyweight",
        imageUrl: WIKI("Leg_raise.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=JB2oyawG9KI",
        defaultSets: 3,
        repsMin: 10,
        repsMax: 15,
        restSeconds: 60,
        instructions: [
            "Lie flat on your back.",
            "Keep your legs straight.",
            "Brace your core.",
            "Raise both legs upward.",
            "Stop before the lower back arches excessively.",
            "Lower the legs slowly."
        ],
        commonMistakes: [
            "Arching the lower back.",
            "Using momentum.",
            "Dropping the legs quickly.",
            "Moving only from the hips."
        ],
        muscles: [
            {
                muscleSlug: "lower-abs",
                role: MuscleRole.PRIMARY,
                region: "Lower Abs",
            },
        ],
    },

    // ===========================================================
    // OBLIQUES
    // ===========================================================

    {
        name: "Cable Woodchop",
        slug: "cable-woodchop",
        description:
            "A rotational cable exercise targeting the obliques and broader core musculature.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Cable",
        imageUrl: WIKI("Cable_woodchop.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=pAplQXk3dkU",
        defaultSets: 3,
        repsMin: 10,
        repsMax: 15,
        restSeconds: 60,
        instructions: [
            "Set the cable pulley around shoulder height.",
            "Stand sideways to the machine.",
            "Grip the handle with both hands.",
            "Brace your core.",
            "Rotate your torso away from the cable.",
            "Move the handle diagonally across your body.",
            "Return under control."
        ],
        commonMistakes: [
            "Moving only the arms.",
            "Using excessive weight.",
            "Rotating too aggressively.",
            "Losing core tension."
        ],
        muscles: [
            {
                muscleSlug: "obliques",
                role: MuscleRole.PRIMARY,
                region: "Obliques",
            },
            {
                muscleSlug: "upper-abs",
                role: MuscleRole.SECONDARY,
                region: "Upper Abs",
            },
        ],
    },

    // ===========================================================
    // GLUTES
    // ===========================================================

    {
        name: "Barbell Hip Thrust",
        slug: "barbell-hip-thrust",
        description:
            "A hip-extension exercise designed to strongly train the gluteus maximus.",
        difficulty: FitnessLevel.INTERMEDIATE,
        equipment: "Barbell",
        imageUrl: WIKI("Barbell_hip_thrust.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=xDmFkJxPzeM",
        defaultSets: 4,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 120,
        instructions: [
            "Sit on the floor with your upper back against a bench.",
            "Position the barbell across your hips using padding.",
            "Plant your feet firmly.",
            "Drive through your feet.",
            "Extend your hips upward.",
            "Squeeze the glutes at the top.",
            "Lower your hips under control."
        ],
        commonMistakes: [
            "Hyperextending the lower back.",
            "Placing the feet too far away.",
            "Using excessive weight.",
            "Failing to control the lowering phase."
        ],
        muscles: [
            {
                muscleSlug: "glute-max",
                role: MuscleRole.PRIMARY,
                region: "Glutes",
            },
            {
                muscleSlug: "hamstrings",
                role: MuscleRole.SECONDARY,
                region: "Hamstrings",
            },
        ],
    },

    {
        name: "Dumbbell Bulgarian Split Squat",
        slug: "dumbbell-bulgarian-split-squat",
        description:
            "A unilateral squat variation that strongly trains the quads and glutes while challenging balance.",
        difficulty: FitnessLevel.ADVANCED,
        equipment: "Dumbbell",
        imageUrl: WIKI("Bulgarian_split_squat.jpg"),
        videoUrl:
            "https://www.youtube.com/watch?v=2C-uNgKwPLE",
        defaultSets: 3,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 90,
        instructions: [
            "Stand a short distance in front of a bench.",
            "Place one foot behind you on the bench.",
            "Hold dumbbells at your sides.",
            "Lower your hips toward the floor.",
            "Keep the front knee aligned with the foot.",
            "Drive through the front foot.",
            "Return to the starting position."
        ],
        commonMistakes: [
            "Placing the rear foot too high.",
            "Allowing the front knee to collapse inward.",
            "Using excessive weight.",
            "Losing balance due to poor stance."
        ],
        muscles: [
            {
                muscleSlug: "glute-max",
                role: MuscleRole.PRIMARY,
                region: "Glutes",
            },
            {
                muscleSlug: "quads",
                role: MuscleRole.SECONDARY,
                region: "Quads",
            },
            {
                muscleSlug: "hamstrings",
                role: MuscleRole.SECONDARY,
                region: "Hamstrings",
            },
        ],
    },
];

// =============================================================
// 5. SEED FUNCTION
// =============================================================

async function main() {
    console.log("");
    console.log("==============================================");
    console.log("        FITFORGE DATABASE SEED");
    console.log("==============================================");
    console.log("");
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
    

    // -----------------------------------------------------------
    // EQUIPMENT
    // -----------------------------------------------------------

    console.log("Seeding equipment...");

    const equipmentMap = new Map<string, string>();

    for (const equipment of equipmentData) {
        const record = await prisma.equipment.upsert({
            where: {
                name: equipment.name,
            },
            update: {},
            create: equipment,
        });

        equipmentMap.set(record.name, record.id);

        console.log(`  ✓ Equipment: ${record.name}`);
    }

    // -----------------------------------------------------------
    // MUSCLE GROUPS
    // -----------------------------------------------------------

    console.log("");
    console.log("Seeding muscle groups...");

    const muscleGroupMap = new Map<string, string>();

    for (const group of muscleGroups) {
        const record = await prisma.muscleGroup.upsert({
            where: {
                slug: group.slug,
            },
            update: {
                name: group.name,
            },
            create: group,
        });

        muscleGroupMap.set(record.slug, record.id);

        console.log(`  ✓ Muscle Group: ${record.name}`);
    }

    // -----------------------------------------------------------
    // MUSCLES
    // -----------------------------------------------------------

    console.log("");
    console.log("Seeding muscles / regions...");

    const muscleMap = new Map<string, string>();

    for (const muscle of muscles) {
        const muscleGroupId = muscleGroupMap.get(muscle.groupSlug);

        if (!muscleGroupId) {
            throw new Error(
                `Muscle group not found for muscle: ${muscle.name}`
            );
        }

        const record = await prisma.muscle.upsert({
            where: {
                slug: muscle.slug,
            },
            update: {
                name: muscle.name,
                muscleGroupId,
            },
            create: {
                name: muscle.name,
                slug: muscle.slug,
                muscleGroupId,
            },
        });

        muscleMap.set(record.slug, record.id);

        console.log(`  ✓ Muscle: ${record.name}`);
    }

    // -----------------------------------------------------------
    // EXERCISES
    // -----------------------------------------------------------

    console.log("");
    console.log("Seeding exercises...");

    for (const exercise of exercises) {
        const equipmentId = equipmentMap.get(exercise.equipment);

        if (!equipmentId) {
            throw new Error(
                `Equipment not found for exercise: ${exercise.name}`
            );
        }

        const exerciseRecord = await prisma.exercise.upsert({
            where: {
                slug: exercise.slug,
            },

            update: {
                name: exercise.name,
                description: exercise.description,
                difficulty: exercise.difficulty,
                equipmentId,
                videoUrl: exercise.videoUrl ?? null,
                imageUrl: exercise.imageUrl,
                instructions: exercise.instructions,
                commonMistakes: exercise.commonMistakes,
                defaultSets: exercise.defaultSets,
                repsMin: exercise.repsMin,
                repsMax: exercise.repsMax,
                restSeconds: exercise.restSeconds,
            },

            create: {
                name: exercise.name,
                slug: exercise.slug,
                description: exercise.description,
                difficulty: exercise.difficulty,
                equipmentId,
                videoUrl: exercise.videoUrl ?? null,
                imageUrl: exercise.imageUrl,
                instructions: exercise.instructions,
                commonMistakes: exercise.commonMistakes,
                defaultSets: exercise.defaultSets,
                repsMin: exercise.repsMin,
                repsMax: exercise.repsMax,
                restSeconds: exercise.restSeconds,
            },
        });

        console.log(`  ✓ Exercise: ${exerciseRecord.name}`);

        // ---------------------------------------------------------
        // EXERCISE -> MUSCLE RELATIONSHIPS
        // ---------------------------------------------------------

        for (const muscleRelation of exercise.muscles) {
            const muscleId = muscleMap.get(
                muscleRelation.muscleSlug
            );

            if (!muscleId) {
                throw new Error(
                    `Muscle "${muscleRelation.muscleSlug}" not found for exercise "${exercise.name}"`
                );
            }

            await prisma.exerciseMuscle.upsert({
                where: {
                    exerciseId_muscleId: {
                        exerciseId: exerciseRecord.id,
                        muscleId,
                    },
                },

                update: {
                    role: muscleRelation.role,
                    region: muscleRelation.region ?? null,
                },

                create: {
                    exerciseId: exerciseRecord.id,
                    muscleId,
                    role: muscleRelation.role,
                    region: muscleRelation.region ?? null,
                },
            });
        }
    }

    // -----------------------------------------------------------
    // SUMMARY
    // -----------------------------------------------------------

    const [
        equipmentCount,
        muscleGroupCount,
        muscleCount,
        exerciseCount,
        exerciseMuscleCount,
    ] = await Promise.all([
        prisma.equipment.count(),
        prisma.muscleGroup.count(),
        prisma.muscle.count(),
        prisma.exercise.count(),
        prisma.exerciseMuscle.count(),
    ]);

    console.log("");
    console.log("==============================================");
    console.log("             SEED COMPLETED");
    console.log("==============================================");
    console.log("");
    console.log(`Equipment       : ${equipmentCount}`);
    console.log(`Muscle Groups   : ${muscleGroupCount}`);
    console.log(`Muscles         : ${muscleCount}`);
    console.log(`Exercises       : ${exerciseCount}`);
    console.log(`Muscle Relations: ${exerciseMuscleCount}`);
    console.log("");
}

// =============================================================
// RUN
// =============================================================

main()
    .catch((error) => {
        console.error("");
        console.error("==============================================");
        console.error("             SEED FAILED");
        console.error("==============================================");
        console.error("");
        console.error(error);

        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log("Prisma connection closed.");
    });
