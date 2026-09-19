import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, X, Loader2, Dumbbell, Check } from 'lucide-react';
import { aiApi } from '../../api/aiApi';
import { routineApi } from '../../api/routineApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AIWorkoutModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const [goal, setGoal] = useState('Muscle Hypertrophy');
  const [experience, setExperience] = useState('INTERMEDIATE');
  const [days, setDays] = useState(4);
  const [duration, setDuration] = useState(60);

  const [generatedResult, setGeneratedResult] = useState<any | null>(null);

  const generateMutation = useMutation({
    mutationFn: aiApi.generateWorkout,
    onSuccess: (data) => {
      setGeneratedResult(data);
    },
  });

  const adoptPlanMutation = useMutation({
    mutationFn: routineApi.saveRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-routines'] });
      onClose();
      setGeneratedResult(null);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">AI Program Generator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!generatedResult ? (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <p className="text-xs text-slate-400">
              The AI engine synthesizes training volume exclusively from verified database movements matching your schedule.
            </p>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Primary Objective</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Muscle Hypertrophy">Muscle Hypertrophy (Size & Density)</option>
                <option value="Fat Loss & Conditioning">Fat Loss & Conditioning</option>
                <option value="Powerlifting / Strength">Powerlifting / Strength Focus</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Experience</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Days / Week</label>
                <input
                  type="number"
                  min="2"
                  max="6"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Minutes / Session</label>
                <input
                  type="number"
                  step="15"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={() =>
                generateMutation.mutate({
                  goal,
                  experienceLevel: experience,
                  daysPerWeek: days,
                  durationMinutes: duration,
                  equipmentAvailable: ['Barbell', 'Dumbbells', 'Cable Machine'],
                })
              }
              disabled={generateMutation.isPending}
              className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition flex items-center justify-center gap-2"
            >
              {generateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {generateMutation.isPending ? 'Validating Catalog Move Sequences...' : 'Synthesize Custom Program'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1">
              <h4 className="text-sm font-bold text-white">{generatedResult.routineName}</h4>
              <p className="text-xs text-slate-400">{generatedResult.reasoning}</p>
            </div>

            <div className="space-y-2">
              {generatedResult.days.map((d: any) => (
                <div key={d.dayOfWeek} className="flex justify-between items-center p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs">
                  <div>
                    <span className="font-bold text-white">{d.dayOfWeek}:</span>{' '}
                    <span className="text-slate-300">{d.name}</span>
                  </div>
                  <span className="text-[11px] text-emerald-400">
                    {d.isRestDay ? 'Rest' : `${d.exercises.length} Exercises`}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setGeneratedResult(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300"
              >
                Reconfigure
              </button>
              <button
                onClick={() =>
                  adoptPlanMutation.mutate({
                    name: generatedResult.routineName,
                    days: generatedResult.days,
                  })
                }
                disabled={adoptPlanMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 flex items-center justify-center gap-2"
              >
                {adoptPlanMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Adopt as My Active Routine
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};