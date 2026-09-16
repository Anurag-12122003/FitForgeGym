import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Dumbbell, Flame, Scale, Play, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { routineApi } from '../../api/routineApi';
import { progressApi } from '../../api/progressApi';
import { dietApi } from '../../api/dietAPi';

const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Queries for User-Owned Data
  const { data: routines = [] } = useQuery({
    queryKey: ['my-routines'],
    queryFn: routineApi.getMyRoutines,
  });

  const { data: dietPlans = [] } = useQuery({
    queryKey: ['diet-plans'],
    queryFn: dietApi.getPlans,
  });

  const { data: progressRecords = [] } = useQuery({
    queryKey: ['progress-records'],
    queryFn: progressApi.getLogs,
  });

  const activeRoutine = routines[0];
  const activeDiet = dietPlans[0];
  const latestWeight = progressRecords[progressRecords.length - 1]?.weightKg || user?.profile?.weightKg || 74;

  // Determine Today's Workout from Routine
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const todayDayEnum = DAYS_ORDER[todayIndex];
  const todayWorkoutDay = activeRoutine?.days?.find((d) => d.dayOfWeek === todayDayEnum);

  // Aggregated Calories from Active Plan
  let totalDietCalories = 0;
  if (activeDiet?.meals) {
    activeDiet.meals.forEach((m) => {
      m.foods.forEach((f) => {
        totalDietCalories += (f.food.calories * f.quantityAmount) / f.food.servingAmount;
      });
    });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome Back, {user?.fullName || user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Goal: <strong className="text-emerald-400">{user?.profile?.primaryGoal || 'Hypertrophy'}</strong>
          </p>
        </div>
        <button
          onClick={() => navigate('/workout-session')}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          Start Gym Session
        </button>
      </div>

      {/* Snapshot Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Routine</span>
            <Dumbbell className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <p className="text-lg font-bold text-white truncate">{activeRoutine?.name || 'No routine assigned'}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeRoutine ? `${activeRoutine.days.filter((d) => !d.isRestDay).length} Active Training Days` : 'Set up in routine builder'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Planned Nutrition</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <p className="text-lg font-bold text-white">
              {Math.round(totalDietCalories)} <span className="text-xs font-normal text-slate-400">/ {activeDiet?.targetCalories || 2400} kcal</span>
            </p>
            <p className="text-xs text-amber-400 mt-0.5">{activeDiet ? activeDiet.name : 'No active plan'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Weight</span>
            <Scale className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{latestWeight}</span>
            <span className="text-xs text-slate-400">kg</span>
          </div>
        </div>
      </div>

      {/* Main Focus Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Today's Scheduled Session */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#111827] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Today's Focus ({todayDayEnum})</span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {todayWorkoutDay ? todayWorkoutDay.name : 'Unscheduled Session'}
                </h3>
              </div>
              {todayWorkoutDay?.isRestDay && (
                <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400 font-semibold">Rest Day</span>
              )}
            </div>

            <div className="mt-4 space-y-2.5">
              {!todayWorkoutDay || todayWorkoutDay.isRestDay ? (
                <p className="text-xs text-slate-500 py-6 text-center italic">
                  Rest day scheduled or no routine assigned for today. Recovery is vital for growth.
                </p>
              ) : todayWorkoutDay.exercises.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center italic">No exercises added to this routine day yet.</p>
              ) : (
                todayWorkoutDay.exercises.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-slate-400">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-semibold text-white">{item.exercise.name}</p>
                    </div>
                    <span className="text-xs text-emerald-400 font-medium">
                      {item.sets} sets × {item.repsMin}-{item.repsMax} reps
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/workout-session')}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
          >
            <Play className="h-4 w-4 fill-current" />
            Launch Workout Tracker
          </button>
        </div>

        {/* Right: Nutrition Overview Card */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#111827] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Nutrition Adherence</span>
                <h3 className="text-base font-bold text-white mt-0.5">Meal Plan Allocations</h3>
              </div>
              <button
                onClick={() => navigate('/nutrition')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                Manage →
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {activeDiet?.meals?.map((m) => (
                <div key={m.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                  <span className="text-xs text-slate-300">{m.name}</span>
                  <span className="text-xs text-slate-500">{m.foods.length} items logged</span>
                </div>
              ))}
              {!activeDiet && <p className="text-xs text-slate-500 py-4 text-center">No diet plan active.</p>}
            </div>
          </div>

          <button
            onClick={() => navigate('/nutrition')}
            className="mt-6 w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            Open Meal Planner
          </button>
        </div>
      </div>

      {/* 7-Day Consistency Schedule */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <h3 className="text-sm font-bold text-white mb-3">Weekly Split Consistency</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {DAYS_ORDER.map((dayName) => {
            const matchedDay = activeRoutine?.days?.find((d) => d.dayOfWeek === dayName);
            const isToday = dayName === todayDayEnum;

            return (
              <div
                key={dayName}
                className={`rounded-xl border p-3 flex flex-col justify-between h-20 transition ${
                  isToday
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-[11px] font-bold ${isToday ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {dayName.slice(0, 3)}
                  </span>
                  {matchedDay && !matchedDay.isRestDay && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                </div>
                <p className="text-[10px] text-slate-300 truncate">
                  {matchedDay ? matchedDay.name : 'Rest'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};