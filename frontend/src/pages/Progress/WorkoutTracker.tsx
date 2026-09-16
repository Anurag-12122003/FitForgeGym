import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  Plus, 
  Clock, 
  Trophy, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Flame
} from 'lucide-react';
import type { TrackedExercise, TrackedSet } from '../../types/traker.types';

const INITIAL_EXERCISES: TrackedExercise[] = [
  {
    id: 'e_1',
    name: 'Barbell Flat Bench Press',
    muscle: 'Chest',
    targetRestSeconds: 90,
    sets: [
      { id: 's_1', setNumber: 1, prevWeightKg: 60, prevReps: 12, weightKg: 60, reps: 12, isCompleted: true },
      { id: 's_2', setNumber: 2, prevWeightKg: 60, prevReps: 10, weightKg: 60, reps: 10, isCompleted: true },
      { id: 's_3', setNumber: 3, prevWeightKg: 65, prevReps: 8, weightKg: 65, reps: 8, isCompleted: false },
      { id: 's_4', setNumber: 4, prevWeightKg: 65, prevReps: 7, weightKg: 65, reps: 8, isCompleted: false },
    ]
  },
  {
    id: 'e_2',
    name: 'Incline Dumbbell Press',
    muscle: 'Chest',
    targetRestSeconds: 60,
    sets: [
      { id: 's_5', setNumber: 1, prevWeightKg: 24, prevReps: 12, weightKg: 24, reps: 12, isCompleted: false },
      { id: 's_6', setNumber: 2, prevWeightKg: 24, prevReps: 10, weightKg: 24, reps: 10, isCompleted: false },
      { id: 's_7', setNumber: 3, prevWeightKg: 26, prevReps: 8, weightKg: 26, reps: 8, isCompleted: false },
    ]
  },
  {
    id: 'e_3',
    name: 'Triceps Rope Pushdown',
    muscle: 'Triceps',
    targetRestSeconds: 60,
    sets: [
      { id: 's_8', setNumber: 1, prevWeightKg: 30, prevReps: 15, weightKg: 30, reps: 15, isCompleted: false },
      { id: 's_9', setNumber: 2, prevWeightKg: 35, prevReps: 12, weightKg: 35, reps: 12, isCompleted: false },
      { id: 's_10', setNumber: 3, prevWeightKg: 35, prevReps: 10, weightKg: 35, reps: 10, isCompleted: false },
    ]
  }
];

export const WorkoutTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<TrackedExercise[]>(INITIAL_EXERCISES);
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  
  // Total Workout Duration Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(218); // 03:38
  // Auto Rest Timer
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Workout Session Timer
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  // Rest Countdown Interval
  useEffect(() => {
    if (restSecondsRemaining === null || restSecondsRemaining <= 0) return;
    const restInterval = setInterval(() => {
      setRestSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(restInterval);
  }, [restSecondsRemaining]);

  const activeExercise = exercises[activeExerciseIdx];
  const totalSetsCount = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  // Toggle set completed
  const handleToggleSet = (setId: string) => {
    const updated = [...exercises];
    const currSet = updated[activeExerciseIdx].sets.find((s) => s.id === setId);
    if (!currSet) return;

    const nextState = !currSet.isCompleted;
    currSet.isCompleted = nextState;
    setExercises(updated);

    if (nextState) {
      setRestSecondsRemaining(activeExercise.targetRestSeconds);
    }
  };

  const handleUpdateWeight = (setId: string, val: number) => {
    const updated = [...exercises];
    const s = updated[activeExerciseIdx].sets.find((item) => item.id === setId);
    if (s) {
      s.weightKg = val;
      setExercises(updated);
    }
  };

  const handleUpdateReps = (setId: string, val: number) => {
    const updated = [...exercises];
    const s = updated[activeExerciseIdx].sets.find((item) => item.id === setId);
    if (s) {
      s.reps = val;
      setExercises(updated);
    }
  };

  const handleAddSet = () => {
    const updated = [...exercises];
    const lastSet = activeExercise.sets[activeExercise.sets.length - 1];
    const newSet: TrackedSet = {
      id: Math.random().toString(36).substring(7),
      setNumber: activeExercise.sets.length + 1,
      prevWeightKg: lastSet ? lastSet.weightKg : 50,
      prevReps: lastSet ? lastSet.reps : 10,
      weightKg: lastSet ? lastSet.weightKg : 50,
      reps: lastSet ? lastSet.reps : 10,
      isCompleted: false,
    };
    updated[activeExerciseIdx].sets.push(newSet);
    setExercises(updated);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Workout Summary Modal/Screen
  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6 rounded-3xl border border-[#1F2937] bg-[#111827] p-8 shadow-2xl">
          <div className="h-16 w-16 bg-[#00D084]/10 border border-[#00D084]/30 text-[#00D084] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#00D084]/10">
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#F8FAFC]">Workout Completed!</h2>
            <p className="text-xs text-[#94A3B8] mt-1.5">All progressive sets have been logged successfully.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#1F2937] bg-[#0B0F17] p-4 text-left">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Duration</p>
              <p className="text-xl font-extrabold text-[#F8FAFC] mt-1 font-mono">{formatTime(elapsedSeconds)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Total Exercises</p>
              <p className="text-xl font-extrabold text-[#F8FAFC] mt-1">{exercises.length} Completed</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full rounded-xl bg-[#00D084] py-3.5 text-xs font-bold text-[#06130E] hover:bg-[#00b975] transition shadow-lg shadow-[#00D084]/20"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] font-sans antialiased selection:bg-[#00D084] selection:text-[#06130E]">
      
      {/* 1. STICKY COMPACT GYM HEADER (Height: 72px) */}
      <header className="sticky top-0 z-40 h-[72px] bg-[#0B0F17]/90 backdrop-blur-md border-b border-[#1F2937] px-4 sm:px-8 flex items-center justify-between">
        
        {/* Left: Dashboard link & Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-[#111827] border border-transparent hover:border-[#1F2937]"
            title="Return to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          
          <div className="h-5 w-[1px] bg-[#1F2937] hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#00D084] animate-pulse" />
              <span className="text-[10px] font-bold text-[#00D084] tracking-widest uppercase">Live Workout</span>
            </div>
            <p className="text-sm font-bold text-[#F8FAFC]">Chest + Triceps</p>
          </div>
        </div>

        {/* Right: Elapsed Clock & Finish CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111827] border border-[#1F2937] px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-[#F8FAFC]">
            <Clock className="h-3.5 w-3.5 text-[#00D084]" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            onClick={() => setIsFinished(true)}
            className="rounded-xl bg-[#00D084] hover:bg-[#00b975] px-4 py-2 text-xs font-bold text-[#06130E] transition shadow-md shadow-[#00D084]/15"
          >
            Finish Workout
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKOUT CONTAINER (Proper width & constrained margins) */}
      <main className="w-[min(1000px,calc(100%-32px))] sm:w-[min(1000px,calc(100%-48px))] mx-auto py-8 pb-28 space-y-6">
        
        {/* Header Summary Info */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#94A3B8]">Today's Workout</span>
            <h1 className="text-2xl font-black text-[#F8FAFC] tracking-tight">Chest & Triceps Hypertrophy</h1>
          </div>
          <p className="text-xs text-[#94A3B8] font-medium">
            {exercises.length} Exercises · {totalSetsCount} Total Sets
          </p>
        </div>

        {/* 3. EXERCISE TABS (Scrollable & Clean) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {exercises.map((ex, idx) => {
            const isActive = activeExerciseIdx === idx;
            const completedSets = ex.sets.filter((s) => s.isCompleted).length;
            const isAllCompleted = completedSets === ex.sets.length;

            return (
              <button
                key={ex.id}
                onClick={() => setActiveExerciseIdx(idx)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-[#00D084] text-[#06130E] border-[#00D084] shadow-lg shadow-[#00D084]/15 font-bold'
                    : 'bg-[#111827] text-[#94A3B8] border-[#1F2937] hover:text-[#F8FAFC] hover:border-slate-700'
                }`}
              >
                <span className={`h-5 w-5 rounded-md text-[10px] font-bold flex items-center justify-center ${
                  isActive ? 'bg-[#06130E]/20 text-[#06130E]' : 'bg-[#1F2937] text-slate-300'
                }`}>
                  {idx + 1}
                </span>
                
                <span>{ex.name}</span>

                <span className={`text-[10px] ml-1 px-1.5 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-[#06130E]/15 text-[#06130E]' 
                    : isAllCompleted 
                      ? 'bg-[#00D084]/15 text-[#00D084]' 
                      : 'text-[#64748B]'
                }`}>
                  {completedSets}/{ex.sets.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* 4. MAIN EXERCISE CARD */}
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 sm:p-7 space-y-6 shadow-2xl">
          
          {/* Card Title & Meta Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2937] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-[#00D084] uppercase tracking-widest bg-[#00D084]/10 border border-[#00D084]/20 px-2.5 py-0.5 rounded-md">
                  {activeExercise.muscle}
                </span>
                <span className="text-xs text-[#94A3B8]">
                  {activeExercise.sets.length} sets · 8–12 reps
                </span>
              </div>
              <h2 className="text-xl font-black text-[#F8FAFC] mt-2">{activeExercise.name}</h2>
            </div>

            <div className="bg-[#0B0F17] border border-[#1F2937] px-3.5 py-2 rounded-xl flex items-center gap-2.5 self-start sm:self-auto">
              <Clock className="h-4 w-4 text-[#00D084]" />
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-[#64748B] block tracking-wider leading-none">Rest Target</span>
                <span className="text-xs font-extrabold text-[#F8FAFC] font-mono leading-none">{activeExercise.targetRestSeconds}s</span>
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE VIEW (Visible on tablet & desktop) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1F2937] text-[#94A3B8] font-bold text-[11px] uppercase tracking-wider">
                  <th className="pb-3 w-16 text-center">Set</th>
                  <th className="pb-3 pl-2">Previous</th>
                  <th className="pb-3 w-36 text-center">Weight (kg)</th>
                  <th className="pb-3 w-36 text-center">Reps</th>
                  <th className="pb-3 w-20 text-center">Done</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]/60">
                {activeExercise.sets.map((set) => (
                  <tr 
                    key={set.id}
                    className={`transition-colors ${
                      set.isCompleted ? 'bg-[#00D084]/[0.05]' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3.5 text-center font-bold text-[#94A3B8]">
                      {set.setNumber}
                    </td>

                    <td className="py-3.5 pl-2 text-[#94A3B8] font-mono font-medium">
                      {set.prevWeightKg} kg × {set.prevReps}
                    </td>

                    <td className="py-3.5 text-center">
                      <input
                        type="number"
                        value={set.weightKg}
                        onChange={(e) => handleUpdateWeight(set.id, parseFloat(e.target.value) || 0)}
                        className="w-20 h-10 rounded-xl border border-[#334155] bg-[#0B1220] text-center text-sm font-bold text-[#F8FAFC] focus:border-[#00D084] focus:outline-none focus:ring-2 focus:ring-[#00D084]/20 transition"
                      />
                    </td>

                    <td className="py-3.5 text-center">
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => handleUpdateReps(set.id, parseInt(e.target.value) || 0)}
                        className="w-20 h-10 rounded-xl border border-[#334155] bg-[#0B1220] text-center text-sm font-bold text-[#F8FAFC] focus:border-[#00D084] focus:outline-none focus:ring-2 focus:ring-[#00D084]/20 transition"
                      />
                    </td>

                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => handleToggleSet(set.id)}
                        className={`h-10 w-10 mx-auto rounded-xl inline-flex items-center justify-center transition-all ${
                          set.isCompleted
                            ? 'bg-[#00D084] text-[#06130E] border border-[#00D084] shadow-md shadow-[#00D084]/20'
                            : 'bg-[#172235] border border-[#334155] text-[#64748B] hover:border-[#64748B] hover:text-[#94A3B8]'
                        }`}
                      >
                        <Check className="h-5 w-5 stroke-[3]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD VIEW (Optimized specifically for smartphones in gym) */}
          <div className="sm:hidden space-y-3">
            {activeExercise.sets.map((set) => (
              <div 
                key={set.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  set.isCompleted 
                    ? 'border-[#00D084]/40 bg-[#00D084]/5' 
                    : 'border-[#1F2937] bg-[#0B0F17]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs bg-[#1F2937] px-2 py-0.5 rounded text-[#94A3B8]">
                      SET {set.setNumber}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      Prev: <strong className="text-[#94A3B8] font-mono">{set.prevWeightKg}kg × {set.prevReps}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleSet(set.id)}
                    className={`h-9 w-9 rounded-xl inline-flex items-center justify-center transition-all ${
                      set.isCompleted
                        ? 'bg-[#00D084] text-[#06130E] shadow'
                        : 'bg-[#172235] border border-[#334155] text-[#64748B]'
                    }`}
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                      Weight (KG)
                    </label>
                    <input
                      type="number"
                      value={set.weightKg}
                      onChange={(e) => handleUpdateWeight(set.id, parseFloat(e.target.value) || 0)}
                      className="w-full h-10 rounded-lg border border-[#334155] bg-[#111827] text-center text-sm font-bold text-white focus:border-[#00D084] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                      Reps
                    </label>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => handleUpdateReps(set.id, parseInt(e.target.value) || 0)}
                      className="w-full h-10 rounded-lg border border-[#334155] bg-[#111827] text-center text-sm font-bold text-white focus:border-[#00D084] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* + Add Set Button */}
          <button
            onClick={handleAddSet}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#334155] bg-transparent text-xs font-bold text-[#94A3B8] hover:border-[#00D084] hover:text-[#00D084] hover:bg-[#00D084]/5 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Set
          </button>
        </div>

        {/* 5. BOTTOM WORKOUT NAVIGATION (Prev / Next exercise switch) */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            disabled={activeExerciseIdx === 0}
            onClick={() => setActiveExerciseIdx((prev) => Math.max(0, prev - 1))}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-[#1F2937] bg-[#111827] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Exercise
          </button>

          {activeExerciseIdx < exercises.length - 1 ? (
            <button
              onClick={() => setActiveExerciseIdx((prev) => Math.min(exercises.length - 1, prev + 1))}
              className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl bg-[#00D084] text-[#06130E] hover:bg-[#00b975] transition shadow-lg shadow-[#00D084]/10"
            >
              Next Exercise
              <ChevronRight className="h-4 w-4 stroke-[3]" />
            </button>
          ) : (
            <button
              onClick={() => setIsFinished(true)}
              className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl bg-[#00D084] text-[#06130E] hover:bg-[#00b975] transition shadow-lg shadow-[#00D084]/20"
            >
              Finish Workout
            </button>
          )}
        </div>
      </main>

      {/* 6. FLOATING REST COUNTDOWN (Auto-triggers on completing a set) */}
      {restSecondsRemaining !== null && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(420px,calc(100%-32px))] rounded-2xl border border-[#00D084]/40 bg-[#111827]/95 p-3.5 backdrop-blur-md shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#00D084]/10 text-[#00D084] flex items-center justify-center">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider leading-tight">Rest Timer</p>
              <p className="text-lg font-black text-[#00D084] font-mono leading-none mt-0.5">
                {formatTime(restSecondsRemaining)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestSecondsRemaining((prev) => (prev ? prev + 30 : 30))}
              className="rounded-lg bg-[#0B0F17] border border-[#1F2937] px-3 py-1.5 text-xs font-semibold text-[#F8FAFC] hover:border-[#00D084]/50 transition"
            >
              +30s
            </button>
            <button
              onClick={() => setRestSecondsRemaining(null)}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1F2937] transition"
              title="Close rest timer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};