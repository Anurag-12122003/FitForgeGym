import { prisma } from "../src/config/database";

async function clearAppDataKeepingUsers() {
  console.log('🧹 Clearing application data (keeping Users intact)...');

  // Delete in correct order to respect foreign key constraints
  await prisma.progressRecord.deleteMany({});
  await prisma.nutritionLogItem.deleteMany({});
  await prisma.nutritionLog.deleteMany({});
  await prisma.mealFood.deleteMany({});
  await prisma.meal.deleteMany({});
  await prisma.dietPlan.deleteMany({});
  await prisma.food.deleteMany({});
  
  await prisma.workoutSet.deleteMany({});
  await prisma.workoutSession.deleteMany({});
  await prisma.routineExercise.deleteMany({});
  await prisma.routineDay.deleteMany({});
  await prisma.routine.deleteMany({});
  
  await prisma.workoutExercise.deleteMany({});
  await prisma.workoutDay.deleteMany({});
  await prisma.workoutPlan.deleteMany({});
  
  await prisma.exerciseMuscle.deleteMany({});
  await prisma.exercise.deleteMany({});
  await prisma.equipment.deleteMany({});
  await prisma.muscle.deleteMany({});
  await prisma.muscleGroup.deleteMany({});
  await prisma.profile.deleteMany({});

  console.log('✅ All fitness catalogs, workouts, diets, and profiles cleared! Users are safe.');
}

clearAppDataKeepingUsers()
  .catch((e) => console.error('❌ Error clearing data:', e))
  .finally(async () => await prisma.$disconnect());