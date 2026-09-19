import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, Dumbbell, Check, Loader2, AlertCircle } from 'lucide-react';
import {
  routineApi,
  type RoutineResponse,
  type RoutinePayload,
  type RoutineDayPayload,
} from '../../api/routineApi';
import type { ExerciseItem } from '../../api/exerciseApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exercise: ExerciseItem;
}

const ALL_DAYS: RoutineDayPayload['dayOfWeek'][] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export const AddToRoutineModal: React.FC<Props> = ({ isOpen, onClose, exercise }) => {
  const queryClient = useQueryClient();

  const [selectedDay, setSelectedDay] = useState<RoutineDayPayload['dayOfWeek']>('MONDAY');
  const [sets, setSets] = useState<number>(exercise.defaultSets || 3);
  const [repsMin, setRepsMin] = useState<number>(exercise.repsMin || 8);
  const [repsMax, setRepsMax] = useState<number>(exercise.repsMax || 12);
  const [restSeconds, setRestSeconds] = useState<number>(exercise.restSeconds || 90);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Fetch active routine from database
  const { data: routines = [], isLoading: loadingRoutine } = useQuery({
    queryKey: ['my-routines'],
    queryFn: routineApi.getMyRoutines,
    enabled: isOpen,
  });

  const activeRoutine = routines[0] as RoutineResponse | undefined;

  const saveMutation = useMutation({
    mutationFn: (payload: RoutinePayload) => routineApi.saveRoutine(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-routines'] });
      setAddedSuccess(true);
      setTimeout(() => {
        setAddedSuccess(false);
        onClose();
      }, 1200);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update routine schedule.');
    },
  });

  if (!isOpen) return null;

  const handleConfirm = () => {
    setErrorMsg(null);

    // 1. Construct or clone 7 days
    const baseDays: RoutineDayPayload[] = ALL_DAYS.map((dayName) => {
      const existingDay = activeRoutine?.days?.find((d) => d.dayOfWeek === dayName);

      if (existingDay) {
        return {
          dayOfWeek: existingDay.dayOfWeek,
          name: existingDay.name,
          isRestDay: existingDay.isRestDay,
          exercises: existingDay.exercises.map((e) => ({
            exerciseId: e.exercise.id,
            order: e.order,
            sets: e.sets,
            repsMin: e.repsMin,
            repsMax: e.repsMax,
            restSeconds: e.restSeconds,
          })),
        };
      }

      // Default blank setup if no routine exists yet
      const isDefaultRest = dayName === 'WEDNESDAY' || dayName === 'SUNDAY';
      return {
        dayOfWeek: dayName,
        name: isDefaultRest ? 'Rest & Recovery' : `${dayName.slice(0, 3)} Session`,
        isRestDay: isDefaultRest,
        exercises: [],
      };
    });

    // 2. Append chosen exercise to target day
    const updatedDays = baseDays.map((day) => {
      if (day.dayOfWeek !== selectedDay) return day;

      const newOrder = day.exercises.length + 1;
      return {
        ...day,
        isRestDay: false, // Make active upon adding exercise
        name: day.isRestDay ? `${selectedDay.slice(0, 3)} Training` : day.name,
        exercises: [
          ...day.exercises,
          {
            exerciseId: exercise.id,
            order: newOrder,
            sets: Number(sets),
            repsMin: Number(repsMin),
            repsMax: Number(repsMax),
            restSeconds: Number(restSeconds),
          },
        ],
      };
    });

    // 3. Dispatch strictly-typed payload
    const payload: RoutinePayload = {
      name: activeRoutine?.name || 'My Custom Split',
      goal: activeRoutine?.goal || 'Hypertrophy',
      days: updatedDays,
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-5">
        
        {/* Modal Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Add to Routine</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Selected Movement Snippet */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 flex justify-between items-center">
          <div>
            <h4 className="text-xs font-bold text-white">{exercise.name}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {exercise.muscles?.find((m) => m.role === 'PRIMARY')?.muscle.name || 'Muscle'} • {exercise.difficulty}
            </p>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            {exercise.equipment?.name || 'Standard'}
          </span>
        </div>

        {/* 7-Day Quick Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Choose Day
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {ALL_DAYS.map((day) => {
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`py-2 rounded-xl text-[11px] font-bold transition ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Parameters Input */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Sets</label>
            <input
              type="number"
              min="1"
              value={sets}
              onChange={(e) => setSets(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs font-bold text-white text-center focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Min Reps</label>
            <input
              type="number"
              min="1"
              value={repsMin}
              onChange={(e) => setRepsMin(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs font-bold text-white text-center focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Max Reps</label>
            <input
              type="number"
              min="1"
              value={repsMax}
              onChange={(e) => setRepsMax(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs font-bold text-white text-center focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Rest (s)</label>
            <input
              type="number"
              step="15"
              value={restSeconds}
              onChange={(e) => setRestSeconds(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs font-bold text-white text-center focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saveMutation.isPending || loadingRoutine}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : addedSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {saveMutation.isPending ? 'Saving...' : addedSuccess ? 'Saved to Day!' : 'Confirm & Save'}
          </button>
        </div>

      </div>
    </div>
  );
};