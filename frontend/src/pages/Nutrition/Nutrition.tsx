import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Utensils, X } from 'lucide-react';
import React, { useState } from 'react';
import { dietApi } from '../../api/dietAPi';
import { foodApi, type FoodItem, } from '../../api/foodApi';

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

  // Local Selection State
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [activeMealId, setActiveMealId] = useState<string | null>(null);

  // New Plan Form States
  const [planName, setPlanName] = useState('');
  const [planGoal, setPlanGoal] = useState('Muscle Gain');
  const [targetCals, setTargetCals] = useState('2400');
  const [targetProt, setTargetProt] = useState('160');
  const [targetCarb, setTargetCarb] = useState('280');
  const [targetFat, setTargetFat] = useState('70');

  // Meal Form States
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>('BREAKFAST');

  // Food Portion Form States
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionAmount, setPortionAmount] = useState<number>(100);
  const [foodSearch, setFoodSearch] = useState('');

  // Active Plan determination
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
    return <div className="p-8 text-center text-slate-400">Loading your customized nutrition plans...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header & Plan Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Diet & Meal Planner</h1>
          <p className="text-xs text-slate-400 mt-1">
            Build and manage your personalized meal schedules with precision gram calculations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {dietPlans.length > 0 && (
            <select
              value={currentPlan?.id}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none"
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
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            New Diet Plan
          </button>
        </div>
      </div>

      {!currentPlan ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-[#111827] p-12 text-center">
          <Utensils className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Diet Plan Created Yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Create your first custom diet plan to allocate meals and calculate macros.
          </p>
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
          >
            Create Diet Plan
          </button>
        </div>
      ) : (
        <>
          {/* Target Macro Breakdown Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Calorie Ring Summary */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-800/80 bg-[#111827] p-6 text-center flex flex-col justify-center items-center">
              <div className="h-32 w-32 rounded-full border-4 border-slate-800 border-t-emerald-500 border-r-emerald-500 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{Math.round(totalCalories)}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">/ {currentPlan.targetCalories} kcal</span>
              </div>
              <p className="text-xs font-semibold text-emerald-400 mt-3">
                {Math.max(0, currentPlan.targetCalories - Math.round(totalCalories))} kcal Remaining
              </p>
            </div>

            {/* Macro Bars */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-800/80 bg-[#111827] p-6 space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Macronutrient Targets</p>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Protein (Target: {currentPlan.targetProtein}g)</span>
                  <span className="text-emerald-400">{Math.round(totalProtein)}g</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totalProtein / currentPlan.targetProtein) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Carbohydrates (Target: {currentPlan.targetCarbs}g)</span>
                  <span className="text-cyan-400">{Math.round(totalCarbs)}g</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totalCarbs / currentPlan.targetCarbs) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Fats (Target: {currentPlan.targetFat}g)</span>
                  <span className="text-amber-400">{Math.round(totalFat)}g</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totalFat / currentPlan.targetFat) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Meals List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-white">Configured Meals ({currentPlan.meals?.length || 0})</h2>
              <button
                onClick={() => setIsAddMealModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
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
                  <div key={meal.id} className="rounded-2xl border border-slate-800/80 bg-[#111827] p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Utensils className="h-4 w-4 text-emerald-400" />
                          <h3 className="text-sm font-bold text-white">{meal.name}</h3>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">
                            {meal.type}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">{mealCals} kcal</span>
                      </div>

                      {/* Line Items with Gram Details */}
                      <div className="space-y-2">
                        {meal.foods.map((mf) => {
                          const factor = mf.quantityAmount / mf.food.servingAmount;
                          const cals = Math.round(mf.food.calories * factor);
                          const prot = Math.round(mf.food.protein * factor);

                          return (
                            <div key={mf.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                              <div>
                                <p className="text-xs font-semibold text-white">
                                  {mf.food.name}{' '}
                                  <span className="text-emerald-400 font-bold">({mf.quantityAmount}g)</span>
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {cals} kcal • P: {prot}g | C: {Math.round(mf.food.carbs * factor)}g | F: {Math.round(mf.food.fat * factor)}g
                                </p>
                              </div>
                              <button
                                onClick={() => removeFoodMutation.mutate(mf.id)}
                                className="text-slate-600 hover:text-red-400 p-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveMealId(meal.id);
                        setIsAddFoodModalOpen(true);
                      }}
                      className="mt-4 flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5 text-emerald-400" />
                      Add Food to {meal.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 1. Modal: Create Diet Plan */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4">
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
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
                className="w-full mt-3 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                Create Plan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Add Meal Category */}
      {isAddMealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4">
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

              <button
                onClick={() => {
                  if (currentPlan && mealName) {
                    addMealMutation.mutate({
                      planId: currentPlan.id,
                      payload: { name: mealName, type: mealType, order: 1 },
                    });
                  }
                }}
                className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                Save Meal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Add Catalog Food with Gram Multiplier */}
      {isAddFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
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
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search verified catalog foods..."
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 pl-9 pr-4 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {foodCatalog
                    .filter((f) => f.name.toLowerCase().includes(foodSearch.toLowerCase()))
                    .map((food) => (
                      <div
                        key={food.id}
                        onClick={() => setSelectedFood(food)}
                        className="cursor-pointer flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{food.name}</p>
                          <p className="text-[10px] text-slate-400">
                            Base: {food.servingAmount}
                            {food.servingUnit} • P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">{food.calories} kcal</span>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              /* Gram Portion Adjuster */
              <form onSubmit={handleAddFoodSubmit} className="space-y-4">
                <div className="rounded-xl bg-slate-900 p-4 border border-slate-800">
                  <h4 className="text-sm font-bold text-white">{selectedFood.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Normalized per {selectedFood.servingAmount}
                    {selectedFood.servingUnit}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Enter Quantity ({selectedFood.servingUnit})
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

                {/* Realtime Deterministic Calculation Box */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1 text-xs">
                  <p className="font-semibold text-emerald-400">Calculated Nutrients for {portionAmount}g:</p>
                  <div className="flex justify-between text-slate-300 text-[11px]">
                    <span>
                      Calories: <strong>{Math.round((selectedFood.calories * portionAmount) / selectedFood.servingAmount)} kcal</strong>
                    </span>
                    <span>
                      Protein: <strong>{Math.round((selectedFood.protein * portionAmount) / selectedFood.servingAmount)}g</strong>
                    </span>
                    <span>
                      Carbs: <strong>{Math.round((selectedFood.carbs * portionAmount) / selectedFood.servingAmount)}g</strong>
                    </span>
                    <span>
                      Fat: <strong>{Math.round((selectedFood.fat * portionAmount) / selectedFood.servingAmount)}g</strong>
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFood(null)}
                    className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                  >
                    Confirm & Add
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};