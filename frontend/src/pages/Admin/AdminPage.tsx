import React, { useState } from 'react';
import { ShieldCheck, Plus, Trash2, Edit3, Dumbbell, Utensils } from 'lucide-react';
import { EXERCISE_DATA } from '../../services/Exercises';
import { FOOD_DATABASE } from '../../services/Foods';


export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exercises' | 'foods'>('exercises');
  const [exercisesList, setExercisesList] = useState(EXERCISE_DATA);
  const [foodsList, setFoodsList] = useState(FOOD_DATABASE);

  // Exercise Create Modal State
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('Chest');
  const [newExEquipment, setNewExEquipment] = useState('Barbell');

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `ex_${Date.now()}`,
      name: newExName,
      slug: newExName.toLowerCase().replace(/ /g, '-'),
      primaryMuscle: newExMuscle as any,
      secondaryMuscles: ['Core'],
      equipment: newExEquipment,
      difficulty: 'Intermediate' as const,
      defaultSets: 3,
      defaultReps: '10-12',
      restSeconds: 90,
      caloriesBurnEstimate: '100 kcal',
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      instructions: ['Execute with controlled eccentric tempo.'],
      commonMistakes: ['Rushing reps without lock-out.'],
    };

    setExercisesList([created, ...exercisesList]);
    setNewExName('');
    setIsExerciseModalOpen(false);
  };

  const handleDeleteExercise = (id: string) => {
    setExercisesList(exercisesList.filter(e => e.id !== id));
  };

  const handleDeleteFood = (id: string) => {
    setFoodsList(foodsList.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              Admin Access
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">System Content Manager</h1>
          <p className="text-xs text-slate-400">Create, edit, or remove catalog items from the global database.</p>
        </div>

        {/* Global Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === 'exercises' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell className="h-3.5 w-3.5" />
            Exercises ({exercisesList.length})
          </button>
          <button
            onClick={() => setActiveTab('foods')}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === 'foods' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="h-3.5 w-3.5" />
            Food Library ({foodsList.length})
          </button>
        </div>
      </div>

      {/* Content View */}
      {activeTab === 'exercises' ? (
        <div className="rounded-2xl border border-slate-800/80 bg-[#111827] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white">Exercise Database</h2>
            <button
              onClick={() => setIsExerciseModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add New Exercise
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3">NAME</th>
                  <th className="pb-3">MUSCLE</th>
                  <th className="pb-3">EQUIPMENT</th>
                  <th className="pb-3">DIFFICULTY</th>
                  <th className="pb-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {exercisesList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/40">
                    <td className="py-3 font-semibold text-white">{item.name}</td>
                    <td className="py-3 text-emerald-400 font-medium">{item.primaryMuscle}</td>
                    <td className="py-3 text-slate-400">{item.equipment}</td>
                    <td className="py-3 text-slate-300">{item.difficulty}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteExercise(item.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800/80 bg-[#111827] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white">Food Nutritional Database</h2>
            <span className="text-xs text-slate-500">Macros normalized per standard serving size</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
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
                {foodsList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/40">
                    <td className="py-3 font-semibold text-white">{item.name}</td>
                    <td className="py-3 text-slate-400">{item.servingSize}</td>
                    <td className="py-3 text-emerald-400 font-bold">{item.calories} kcal</td>
                    <td className="py-3 text-slate-300">{item.protein}g</td>
                    <td className="py-3 text-slate-300">{item.carbs}g</td>
                    <td className="py-3 text-slate-300">{item.fat}g</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteFood(item.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {isExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Catalog Exercise</h3>
            <form onSubmit={handleAddExercise} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Exercise Name</label>
                <input
                  type="text"
                  required
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="e.g. Bulgarian Split Squat"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Primary Target Muscle</label>
                <select
                  value={newExMuscle}
                  onChange={(e) => setNewExMuscle(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option>Chest</option>
                  <option>Back</option>
                  <option>Shoulders</option>
                  <option>Quads</option>
                  <option>Hamstrings</option>
                  <option>Biceps</option>
                  <option>Triceps</option>
                  <option>Abs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Equipment</label>
                <input
                  type="text"
                  required
                  value={newExEquipment}
                  onChange={(e) => setNewExEquipment(e.target.value)}
                  placeholder="e.g. Dumbbell & Bench"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExerciseModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                >
                  Add Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};