import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Dumbbell, Play, Edit3, Moon, Plus } from 'lucide-react';
import { routineApi } from '../../api/routineApi';

const DAYS_ORDER = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export const MyRoutineView: React.FC = () => {
  const navigate = useNavigate();

  const { data: routines = [], isLoading } = useQuery({
    queryKey: ['my-routines'],
    queryFn: routineApi.getMyRoutines,
  });

  const activeRoutine = routines[0];

  // Today determination
  const todayIdx = (new Date().getDay() + 6) % 7;
  const todayDayName = DAYS_ORDER[todayIdx];

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-500">Loading your weekly program...</div>;
  }

  if (!activeRoutine) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-[#111827] p-12 text-center">
        <Dumbbell className="h-10 w-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">No Active Routine Found</h3>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          Build your custom 7-day workout schedule or adopt a pre-made split.
        </p>
        <button
          onClick={() => navigate('/routine-builder')}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4 inline mr-1" /> Create Custom Routine
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Top Header */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#111827] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              Active Routine
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">{activeRoutine.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Goal: <strong className="text-slate-200">{activeRoutine.goal || 'Hypertrophy'}</strong> •{' '}
            {activeRoutine.days?.filter((d) => !d.isRestDay).length || 0} Training Days / Week
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => navigate('/routine-builder')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit Routine
          </button>
          <button
            onClick={() => navigate('/workout-session')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Start Today's Session
          </button>
        </div>
      </div>

      {/* 7-Day Visual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS_ORDER.map((day) => {
          const routineDay = activeRoutine.days?.find((d) => d.dayOfWeek === day);
          const isToday = day === todayDayName;
          const isRest = !routineDay || routineDay.isRestDay;
          const exercises = routineDay?.exercises || [];

          return (
            <div
              key={day}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition ${
                isToday
                  ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/5'
                  : 'border-slate-800/80 bg-[#111827]'
              }`}
            >
              <div>
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-black tracking-wider ${isToday ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {day}
                      </span>
                      {isToday && (
                        <span className="rounded-full bg-emerald-500 px-1.5 py-0.2 text-[9px] font-bold text-slate-950">
                          TODAY
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white mt-0.5">
                      {routineDay ? routineDay.name : 'Rest Day'}
                    </h4>
                  </div>
                  {isRest && <Moon className="h-4 w-4 text-slate-600" />}
                </div>

                {/* Exercises List */}
                {isRest ? (
                  <div className="py-8 text-center text-[11px] text-slate-500 italic">
                    Rest & Recovery
                  </div>
                ) : exercises.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-slate-500 italic">
                    No movements logged for this session.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {exercises.map((ex, idx) => (
                      <div
                        key={ex.id}
                        className="rounded-xl border border-slate-800/60 bg-slate-900/50 p-2.5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-slate-800 text-[9px] font-bold text-slate-400">
                            {idx + 1}
                          </span>
                          <p className="text-xs font-semibold text-white truncate">
                            {ex.exercise?.name || 'Movement'}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0 ml-2">
                          {ex.sets}×{ex.repsMin}-{ex.repsMax}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Day Bottom Meta */}
              {!isRest && (
                <div className="pt-3 mt-4 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{exercises.length} Total Exercises</span>
                  <span>{exercises.reduce((acc, curr) => acc + curr.sets, 0)} Total Sets</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};