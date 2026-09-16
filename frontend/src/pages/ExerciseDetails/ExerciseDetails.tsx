import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Timer, 
  Flame, 
  Repeat, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Plus 
} from 'lucide-react';
import { EXERCISE_DATA } from '../../services/Exercises';

export const ExerciseDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const exercise = EXERCISE_DATA.find((e) => e.slug === slug);

  if (!exercise) {
    return (
      <div className="text-center py-16">
        <p className="text-white text-base">Exercise not found.</p>
        <button
          onClick={() => navigate('/exercises')}
          className="mt-4 text-xs font-semibold text-emerald-400 underline"
        >
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/exercises')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Exercises
      </button>

      {/* Main Detail Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Image / Video visual */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-[#111827] overflow-hidden">
          <img
            src={exercise.imageUrl}
            alt={exercise.name}
            className="w-full h-72 sm:h-96 object-cover"
          />
        </div>

        {/* Right: Meta Summary */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <div className="flex gap-2 mb-2">
              <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400">
                {exercise.primaryMuscle}
              </span>
              <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                {exercise.difficulty}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{exercise.name}</h1>
            <p className="text-xs text-slate-400 mt-1">Equipment: {exercise.equipment}</p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800 bg-[#111827] p-3 text-center">
              <Layers className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500 uppercase font-bold">Volume</p>
              <p className="text-sm font-bold text-white">{exercise.defaultSets} Sets</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#111827] p-3 text-center">
              <Repeat className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500 uppercase font-bold">Reps</p>
              <p className="text-sm font-bold text-white">{exercise.defaultReps}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#111827] p-3 text-center">
              <Timer className="h-4 w-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500 uppercase font-bold">Rest</p>
              <p className="text-sm font-bold text-white">{exercise.restSeconds}s</p>
            </div>
          </div>

          {/* Secondary Muscles & Calories */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Secondary Muscles:</span>
              <span className="text-slate-200 font-semibold">{exercise.secondaryMuscles.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Calorie Burn:</span>
              <span className="text-emerald-400 font-semibold">{exercise.caloriesBurnEstimate}</span>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20">
            <Plus className="h-4 w-4" />
            Add To Custom Routine
          </button>
        </div>

      </div>

      {/* Step by Step Execution & Common Mistakes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        
        {/* Execution Guide */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#111827] p-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Execution Guide
          </h3>
          <ol className="space-y-3">
            {exercise.instructions.map((step, idx) => (
              <li key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-300">
                <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-emerald-400">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Common Mistakes */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#111827] p-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Mistakes to Avoid
          </h3>
          <ul className="space-y-3">
            {exercise.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-300">
                <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5" />
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};