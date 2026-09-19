import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Plus, Dumbbell, Clock, Flame, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { exerciseApi, type ExerciseItem } from '../../api/exerciseApi';
import { AddToRoutineModal } from '../RoutineBuilder/AddToRoutineBuilder';

export const ExerciseDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);

  // Fetch verified movement mechanics from MySQL
  const { data: exercise, isLoading } = useQuery<ExerciseItem>({
    queryKey: ['exercise', slug],
    queryFn: async () => {
      const all = await exerciseApi.getAll();
      const match = all.find((e) => e.slug === slug);
      if (!match) throw new Error('Exercise not found');
      return match;
    },
  });

  const handleActionClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setIsRoutineModalOpen(true);
    }
  };

  if (isLoading || !exercise) {
    return (
      <div className="py-24 flex justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const primaryMuscle = exercise.muscles?.find((m) => m.role === 'PRIMARY')?.muscle.name || 'Target';
  const secondaryMuscles = exercise.muscles
    ?.filter((m) => m.role === 'SECONDARY')
    .map((m) => m.muscle.name)
    .join(', ');

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      <button
        onClick={() => navigate('/exercises')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Exercises
      </button>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Media Card */}
        <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-slate-800 bg-[#111827] h-80 sm:h-96">
          <img
            src={exercise.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: Spec Box & Action */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <div className="flex gap-2 mb-2">
              <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                {primaryMuscle}
              </span>
              <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-300">
                {exercise.difficulty}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{exercise.name}</h1>
            <p className="text-xs text-slate-400 mt-1">Equipment: {exercise.equipment?.name || 'Standard Equipment'}</p>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Volume</span>
              <p className="text-base font-black text-white mt-1">{exercise.defaultSets} Sets</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Target Reps</span>
              <p className="text-base font-black text-white mt-1">{exercise.repsMin} - {exercise.repsMax}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rest Interval</span>
              <p className="text-base font-black text-white mt-1">{exercise.restSeconds}s</p>
            </div>
          </div>

          <div className="pt-2 text-xs space-y-1.5 border-t border-slate-800/80">
            <div className="flex justify-between text-slate-400">
              <span>Secondary Muscles:</span>
              <strong className="text-slate-200">{secondaryMuscles || 'None'}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Burn:</span>
              <strong className="text-emerald-400">~60 kcal / session</strong>
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleActionClick}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            {isAuthenticated ? '+ Add to My Routine' : 'Sign in to Add to Routine'}
          </button>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Execution Guide
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {exercise.instructions && exercise.instructions.length > 0 ? (
              exercise.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-emerald-400 font-bold">{idx + 1}.</span> {step}
                </li>
              ))
            ) : (
              <li>Execute repetition through full range of motion with steady eccentric tempo.</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> Mistakes to Avoid
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
            {exercise.commonMistakes && exercise.commonMistakes.length > 0 ? (
              exercise.commonMistakes.map((mistake, idx) => <li key={idx}>{mistake}</li>)
            ) : (
              <li>Avoid bouncing the load or using momentum to cheat lockout.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Modal Render */}
      <AddToRoutineModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        exercise={exercise}
      />
    </div>
  );
};