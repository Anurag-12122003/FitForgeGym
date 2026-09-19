import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Utensils,
  Plus,
  Search,
  Trash2,
  Flame,
  PieChart,
  Sparkles,
  Loader2,
  Check,
  X,
  ChevronRight
} from 'lucide-react';
import { foodApi, type FoodItem } from '../../api/foodApi';
import { dietApi } from '../../api/dietAPi';
import { CreateCustomFoodModal } from './CreateCustomFoodModal';

const MEAL_ORDER = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;

export const NutritionPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Queries
  const { data: dietPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['diet-plans'],
    queryFn: dietApi.getPlans,
  });

  const { data: foodCatalog = [] } = useQuery({
    queryKey: ['foods'],
    queryFn: foodApi.getAll,
  });

  // State
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [activeMealId, setActiveMealId] = useState<string | null>(null);

  // Form states
  const [planName, setPlanName] = useState('');
  const [planGoal, setPlanGoal] = useState('Muscle Gain');
  const [targetCals, setTargetCals] = useState('2400');
  const [targetProt, setTargetProt] = useState('160');
  const [targetCarb, setTargetCarb] = useState('280');
  const [targetFat, setTargetFat] = useState('70');

  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>('BREAKFAST');

  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionAmount, setPortionAmount] = useState<number>(100);
  const [foodSearch, setFoodSearch] = useState('');

  const currentPlan = dietPlans.find((p) => p.id === (selectedPlanId || dietPlans[0]?.id)) || dietPlans[0];

  // Mutations
  const createPlanMutation = useMutation({
    mutationFn: dietApi.createPlan,
    onSuccess: (newPlan) => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      setSelectedPlanId(newPlan.id);
      setIsPlanModalOpen(false);
    },
  });

  const addMealMutation = useMutation({
    mutationFn: ({ planId, payload }: { planId: string; payload: any }) => dietApi.addMeal(planId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      setIsAddMealModalOpen(false);
      setMealName('');
    },
  });

  const addFoodMutation = useMutation({
    mutationFn: ({ mealId, payload }: { mealId: string; payload: any }) => dietApi.addFoodToMeal(mealId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      setIsAddFoodModalOpen(false);
      setSelectedFood(null);
      setPortionAmount(100);
    },
  });

  const removeFoodMutation = useMutation({
    mutationFn: dietApi.removeFoodFromMeal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diet-plans'] }),
  });

  // Calculate Aggregated Nutrients for Active Plan
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  if (currentPlan?.meals) {
    currentPlan.meals.forEach((meal) => {
      meal.foods.forEach((mf) => {
        const factor = mf.quantityAmount / mf.food.servingAmount;
        totalCalories += mf.food.calories * factor;
        totalProtein += mf.food.protein * factor;
        totalCarbs += mf.food.carbs * factor;
        totalFat += mf.food.fat * factor;
      });
    });
  }

  // Percentage distribution calculation for SVG Donut
  const totalMacroGrams = totalProtein + totalCarbs + totalFat || 1;
  const protPct = Math.round((totalProtein / totalMacroGrams) * 100);
  const carbPct = Math.round((totalCarbs / totalMacroGrams) * 100);
  const fatPct = Math.round((totalFat / totalMacroGrams) * 100);

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    createPlanMutation.mutate({
      name: planName,
      goal: planGoal,
      targetCalories: parseFloat(targetCals),
      targetProtein: parseFloat(targetProt),
      targetCarbs: parseFloat(targetCarb),
      targetFat: parseFloat(targetFat),
    });
  };

  const handleAddFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMealId || !selectedFood) return;
    addFoodMutation.mutate({
      mealId: activeMealId,
      payload: {
        foodId: selectedFood.id,
        quantityAmount: portionAmount,
      },
    });
  };

  if (plansLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <p className="text-xs">Loading precision nutrition architecture...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-100">

      {/* 1. Header & Plan Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Macro Architecture
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Diet & Nutrition Planner
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fuel your body. Track calories, micronutrients, and precision macro allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {dietPlans.length > 0 && (
            <select
              value={currentPlan?.id}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
            >
              {dietPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({plan.targetCalories} kcal)
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            New Diet Plan
          </button>
        </div>
      </div>

      {!currentPlan ? (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-[#111827] p-12 text-center">
          <Utensils className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Nutrition Plan Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            Initialize your macro target goals and allocate structured daily meals.
          </p>
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
          >
            Create First Plan
          </button>
        </div>
      ) : (
        <>
          {/* 2. Top Metric Targets & Radial Donut Row [Reference UI] */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* Left Column: Daily Target Metric Circles */}
            <div className="lg:col-span-8 rounded-3xl border border-slate-800/80 bg-[#111827] p-6 flex flex-col justify-between space-y-6[cite: 3]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Daily Targets[cite: 3]
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Goal: <strong className="text-slate-200">{currentPlan.goal || 'Hypertrophy'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {/* Calories */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full border-2 border-emerald-500/30 flex items-center justify-center bg-emerald-500/10 mb-2">
                    <span className="text-sm font-black text-emerald-400">{Math.round(totalCalories)}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calories</span>
                  <span className="text-xs font-extrabold text-white mt-0.5">/ {currentPlan.targetCalories} kcal</span>
                </div>

                {/* Protein */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full border-2 border-emerald-500/30 flex items-center justify-center bg-emerald-500/10 mb-2">
                    <span className="text-sm font-black text-emerald-400">{Math.round(totalProtein)}g</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Protein</span>
                  <span className="text-xs font-extrabold text-white mt-0.5">/ {currentPlan.targetProtein}g</span>
                </div>

                {/* Carbs */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full border-2 border-cyan-500/30 flex items-center justify-center bg-cyan-500/10 mb-2">
                    <span className="text-sm font-black text-cyan-400">{Math.round(totalCarbs)}g</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Carbs</span>
                  <span className="text-xs font-extrabold text-white mt-0.5">/ {currentPlan.targetCarbs}g</span>
                </div>

                {/* Fat */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full border-2 border-amber-500/30 flex items-center justify-center bg-amber-500/10 mb-2">
                    <span className="text-sm font-black text-amber-400">{Math.round(totalFat)}g</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fat</span>
                  <span className="text-xs font-extrabold text-white mt-0.5">/ {currentPlan.targetFat}g</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Remaining Energy Allowance:</span>
                <span className="font-bold text-emerald-400">
                  {Math.max(0, currentPlan.targetCalories - Math.round(totalCalories))} kcal
                </span>
              </div>
            </div>

            {/* Right Column: Macro Breakdown Radial Donut Visualizer [Reference UI] */}
            <div className="lg:col-span-4 rounded-3xl border border-slate-800/80 bg-[#111827] p-6 flex flex-col justify-between[cite: 3]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Macro Breakdown</h3>
                <PieChart className="h-4 w-4 text-emerald-400" />
              </div>

              {/* Visual Radial Ring */}
              <div className="py-4 flex flex-col items-center justify-center">
                <div className="relative h-32 w-32 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500 transition-all duration-500"
                      strokeDasharray={`${protPct}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-black text-white">{Math.round(totalCalories)}</span>
                    <span className="text-[9px] uppercase tracking-wider block text-slate-400">kcal</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="grid grid-cols-3 gap-2 w-full pt-4 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Protein</span>
                    <strong className="text-emerald-400">{protPct}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Carbs</span>
                    <strong className="text-cyan-400">{carbPct}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Fat</span>
                    <strong className="text-amber-400">{fatPct}%</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">Balanced macronutrient profile</span>
              </div>
            </div>

          </div>

          {/* 3. Meal Periods Section & Visual Food Diary[cite: 3] */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Meal Schedule & Food Diary ({currentPlan.meals?.length || 0})[cite: 3]
              </h2>
              <button
                onClick={() => setIsAddMealModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-400" />
                Add Meal Period
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {currentPlan.meals?.map((meal) => {
                const mealCals = Math.round(
                  meal.foods.reduce((acc, mf) => acc + (mf.food.calories * mf.quantityAmount) / mf.food.servingAmount, 0)
                );

                return (
                  <div
                    key={meal.id}
                    className="rounded-3xl border border-slate-800/80 bg-[#111827] p-5 flex flex-col justify-between space-y-4 shadow-lg"
                  >
                    <div>
                      {/* Meal Period Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Utensils className="h-4 w-4 text-emerald-400" />
                          <h3 className="text-sm font-bold text-white">{meal.name}</h3>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-semibold">
                            {meal.type}
                          </span>
                        </div>
                        <span className="text-xs font-black text-emerald-400">{mealCals} kcal</span>
                      </div>

                      {/* Food Items Cards */}
                      <div className="space-y-2.5">
                        {meal.foods.length === 0 ? (
                          <p className="text-xs text-slate-500 py-6 text-center italic">
                            No foods allocated to this meal. Click below to add.
                          </p>
                        ) : (
                          meal.foods.map((mf) => {
                            const factor = mf.quantityAmount / mf.food.servingAmount;
                            const cals = Math.round(mf.food.calories * factor);
                            const prot = Math.round(mf.food.protein * factor);

                            return (
                              <div
                                key={mf.id}
                                className="group flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {/* Dish Image Thumbnail */}
                                  <div className="h-11 w-11 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                                    <img
                                      src={
                                        mf.food.imageUrl ||
                                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80'
                                      }
                                      alt={mf.food.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>

                                  <div className="truncate">
                                    <p className="text-xs font-bold text-white truncate">
                                      {mf.food.name}{' '}
                                      <span className="text-emerald-400 font-mono font-normal">
                                        ({mf.quantityAmount}g)
                                      </span>
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                      {cals} kcal • P: {prot}g | C: {Math.round(mf.food.carbs * factor)}g | F: {Math.round(mf.food.fat * factor)}g
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={() => removeFoodMutation.mutate(mf.id)}
                                  className="text-slate-600 hover:text-red-400 p-1.5 transition"
                                  title="Remove item"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveMealId(meal.id);
                        setIsAddFoodModalOpen(true);
                      }}
                      className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-xs font-bold text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Food to {meal.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Bottom Motivation Banner[cite: 3] */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-[#111827] via-[#0B0F19] to-[#040711] p-6 flex items-center justify-between[cite: 3]">
            <div className="max-w-md space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Nutritional Discipline</span>
              <h4 className="text-lg font-black text-white">Better Food, Bigger Goals[cite: 3]</h4>
              <p className="text-xs text-slate-400">Whole food nutrition combined with steady caloric pacing fuels peak performance[cite: 3].</p>
            </div>
            <div className="h-14 w-14 rounded-2xl overflow-hidden border border-slate-700 hidden sm:block">
              <img
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=200&q=80"
                alt="Health bowl"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </>
      )}

      {/* 1. Modal: Create Diet Plan */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create New Diet Plan</h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Plan Title</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. 2400 kcal Hypertrophy Cut"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Calorie Target (kcal)</label>
                <input
                  type="number"
                  required
                  value={targetCals}
                  onChange={(e) => setTargetCals(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={targetProt}
                    onChange={(e) => setTargetProt(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={targetCarb}
                    onChange={(e) => setTargetCarb(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={targetFat}
                    onChange={(e) => setTargetFat(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createPlanMutation.isPending}
                className="w-full mt-3 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                {createPlanMutation.isPending ? 'Saving Plan...' : 'Create Plan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Add Meal Category */}
      {isAddMealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Add Meal Period</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Meal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Post-Workout Snack"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white"
                >
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                  <option value="SNACK">Snack</option>
                </select>
              </div>
              <div className='flex gap-2'>

                <button
                  disabled={addMealMutation.isPending}
                  onClick={() => {
                    if (currentPlan && mealName) {
                      addMealMutation.mutate({
                        planId: currentPlan.id,
                        payload: { name: mealName, type: mealType, order: (currentPlan.meals?.length || 0) + 1 },
                      });
                    }
                  }}
                  className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
                >
                  {addMealMutation.isPending ? 'Saving...' : 'Save Meal'}
                </button>
                <button
                  onClick={() => setIsAddMealModalOpen(false)}
                  className="w-full rounded-xl bg-gray-500 py-3 text-xs font-bold text-white hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Add Catalog Food with Gram Multiplier */}
      {isAddFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Select Food & Set Quantity</h3>
              <button
                onClick={() => {
                  setIsAddFoodModalOpen(false);
                  setSelectedFood(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!selectedFood ? (
              <div className="space-y-3 flex-1 flex flex-col min-h-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddFoodModalOpen(false);
                    setIsCustomFoodModalOpen(true);
                  }}
                  className="w-full p-2.5 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Can't find item? Add Custom Food
                </button>

                <div className="relative">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search verified foods..."
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 pl-9 pr-4 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent">
                  {foodCatalog
                    .filter((f) => f.name.toLowerCase().includes(foodSearch.toLowerCase()))
                    .map((food) => (
                      <div
                        key={food.id}
                        onClick={() => setSelectedFood(food)}
                        className="cursor-pointer flex items-center justify-between p-3 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{food.name}</p>
                          <p className="text-[10px] text-slate-400">
                            Base: {food.servingAmount}{food.servingUnit} • P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">{food.calories} kcal</span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddFoodSubmit} className="space-y-4">
                <div className="rounded-2xl bg-slate-900 p-4 border border-slate-800">
                  <h4 className="text-sm font-bold text-white">{selectedFood.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Standard serving base: {selectedFood.servingAmount}{selectedFood.servingUnit}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Portion Quantity ({selectedFood.servingUnit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={portionAmount}
                    onChange={(e) => setPortionAmount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Real-time Math Display */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1 text-xs">
                  <p className="font-bold text-emerald-400">Calculated for {portionAmount}g:</p>
                  <div className="flex justify-between text-slate-300 text-[11px] pt-1">
                    <span>Cals: <strong>{Math.round((selectedFood.calories * portionAmount) / selectedFood.servingAmount)} kcal</strong></span>
                    <span>Prot: <strong>{Math.round((selectedFood.protein * portionAmount) / selectedFood.servingAmount)}g</strong></span>
                    <span>Carbs: <strong>{Math.round((selectedFood.carbs * portionAmount) / selectedFood.servingAmount)}g</strong></span>
                    <span>Fat: <strong>{Math.round((selectedFood.fat * portionAmount) / selectedFood.servingAmount)}g</strong></span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFood(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={addFoodMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                  >
                    {addFoodMutation.isPending ? 'Adding...' : 'Confirm & Add'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. Custom Food Modal */}
      <CreateCustomFoodModal
        isOpen={isCustomFoodModalOpen}
        onClose={() => setIsCustomFoodModalOpen(false)}
        onCreated={(newFood) => {
          setSelectedFood(newFood);
          setPortionAmount(newFood.servingAmount || 100);
          setIsAddFoodModalOpen(true);
        }}
      />
    </div>
  );
};