import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, X, Loader2, Check, Scale, Dumbbell, Info } from 'lucide-react';
import { aiApi, type AIGeneratedRoutineResponse } from '../../api/aiApi';
import { routineApi } from '../../api/routineApi';
import { useAuth } from '../../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AIWorkoutModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [goal, setGoal] = useState('Muscle Hypertrophy');
  const [experience, setExperience] = useState(user?.profile?.fitnessLevel || 'INTERMEDIATE');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Biometrics (Pre-filled from athlete's profile)
  const [weightKg, setWeightKg] = useState<number>(user?.profile?.weightKg || 74);
  const [heightCm, setHeightCm] = useState<number>(user?.profile?.heightCm || 178);
  const [age, setAge] = useState<number>(user?.profile?.age || 24);
  const [gender, setGender] = useState(user?.profile?.gender || 'MALE');

  const [generatedRoutine, setGeneratedRoutine] = useState<AIGeneratedRoutineResponse | null>(null);

  const generateMutation = useMutation({
    mutationFn: aiApi.generateRoutine,
    onSuccess: (data) => setGeneratedRoutine(data),
  });

  const adoptMutation = useMutation({
    mutationFn: routineApi.saveRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-routines'] });
      onClose();
      setGeneratedRoutine(null);
    },
  });

  if (!isOpen) return null;

  const handleGenerate = () => {
    generateMutation.mutate({
      goal,
      experienceLevel: experience,
      daysPerWeek: Number(daysPerWeek),
      durationMinutes: Number(durationMinutes),
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      age: Number(age),
      gender,
    });
  };

  const handleAdopt = () => {
    if (!generatedRoutine) return;
    adoptMutation.mutate({
      name: generatedRoutine.routineName,
      goal: generatedRoutine.targetGoal,
      days: generatedRoutine.days.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        name: day.name,
        isRestDay: day.isRestDay,
        exercises: day.exercises.map((ex: any, idx: number) => ({
          exerciseId: ex.exerciseId,
          order: idx + 1,
          sets: ex.sets,
          repsMin: ex.repsMin,
          repsMax: ex.repsMax,
          targetWeightKg: ex.targetWeightKg, // Committed with exact weight in kg
          restSeconds: ex.restSeconds,
        })),
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans text-slate-100">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Biometric AI Split & Weight Generator</h3>
              <p className="text-[10px] text-slate-400">Calculates working weights (kg) matching your body composition</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!generatedRoutine ? (
          /* Form Controls */
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Goals & Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Muscle Hypertrophy">Muscle Hypertrophy (Size & Density)</option>
                  <option value="Fat Loss & Conditioning">Fat Loss & Conditioning</option>
                  <option value="Powerlifting & Pure Strength">Powerlifting & Pure Strength</option>
                  <option value="Athletic Performance">Athletic Performance & Speed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fitness Level</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="BEGINNER">Beginner (0 - 1 years)</option>
                  <option value="INTERMEDIATE">Intermediate (1 - 3 years)</option>
                  <option value="ADVANCED">Advanced (3+ years)</option>
                </select>
              </div>
            </div>

            {/* Frequency & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Training Days / Week</label>
                <input
                  type="number"
                  min="2"
                  max="6"
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Session Duration (Mins)</label>
                <input
                  type="number"
                  step="15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white text-center font-bold"
                />
              </div>
            </div>

            {/* Biometrics Input Grid */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Scale className="h-3.5 w-3.5 text-cyan-400" />
                <span>Athlete Biometrics (Used for Weight Math)</span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full py-3.5 rounded-xl bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {generateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {generateMutation.isPending ? 'Calculating Kinetic Loads & Splits...' : 'Synthesize Routine & Weights'}
            </button>
          </div>
        ) : (
          /* Result View showing Exercises with Exact Weight in KG */
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1">
              <h4 className="text-sm font-black text-white">{generatedRoutine.routineName}</h4>
              <p className="text-xs text-slate-300">{generatedRoutine.reasoning}</p>
            </div>

            <div className="space-y-3">
              {generatedRoutine.days.map((day) => (
                <div key={day.dayOfWeek} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2.5">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-extrabold text-xs text-emerald-400 font-mono">
                      {day.dayOfWeek} - {day.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {day.isRestDay ? 'Rest Day' : `${day.exercises.length} movements`}
                    </span>
                  </div>

                  {!day.isRestDay && (
                    <div className="space-y-1.5">
                      {day.exercises.map((ex: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#111827] border border-slate-800/80 text-xs">
                          <div className="min-w-0 pr-2">
                            <p className="font-bold text-white truncate">{ex.exerciseName}</p>
                            <p className="text-[10px] text-slate-400 italic truncate mt-0.5">{ex.coachingCue}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* PRESCRIBED WEIGHT BADGE */}
                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-black text-[11px]">
                              {ex.targetWeightKg > 0 ? `${ex.targetWeightKg} kg` : 'Bodyweight'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-300">
                              {ex.sets} × {ex.repsMin}-{ex.repsMax}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setGeneratedRoutine(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Reconfigure
              </button>
              <button
                onClick={handleAdopt}
                disabled={adoptMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                {adoptMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {adoptMutation.isPending ? 'Saving to Database...' : 'Adopt as My Active Split'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};