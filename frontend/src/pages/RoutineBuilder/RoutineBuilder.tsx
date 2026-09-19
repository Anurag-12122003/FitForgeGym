import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // 1. Import useLocation
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Moon, Dumbbell, Save, Check, X, Tag, ArrowLeft } from 'lucide-react';
import { routineApi, type RoutineDayPayload } from '../../api/routineApi';
import { exerciseApi, type ExerciseItem } from '../../api/exerciseApi';
import { useNavigate } from 'react-router-dom';
import {CreateCustomExerciseModal} from '../Exercises/CreateCustomExerciseModal';

// Standard Muscle List for Selection
const AVAILABLE_MUSCLES = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Quads',
  'Hamstrings',
  'Abs',
  'Calves',
];

// Target muscles ko state me track karne ke liye interface extend kiya
interface CustomRoutineDay extends RoutineDayPayload {
  selectedMuscles?: string[];
}

const DEFAULT_DAYS: CustomRoutineDay[] = [
  { dayOfWeek: 'MONDAY', name: 'Chest & Biceps', isRestDay: false, selectedMuscles: ['Chest', 'Biceps'], exercises: [] },
  { dayOfWeek: 'TUESDAY', name: 'Back & Triceps', isRestDay: false, selectedMuscles: ['Back', 'Triceps'], exercises: [] },
  { dayOfWeek: 'WEDNESDAY', name: 'Active Recovery', isRestDay: false, selectedMuscles: [], exercises: [] },
  { dayOfWeek: 'THURSDAY', name: 'Legs & Core', isRestDay: false, selectedMuscles: ['Quads', 'Hamstrings', 'Abs'], exercises: [] },
  { dayOfWeek: 'FRIDAY', name: 'Shoulders & Arms', isRestDay: false, selectedMuscles: ['Shoulders', 'Biceps', 'Triceps'], exercises: [] },
  { dayOfWeek: 'SATURDAY', name: 'Full Body Density', isRestDay: false, selectedMuscles: ['Chest', 'Back', 'Quads'], exercises: [] },
  { dayOfWeek: 'SUNDAY', name: 'Rest Day', isRestDay: false, selectedMuscles: [], exercises: [] },
];

export const RoutineBuilderPage: React.FC = () => {
 const queryClient = useQueryClient();
  const location = useLocation(); // 2. Hook initialize
  const navigate=useNavigate()

  // Check if a template was passed from WorkoutsPage
  const incomingTemplate = (location.state as any)?.templatePlan;

  const [routineName, setRoutineName] = useState(
    incomingTemplate?.title ? `${incomingTemplate.title} (Custom)` : 'My Hypertrophy Split'
  );
  const [routineDays, setRoutineDays] = useState<CustomRoutineDay[]>(
    incomingTemplate?.days?.length ? incomingTemplate.days : DEFAULT_DAYS
  );
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [isCustomExerciseModalOpen,setIsCustomExerciseModalOpen]=useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync if location state changes dynamically
  useEffect(() => {
    if (incomingTemplate) {
      setRoutineName(`${incomingTemplate.title} (Custom)`);
      if (incomingTemplate.days && incomingTemplate.days.length > 0) {
        setRoutineDays(incomingTemplate.days);
      }
    }
  }, [location.state]);

  // Backend Exercise List fetch
  const { data: catalogExercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: exerciseApi.getAll,
  });

  const saveMutation = useMutation({
    mutationFn: routineApi.saveRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-routines'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    },
  });

  const currentDay = routineDays[selectedDayIdx];
  const currentMuscles = currentDay.selectedMuscles || [];

  // Toggle Muscle selection (Limit: Max 3)
  const handleToggleMuscle = (muscle: string) => {
    const updated = [...routineDays];
    let dayMuscles = [...(updated[selectedDayIdx].selectedMuscles || [])];

    if (dayMuscles.includes(muscle)) {
      dayMuscles = dayMuscles.filter((m) => m !== muscle);
    } else {
      if (dayMuscles.length >= 3) {
        alert('You can select a maximum of 3 target muscles per day.');
        return;
      }
      dayMuscles.push(muscle);
    }

    updated[selectedDayIdx].selectedMuscles = dayMuscles;

    // Auto-update Day Title if not a rest day
    if (!updated[selectedDayIdx].isRestDay && dayMuscles.length > 0) {
      updated[selectedDayIdx].name = dayMuscles.join(' & ');
    }

    setRoutineDays(updated);
  };

  const handleToggleRest = () => {
    const updated = [...routineDays];
    const nextRestState = !updated[selectedDayIdx].isRestDay;
    updated[selectedDayIdx].isRestDay = nextRestState;

    if (nextRestState) {
      updated[selectedDayIdx].name = 'Rest & Recovery';
    } else {
      const muscles = updated[selectedDayIdx].selectedMuscles || [];
      updated[selectedDayIdx].name = muscles.length > 0 ? muscles.join(' & ') : 'Custom Split';
    }
    setRoutineDays(updated);
  };

  const handleAddExercise = (exercise: ExerciseItem) => {
    const updated = [...routineDays];
    updated[selectedDayIdx].exercises.push({
      exerciseId: exercise.id,
      order: updated[selectedDayIdx].exercises.length + 1,
      sets: exercise.defaultSets,
      repsMin: exercise.repsMin,
      repsMax: exercise.repsMax,
      restSeconds: exercise.restSeconds,
    });
    setRoutineDays(updated);
    setIsPickerOpen(false);
  };

  const handleRemoveExercise = (idx: number) => {
    const updated = [...routineDays];
    updated[selectedDayIdx].exercises.splice(idx, 1);
    setRoutineDays(updated);
  };

  const handleSave = () => {
    // Backend payload me pure clean fields pass karenge
    saveMutation.mutate({
      name: routineName,
      days: routineDays.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        name: d.name,
        isRestDay: d.isRestDay,
        exercises: d.exercises,
      })),
    });
  };

  // Filter Catalog Exercises based on Selected Day's Targeted Muscles
  const filteredCatalog = catalogExercises.filter((ex) => {
    if (currentMuscles.length === 0) return true; // Agar koi muscle select nahi kiya, to all exercises show honge

    const primaryMuscle = ex.muscles?.find((m) => m.role === 'PRIMARY')?.muscle.name.toLowerCase() || '';
    const secondaryMuscles = ex.muscles?.filter((m) => m.role === 'SECONDARY').map((m) => m.muscle.name.toLowerCase()) || [];

    return currentMuscles.some(
      (m) => primaryMuscle.includes(m.toLowerCase()) || secondaryMuscles.some((sec) => sec.includes(m.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <button
        onClick={() => navigate('/workouts')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workout
      </button>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Custom Routine Builder</h1>
          <input
            type="text"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            className="mt-1 bg-transparent text-sm text-emerald-400 font-bold focus:outline-none border-b border-dashed border-emerald-500/50"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition disabled:opacity-50"
        >
          {savedSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saveMutation.isPending ? 'Saving to Database...' : savedSuccess ? 'Routine Saved!' : 'Save Routine'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 7-Day Left Selector */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-[#111827] p-4 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">Weekly Calendar</p>
          {routineDays.map((day, idx) => (
            <button
              key={day.dayOfWeek}
              onClick={() => setSelectedDayIdx(idx)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition ${selectedDayIdx === idx
                ? 'border-emerald-500 bg-emerald-500/10 shadow-md shadow-emerald-500/10'
                : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700'
                }`}
            >
              <div>
                <p className={`text-xs font-bold ${selectedDayIdx === idx ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {day.dayOfWeek}
                </p>
                <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{day.name}</p>
              </div>
              <div className="text-right">
                {day.isRestDay ? (
                  <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-semibold">Rest</span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                    {day.exercises.length} Ex
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Day View */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-6">
          {/* Day Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{currentDay.dayOfWeek}</span>
              <h2 className="text-lg font-bold text-white mt-0.5">{currentDay.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleRest}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${currentDay.isRestDay
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white'
                  }`}
              >
                <Moon className="h-3.5 w-3.5 inline mr-1" />
                {currentDay.isRestDay ? 'Mark as Active Day' : 'Mark as Rest Day'}
              </button>
              {!currentDay.isRestDay && (
                <button
                  onClick={() => setIsPickerOpen(true)}
                  className="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                >
                  <Plus className="h-3.5 w-3.5 inline mr-1" /> Add Exercise
                </button>
              )}
            </div>
          </div>

          {/* Muscle Selection Multi-Select (Max 3) */}
          {!currentDay.isRestDay && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Target Muscles for {currentDay.dayOfWeek}</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {currentMuscles.length}/3 Muscles Selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {AVAILABLE_MUSCLES.map((muscle) => {
                  const isSelected = currentMuscles.includes(muscle);
                  return (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => handleToggleMuscle(muscle)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                      {muscle} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exercises List for current day */}
          {currentDay.isRestDay ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl text-slate-400">
              <Moon className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              Rest Day Configured. Muscle tissue repairs and recovers.
            </div>
          ) : currentDay.exercises.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl text-slate-400">
              <Dumbbell className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              No movements added yet. Select target muscles and click "Add Exercise".
            </div>
          ) : (
            <div className="space-y-3">
              {currentDay.exercises.map((item, idx) => {
                const catalogItem = catalogExercises.find((e) => e.id === item.exerciseId);
                const primaryMuscle = catalogItem?.muscles?.find((m) => m.role === 'PRIMARY')?.muscle.name;

                return (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-white">{catalogItem?.name || 'Movement'}</h4>
                        {primaryMuscle && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                            {primaryMuscle}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-7">
                        {item.sets} sets × {item.repsMin}-{item.repsMax} reps ({item.restSeconds}s rest)
                      </p>
                    </div>
                    <button onClick={() => handleRemoveExercise(idx)} className="text-slate-600 hover:text-red-400 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filtered Exercise Selector Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Select Exercise</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Targeting: <strong className="text-emerald-400">{currentMuscles.join(', ') || 'All Muscles'}</strong>
                </p>
              </div>
              <button onClick={() => setIsPickerOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* User Custom Creation Button */}
            <button
              onClick={() => {
                setIsPickerOpen(false);
                setIsCustomExerciseModalOpen(true);
              }}
              className="w-full p-2.5 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Can't find it? Add Custom Movement
            </button>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent">
              {filteredCatalog.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No matching exercises found in catalog for the selected muscles.
                </p>
              ) : (
                filteredCatalog.map((ex) => {
                  const primary = ex.muscles?.find((m) => m.role === 'PRIMARY')?.muscle.name;
                  return (
                    <div
                      key={ex.id}
                      onClick={() => handleAddExercise(ex)}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/50 hover:bg-emerald-500/10 cursor-pointer flex justify-between items-center transition"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{ex.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {primary} • Default: {ex.defaultSets} × {ex.repsMin}-{ex.repsMax}
                        </p>
                      </div>
                      <Plus className="h-4 w-4 text-emerald-400" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal Injection */}
      <CreateCustomExerciseModal
        isOpen={isCustomExerciseModalOpen}
        onClose={() => setIsCustomExerciseModalOpen(false)}
        onCreated={(newEx) => handleAddExercise(newEx)}
      />
    </div>
  );
};