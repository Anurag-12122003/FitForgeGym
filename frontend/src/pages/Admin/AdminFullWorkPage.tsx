import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Dumbbell,
    Flame,
    Loader2,
    Plus,
    ShieldAlert,
    Trash2,
    TrendingUp,
    Users,
    Utensils,
    X
} from 'lucide-react';
import React, { useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { exerciseApi } from '../../api/exerciseApi';
import { foodApi } from '../../api/foodApi';

const USER_REGISTRATION_TRENDS = [
  { month: 'Jan', users: 140 },
  { month: 'Feb', users: 280 },
  { month: 'Mar', users: 510 },
  { month: 'Apr', users: 840 },
  { month: 'May', users: 1290 },
  { month: 'Jun', users: 1850 },
];

export const AdminFullWorkPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'exercises' | 'foods'>('analytics');

  // React Query Calls
  const { data: exercisesList = [], isLoading: loadingExercises } = useQuery({
    queryKey: ['admin-exercises'],
    queryFn: exerciseApi.getAll,
  });

  const { data: foodsList = [], isLoading: loadingFoods } = useQuery({
    queryKey: ['admin-foods'],
    queryFn: foodApi.getAll,
  });

  // Exercise Form Modal State
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exName, setExName] = useState('');
  const [exDifficulty, setExDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [exSets, setExSets] = useState(3);
  const [exRepsMin, setExRepsMin] = useState(8);
  const [exRepsMax, setExRepsMax] = useState(12);
  const [exRest, setExRest] = useState(90);
  const [exPreviewUrl, setExPreviewUrl] = useState<string | null>(null);

  // Food Form Modal State
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [foodServing, setFoodServing] = useState('100');
  const [foodUnit, setFoodUnit] = useState('g');
  const [foodCalories, setFoodCalories] = useState('');
  const [foodProtein, setFoodProtein] = useState('');
  const [foodCarbs, setFoodCarbs] = useState('');
  const [foodFat, setFoodFat] = useState('');
  const [foodFiber, setFoodFiber] = useState('0');
  const [foodPreviewUrl, setFoodPreviewUrl] = useState<string | null>(null);

  // Mutations
  const createExerciseMutation = useMutation({
    mutationFn: exerciseApi.createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exercises'] });
      setIsExerciseModalOpen(false);
      resetExerciseForm();
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: exerciseApi.deleteAdmin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-exercises'] }),
  });

  const createFoodMutation = useMutation({
    mutationFn: foodApi.createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
      setIsFoodModalOpen(false);
      resetFoodForm();
    },
  });

  const deleteFoodMutation = useMutation({
    mutationFn: foodApi.deleteAdmin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-foods'] }),
  });

  const resetExerciseForm = () => {
    setExName('');
    setExPreviewUrl(null);
  };

  const resetFoodForm = () => {
    setFoodName('');
    setFoodCalories('');
    setFoodProtein('');
    setFoodCarbs('');
    setFoodFat('');
    setFoodFiber('0');
    setFoodPreviewUrl(null);
  };

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    createExerciseMutation.mutate({
      name: exName,
      difficulty: exDifficulty,
      primaryMuscleId: 'pec-major-mock', // default seeded muscle ID
      secondaryMuscleIds: [],
      defaultSets: Number(exSets),
      repsMin: Number(exRepsMin),
      repsMax: Number(exRepsMax),
      restSeconds: Number(exRest),
      imageUrl: exPreviewUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      instructions: ['Control eccentric movement phase.'],
      commonMistakes: ['Rushing sets without full lockout.'],
    });
  };

  const handleCreateFood = (e: React.FormEvent) => {
    e.preventDefault();
    createFoodMutation.mutate({
      name: foodName,
      servingAmount: parseFloat(foodServing),
      servingUnit: foodUnit,
      calories: parseFloat(foodCalories),
      protein: parseFloat(foodProtein),
      carbs: parseFloat(foodCarbs),
      fat: parseFloat(foodFat),
      fiber: parseFloat(foodFiber),
      imageUrl: foodPreviewUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <ShieldAlert className="h-3.5 w-3.5" />
            FitForge Administrator Console
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Platform Operations & Catalog</h1>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'exercises' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Exercises ({exercisesList.length})
          </button>
          <button
            onClick={() => setActiveTab('foods')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'foods' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Food Catalog ({foodsList.length})
          </button>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
          <div className="flex justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Athletes</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">1,850</p>
          <p className="text-[10px] text-emerald-400 mt-1 font-semibold">↑ +24% this month</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
          <div className="flex justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Database Exercises</span>
            <Dumbbell className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{exercisesList.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Synced with MySQL</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
          <div className="flex justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Food Catalog</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{foodsList.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Normalized portions</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
          <div className="flex justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">System Status</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">100%</p>
          <p className="text-[10px] text-slate-400 mt-1">API Connected</p>
        </div>
      </div>

      {/* Tab 1: Analytics */}
      {activeTab === 'analytics' && (
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Registered Athletes Trajectory</h2>
            <p className="text-xs text-slate-400">Platform user growth metrics</p>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={USER_REGISTRATION_TRENDS}>
                <defs>
                  <linearGradient id="userGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} fill="url(#userGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 2: Exercise Catalog */}
      {activeTab === 'exercises' && (
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Verified Exercise Catalog</h2>
              <p className="text-xs text-slate-400">Target muscle volumes and structured repetition ranges</p>
            </div>
            <button
              onClick={() => setIsExerciseModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              <Plus className="h-4 w-4" />
              Add Exercise
            </button>
          </div>

          {loadingExercises ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3">MEDIA</th>
                    <th className="pb-3">NAME</th>
                    <th className="pb-3">DIFFICULTY</th>
                    <th className="pb-3">REPS RANGE</th>
                    <th className="pb-3">REST</th>
                    <th className="pb-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {exercisesList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5">
                        <img src={item.imageUrl} alt="" className="h-10 w-12 rounded-lg object-cover bg-slate-900" />
                      </td>
                      <td className="py-2.5 font-semibold text-white">{item.name}</td>
                      <td className="py-2.5 text-slate-300">{item.difficulty}</td>
                      <td className="py-2.5 text-emerald-400 font-bold">
                        {item.defaultSets} × {item.repsMin}-{item.repsMax} reps
                      </td>
                      <td className="py-2.5 text-slate-400">{item.restSeconds}s</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => deleteExerciseMutation.mutate(item.id)}
                          disabled={deleteExerciseMutation.isPending}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Food Catalog */}
      {activeTab === 'foods' && (
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Food Nutritional Catalog</h2>
              <p className="text-xs text-slate-400">Normalized portions with protein, carbs, fat, and fiber</p>
            </div>
            <button
              onClick={() => setIsFoodModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              <Plus className="h-4 w-4" />
              Add Food
            </button>
          </div>

          {loadingFoods ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3">MEDIA</th>
                    <th className="pb-3">FOOD ITEM</th>
                    <th className="pb-3">SERVING</th>
                    <th className="pb-3">CALORIES</th>
                    <th className="pb-3">PROTEIN</th>
                    <th className="pb-3">CARBS</th>
                    <th className="pb-3">FAT</th>
                    <th className="pb-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {foodsList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5">
                        <img
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80'}
                          alt=""
                          className="h-10 w-12 rounded-lg object-cover bg-slate-900"
                        />
                      </td>
                      <td className="py-3 font-semibold text-white">{item.name}</td>
                      <td className="py-3 text-slate-400">
                        {item.servingAmount} {item.servingUnit}
                      </td>
                      <td className="py-3 text-emerald-400 font-bold">{item.calories} kcal</td>
                      <td className="py-3 text-slate-300">{item.protein}g</td>
                      <td className="py-3 text-slate-300">{item.carbs}g</td>
                      <td className="py-3 text-slate-300">{item.fat}g</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteFoodMutation.mutate(item.id)}
                          disabled={deleteFoodMutation.isPending}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Exercise */}
      {isExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-emerald-400" />
                Add Catalog Movement
              </h3>
              <button onClick={() => setIsExerciseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExercise} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Exercise Title</label>
                <input
                  type="text"
                  required
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  placeholder="e.g. Incline Dumbbell Press"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Sets</label>
                  <input
                    type="number"
                    value={exSets}
                    onChange={(e) => setExSets(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Min Reps</label>
                  <input
                    type="number"
                    value={exRepsMin}
                    onChange={(e) => setExRepsMin(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Max Reps</label>
                  <input
                    type="number"
                    value={exRepsMax}
                    onChange={(e) => setExRepsMax(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Rest Interval (Seconds)</label>
                <input
                  type="number"
                  value={exRest}
                  onChange={(e) => setExRest(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={createExerciseMutation.isPending}
                className="w-full mt-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                {createExerciseMutation.isPending ? 'Publishing...' : 'Save to MySQL Database'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Food */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Utensils className="h-4 w-4 text-emerald-400" />
                Add Food to Catalog
              </h3>
              <button onClick={() => setIsFoodModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFood} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. Paneer (Low Fat)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Serving Amount</label>
                  <input
                    type="number"
                    value={foodServing}
                    onChange={(e) => setFoodServing(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Unit</label>
                  <select
                    value={foodUnit}
                    onChange={(e) => setFoodUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="scoop">Scoop</option>
                    <option value="piece">Piece</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    value={foodCalories}
                    onChange={(e) => setFoodCalories(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    required
                    value={foodProtein}
                    onChange={(e) => setFoodProtein(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    required
                    value={foodCarbs}
                    onChange={(e) => setFoodCarbs(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    required
                    value={foodFat}
                    onChange={(e) => setFoodFat(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createFoodMutation.isPending}
                className="w-full mt-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                {createFoodMutation.isPending ? 'Publishing...' : 'Save Food to Catalog'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};