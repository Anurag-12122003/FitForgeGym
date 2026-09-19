// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useQuery } from '@tanstack/react-query';
// import { Dumbbell, Flame, Scale, Play, CheckCircle2 } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { routineApi } from '../../api/routineApi';
// import { progressApi } from '../../api/progressApi';
// import { dietApi } from '../../api/dietAPi';

// const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

// export const DashboardPage: React.FC = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   // Queries for User-Owned Data
//   const { data: routines = [] } = useQuery({
//     queryKey: ['my-routines'],
//     queryFn: routineApi.getMyRoutines,
//   });

//   const { data: dietPlans = [] } = useQuery({
//     queryKey: ['diet-plans'],
//     queryFn: dietApi.getPlans,
//   });

//   const { data: progressRecords = [] } = useQuery({
//     queryKey: ['progress-records'],
//     queryFn: progressApi.getLogs,
//   });

//   const activeRoutine = routines[0];
//   const activeDiet = dietPlans[0];
//   const latestWeight = progressRecords[progressRecords.length - 1]?.weightKg || user?.profile?.weightKg || 74;

//   // Determine Today's Workout from Routine
//   const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0, Sunday = 6
//   const todayDayEnum = DAYS_ORDER[todayIndex];
//   const todayWorkoutDay = activeRoutine?.days?.find((d) => d.dayOfWeek === todayDayEnum);

//   // Aggregated Calories from Active Plan
//   let totalDietCalories = 0;
//   if (activeDiet?.meals) {
//     activeDiet.meals.forEach((m) => {
//       m.foods.forEach((f) => {
//         totalDietCalories += (f.food.calories * f.quantityAmount) / f.food.servingAmount;
//       });
//     });
//   }
//   const handleLaunchSession = () => {
//     navigate('/workout-session', {
//       state: {
//         workoutDay: todayWorkoutDay,
//         routineName: activeRoutine?.name,
//       },
//     });
//   };
//   return (
//     <div className="space-y-6 max-w-7xl mx-auto">
//       {/* Welcome Banner */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-white tracking-tight">
//             Welcome Back, {user?.fullName || user?.email?.split('@')[0]} 👋
//           </h1>
//           <p className="text-xs text-slate-400 mt-1">
//             Goal: <strong className="text-emerald-400">{user?.profile?.primaryGoal || 'Hypertrophy'}</strong>
//           </p>
//         </div>
//         <button
//           onClick={handleLaunchSession}
//           className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
//         >
//           <Play className="h-3.5 w-3.5 fill-current" />
//           Start Gym Session
//         </button>
//       </div>

//       {/* Snapshot Metrics */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
//           <div className="flex items-center justify-between text-slate-400">
//             <span className="text-xs font-semibold uppercase tracking-wider">Active Routine</span>
//             <Dumbbell className="h-4 w-4 text-emerald-400" />
//           </div>
//           <div className="mt-3">
//             <p className="text-lg font-bold text-white truncate">{activeRoutine?.name || 'No routine assigned'}</p>
//             <p className="text-xs text-slate-400 mt-0.5">
//               {activeRoutine ? `${activeRoutine.days.filter((d) => !d.isRestDay).length} Active Training Days` : 'Set up in routine builder'}
//             </p>
//           </div>
//         </div>

//         <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
//           <div className="flex items-center justify-between text-slate-400">
//             <span className="text-xs font-semibold uppercase tracking-wider">Planned Nutrition</span>
//             <Flame className="h-4 w-4 text-amber-400" />
//           </div>
//           <div className="mt-3">
//             <p className="text-lg font-bold text-white">
//               {Math.round(totalDietCalories)} <span className="text-xs font-normal text-slate-400">/ {activeDiet?.targetCalories || 2400} kcal</span>
//             </p>
//             <p className="text-xs text-amber-400 mt-0.5">{activeDiet ? activeDiet.name : 'No active plan'}</p>
//           </div>
//         </div>

//         <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
//           <div className="flex items-center justify-between text-slate-400">
//             <span className="text-xs font-semibold uppercase tracking-wider">Current Weight</span>
//             <Scale className="h-4 w-4 text-cyan-400" />
//           </div>
//           <div className="mt-3 flex items-baseline gap-2">
//             <span className="text-2xl font-black text-white">{latestWeight}</span>
//             <span className="text-xs text-slate-400">kg</span>
//           </div>
//         </div>
//       </div>

//       {/* Main Focus Split */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//         {/* Left: Today's Scheduled Session */}
//         <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#111827] p-6 flex flex-col justify-between">
//           <div>
//             <div className="flex items-center justify-between border-b border-slate-800 pb-4">
//               <div>
//                 <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Today's Focus ({todayDayEnum})</span>
//                 <h3 className="text-lg font-bold text-white mt-0.5">
//                   {todayWorkoutDay ? todayWorkoutDay.name : 'Unscheduled Session'}
//                 </h3>
//               </div>
//               {todayWorkoutDay?.isRestDay && (
//                 <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400 font-semibold">Rest Day</span>
//               )}
//             </div>

//             <div className="mt-4 space-y-2.5">
//               {!todayWorkoutDay || todayWorkoutDay.isRestDay ? (
//                 <p className="text-xs text-slate-500 py-6 text-center italic">
//                   Rest day scheduled or no routine assigned for today. Recovery is vital for growth.
//                 </p>
//               ) : todayWorkoutDay.exercises.length === 0 ? (
//                 <p className="text-xs text-slate-500 py-6 text-center italic">No exercises added to this routine day yet.</p>
//               ) : (
//                 todayWorkoutDay.exercises.map((item, idx) => (
//                   <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
//                     <div className="flex items-center gap-3">
//                       <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-slate-400">
//                         {idx + 1}
//                       </span>
//                       <p className="text-xs font-semibold text-white">{item.exercise.name}</p>
//                     </div>
//                     <span className="text-xs text-emerald-400 font-medium">
//                       {item.sets} sets × {item.repsMin}-{item.repsMax} reps
//                     </span>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//           <button
//             onClick={handleLaunchSession}
//             className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
//           >
//             <Play className="h-4 w-4 fill-current" />
//             Launch Workout Tracker
//           </button>
//         </div>

//         {/* Right: Nutrition Overview Card */}
//         <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#111827] p-6 flex flex-col justify-between">
//           <div>
//             <div className="flex items-center justify-between border-b border-slate-800 pb-4">
//               <div>
//                 <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Nutrition Adherence</span>
//                 <h3 className="text-base font-bold text-white mt-0.5">Meal Plan Allocations</h3>
//               </div>
//               <button
//                 onClick={() => navigate('/nutrition')}
//                 className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
//               >
//                 Manage →
//               </button>
//             </div>

//             <div className="mt-4 space-y-3">
//               {activeDiet?.meals?.map((m) => (
//                 <div key={m.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
//                   <span className="text-xs text-slate-300">{m.name}</span>
//                   <span className="text-xs text-slate-500">{m.foods.length} items logged</span>
//                 </div>
//               ))}
//               {!activeDiet && <p className="text-xs text-slate-500 py-4 text-center">No diet plan active.</p>}
//             </div>
//           </div>

//           <button
//             onClick={() => navigate('/nutrition')}
//             className="mt-6 w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition"
//           >
//             Open Meal Planner
//           </button>
//         </div>
//       </div>

//       {/* 7-Day Consistency Schedule */}
//       <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
//         <h3 className="text-sm font-bold text-white mb-3">Weekly Split Consistency</h3>
//         <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
//           {DAYS_ORDER.map((dayName,index) => {
//             const matchedDay = activeRoutine?.days?.find((d) => d.dayOfWeek === dayName);
//             const isToday = dayName === todayDayEnum;
//             // Check if this day is strictly before today
//             const isPastDay = index < todayIndex;

//             return (
//               <div
//                 key={dayName}
//                 className={`rounded-xl border p-3 flex flex-col justify-between h-20 transition ${isToday
//                     ? 'border-emerald-500 bg-emerald-500/10'
//                     : 'border-slate-800 bg-slate-900/40'
//                   }`}
//               >
//                 <div className="flex justify-between items-center">
//                   <span className={`text-[11px] font-bold ${isToday ? 'text-emerald-400' : 'text-slate-400'}`}>
//                     {dayName.slice(0, 3)}
//                   </span>
//                   {isPastDay && matchedDay && !matchedDay.isRestDay && (
//                     <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
//                   )}
//                 </div>
//                 <p className="text-[10px] text-slate-300 truncate">
//                   {matchedDay ? matchedDay.name : 'Rest'}
//                 </p>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Dumbbell,
  Flame,
  Scale,
  Play,
  CheckCircle2,
  Calendar as CalendarIcon,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { routineApi } from '../../api/routineApi';
import { progressApi } from '../../api/progressApi';
import { dietApi } from '../../api/dietAPi';

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Queries
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

  const { data: summary } = useQuery({
    queryKey: ['progress-summary'],
    queryFn: progressApi.getSummary,
  });

  const activeRoutine = routines[0];
  const activeDiet = dietPlans[0];
  const latestWeight = progressRecords[progressRecords.length - 1]?.weightKg || user?.profile?.weightKg || 74;

  // Real-time Date & Day Calculation
  const today = new Date();
  const todayDayIdx = (today.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const todayEnum = DAYS_ORDER[todayDayIdx];
  const todayWorkoutDay = activeRoutine?.days?.find((d) => d.dayOfWeek === todayEnum);

  // Active training days adherence
  const activeDaysCount = activeRoutine?.days?.filter((d) => !d.isRestDay).length || 4;
  const completedThisWeek = summary?.completedSessions ? Math.min(summary.completedSessions, activeDaysCount) : 2;
  const weeklyAdherencePct = Math.round((completedThisWeek / activeDaysCount) * 100);

  // Quick Session Trigger
  const handleLaunchSession = () => {
    navigate('/workout-session', {
      state: {
        workoutDay: todayWorkoutDay,
        routineName: activeRoutine?.name,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-100">

      {/* 1. HERO BANNER: Stronger, Healthier, Happier */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#0F172A] via-[#0B0F19] to-[#040711] p-6 sm:p-8 shadow-2xl">
        {/* Background Athletic Image Mask with Subtle Glow */}
        <div
          className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 bg-cover bg-center opacity-30 sm:opacity-40 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80')`,
            maskImage: 'linear-gradient(to right, transparent, black 70%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 70%)'
          }}
        />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            Empowering Your Transformation
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Stronger.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Healthier.
            </span> Happier.
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
            Your customized progressive overload, targeted muscle mapping, and precision nutrition engine.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleLaunchSession}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-black text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Start Your Workout
            </button>

            <button
              onClick={() => navigate('/exercises')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Explore Exercises
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. THREE-PANEL FOCUS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Card A: Today's Focus Session */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-800/80 bg-[#111827] p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Today's Workout
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {DAYS_SHORT[todayDayIdx]}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                {todayWorkoutDay ? todayWorkoutDay.name : 'Rest & Recovery'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {todayWorkoutDay?.isRestDay
                  ? 'Active muscular recovery & rehydration focus.'
                  : `${todayWorkoutDay?.exercises?.length || 0} exercises scheduled for today.`}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {todayWorkoutDay?.exercises?.slice(0, 3).map((ex, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="h-4 w-4 rounded bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-slate-200 truncate">{ex.exercise?.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold shrink-0">
                    {ex.sets}×{ex.repsMin}-{ex.repsMax}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleLaunchSession}
            className="mt-6 w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-slate-950 transition flex items-center justify-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Launch Floor Tracker
          </button>
        </div>

        {/* Card B: Weekly Mini-Calendar Adherence */}
        {/* Card B: Weekly Mini-Calendar Adherence */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800/80 bg-[#111827] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">This Week Calendar</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{weeklyAdherencePct}% Adherence</span>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-4 text-center">
              {DAYS_SHORT.map((dayName, idx) => {
                const isToday = idx === todayDayIdx;
                const matchedDay = activeRoutine?.days?.find((d) => d.dayOfWeek === DAYS_ORDER[idx]);
                const isRest = matchedDay?.isRestDay || !matchedDay;

                // Dynamic date calculation for the current week (Mon-Sun)
                const currentDayDate = new Date();
                const distanceToMonday = idx - todayDayIdx;
                currentDayDate.setDate(currentDayDate.getDate() + distanceToMonday);
                const dateNum = currentDayDate.getDate();

                return (
                  <div key={dayName} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500">{dayName}</span>
                    <div
                      className={`h-10 w-10 rounded-xl flex flex-col items-center justify-center border transition-all ${isToday
                          ? 'border-emerald-500 bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 scale-105'
                          : isRest
                            ? 'border-slate-800/60 bg-slate-900/30 text-slate-600'
                            : 'border-slate-800 bg-slate-900/70 text-slate-300'
                        }`}
                    >
                      <span className="text-xs font-bold">{dateNum}</span>
                      <span
                        className={`h-1-w-1 h-1 w-1 rounded-full mt-0.5 ${isToday ? 'bg-slate-950' : isRest ? 'bg-transparent' : 'bg-emerald-400'
                          }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
            <span>Current Split: <strong className="text-slate-200">{activeRoutine?.name || 'Standard 4-Day'}</strong></span>
            <button
              onClick={() => navigate('/workouts')}
              className="text-emerald-400 font-bold hover:underline"
            >
              View Full →
            </button>
          </div>
        </div>

        {/* Card C: Discipline Quote & Milestone Card */}
        <div className="lg:col-span-3 rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#111827] to-[#0B0F19] p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3">
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Daily Philosophy</span>
            <blockquote className="text-base font-black text-white leading-snug">
              "Discipline today builds the body you want tomorrow."
            </blockquote>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Milestone</p>
              <p className="text-xs font-bold text-emerald-400">{summary?.completedSessions || 0} Total Workouts</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
        </div>

      </div>

      {/* 3. QUICK STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tonnage Moved</span>
            <p className="text-2xl font-black text-white mt-1">
              {((summary?.totalTonnageKg || 0) / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-500">kg</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Scale className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Planned Calories</span>
            <p className="text-2xl font-black text-white mt-1">
              {activeDiet?.targetCalories || 2400} <span className="text-xs font-normal text-slate-500">kcal/day</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Flame className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Weight</span>
            <p className="text-2xl font-black text-white mt-1">
              {latestWeight} <span className="text-xs font-normal text-slate-500">kg</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Dumbbell className="h-5 w-5" />
          </div>
        </div>
      </div>

    </div>
  );
};