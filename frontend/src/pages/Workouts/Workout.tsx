import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dumbbell, 
  ArrowRight, 
  Plus, 
  Check, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Target, 
  ShieldCheck, 
  Flame 
} from 'lucide-react';
import { PREDEFINED_PLANS } from '../../services/Plans';
import { MyRoutineView } from '../routine/MyRoutine';
import { routineApi } from '../../api/routineApi';
import { AIWorkoutModal } from '../../components/ai/AiModalComponent';

export const WorkoutsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Tab State: Default "my-routine"
  const [activeTab, setActiveTab] = useState<'my-routine' | 'explore'>('my-routine');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(PREDEFINED_PLANS[0]?.id || '1');
  const [adoptedSuccess, setAdoptedSuccess] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const activePlan = PREDEFINED_PLANS.find((p) => p.id === selectedPlanId) || PREDEFINED_PLANS[0];

  // Pre-made plan adoption mutation
  const adoptPlanMutation = useMutation({
    mutationFn: routineApi.saveRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-routines'] });
      setAdoptedSuccess(true);
      setTimeout(() => {
        setAdoptedSuccess(false);
        setActiveTab('my-routine');
      }, 1000);
    },
  });

  const handleEditInBuilder = () => {
    if (!activePlan) return;

    const daysMap: Record<string, 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'> = {
      Mon: 'MONDAY',
      Tue: 'TUESDAY',
      Wed: 'WEDNESDAY',
      Thu: 'THURSDAY',
      Fri: 'FRIDAY',
      Sat: 'SATURDAY',
      Sun: 'SUNDAY',
      Monday: 'MONDAY',
      Tuesday: 'TUESDAY',
      Wednesday: 'WEDNESDAY',
      Thursday: 'THURSDAY',
      Friday: 'FRIDAY',
      Saturday: 'SATURDAY',
      Sunday: 'SUNDAY',
    };

    const formattedDays = activePlan.scheduleSummary.map((item) => {
      const isRest = item.focus.toLowerCase().includes('rest') || item.focus.toLowerCase().includes('recovery');
      return {
        dayOfWeek: daysMap[item.day] || 'MONDAY',
        name: item.focus,
        isRestDay: isRest,
        selectedMuscles: isRest ? [] : [item.focus.split(' ')[0]],
        exercises: [],
      };
    });

    navigate('/routine-builder', {
      state: {
        templatePlan: {
          title: activePlan.title,
          goal: activePlan.goal,
          days: formattedDays,
        },
      },
    });
  };

  const handleAdoptPlan = () => {
    if (!activePlan) return;

    const daysMap: Record<string, any> = {
      Monday: 'MONDAY',
      Tuesday: 'TUESDAY',
      Wednesday: 'WEDNESDAY',
      Thursday: 'THURSDAY',
      Friday: 'FRIDAY',
      Saturday: 'SATURDAY',
      Sunday: 'SUNDAY',
    };

    const daysPayload = activePlan.scheduleSummary.map((item) => ({
      dayOfWeek: daysMap[item.day] || 'MONDAY',
      name: item.focus,
      isRestDay: item.focus.toLowerCase().includes('rest'),
      exercises: [],
    }));

    adoptPlanMutation.mutate({
      name: activePlan.title,
      goal: activePlan.goal,
      days: daysPayload as any,
    });
  };

  // Visual card images mapping matching reference theme
  const getPlanVisual = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('foundation') || t.includes('beginner')) {
      return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80';
    }
    if (t.includes('hypertrophy') || t.includes('muscle')) {
      return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80';
    }
    return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-100">
      
      {/* 1. Header & Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Programming Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Workout Plans & Splits[cite: 3]
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your personal weekly schedule or adopt verified training splits[cite: 3].
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* AI Generator Button */}
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition shadow-sm shadow-emerald-500/10"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Generator[cite: 3]
          </button>

          {/* View Mode Toggle */}
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => setActiveTab('my-routine')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'my-routine'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Routine
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'explore'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Explore Splits[cite: 3]
            </button>
          </div>

          <button
            onClick={() => navigate('/routine-builder')}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <Plus className="h-4 w-4 text-emerald-400" />
            Builder
          </button>
        </div>
      </div>

      {/* 2. Dynamic Tab Display */}
      {activeTab === 'my-routine' ? (
        <MyRoutineView />
      ) : (
        <div className="space-y-6">
          
          {/* Section Title */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                System Verified Splits[cite: 3]
              </h2>
              <p className="text-xs text-slate-400">Choose an evidence-based plan tailored to your goal[cite: 3].</p>
            </div>
            
            <button
              onClick={() => navigate('/routine-builder')}
              className="sm:hidden text-xs text-emerald-400 font-bold flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> New Custom
            </button>
          </div>

          {/* Visual Plan Cards Grid (Reference UI: Beginner / Muscle Gain / Fat Loss) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PREDEFINED_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const bgImg = getPlanVisual(plan.title);

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`group relative rounded-3xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl shadow-emerald-500/10 scale-[1.01]'
                      : 'border-slate-800 bg-[#111827] hover:border-slate-700'
                  }`}
                >
                  {/* Top Image Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    <img
                      src={bgImg}
                      alt={plan.title}
                      className="h-full w-full object-cover opacity-50 group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent" />

                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                      <span className="rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        {plan.level}
                      </span>
                      <span className="rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-slate-300 border border-slate-700">
                        {plan.daysPerWeek} Days / Wk
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition tracking-tight">
                        {plan.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                        {plan.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-400">
                        Goal: <strong className="text-slate-200">{plan.goal}</strong>
                      </span>
                      
                      <span className={`inline-flex items-center gap-1 text-xs font-bold transition ${
                        isSelected ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}>
                        Select Split <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Selected Plan Detailed Breakdown (Reference UI: Weekly Schedule + Inclusions) */}
          <div className="rounded-3xl border border-slate-800/80 bg-[#111827] p-6 space-y-6">
            
            {/* Breakdown Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    {activePlan.goal}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{activePlan.daysPerWeek} Sessions Weekly</span>
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {activePlan.title} Schedule Breakdown[cite: 2]
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleEditInBuilder}
                  className="text-xs font-semibold text-slate-400 hover:text-white transition px-3 py-2 rounded-xl hover:bg-slate-800"
                >
                  Edit in builder →[cite: 2]
                </button>
                <button
                  onClick={handleAdoptPlan}
                  disabled={adoptPlanMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {adoptedSuccess ? <Check className="h-4 w-4" /> : null}
                  {adoptPlanMutation.isPending
                    ? 'Saving...'
                    : adoptedSuccess
                    ? 'Split Adopted!'
                    : 'Adopt as My Routine'}
                </button>
              </div>
            </div>

            {/* Split Schedule Day Pills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {activePlan.scheduleSummary.map((item, idx) => {
                const isRest = item.focus.toLowerCase().includes('rest') || item.focus.toLowerCase().includes('recovery');

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 transition ${
                      isRest
                        ? 'border-slate-800/40 bg-slate-900/20 text-slate-500'
                        : 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-emerald-400 font-mono">{item.day}</span>
                      {isRest ? (
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                          Rest Day
                        </span>
                      ) : (
                        <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <Dumbbell className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold mt-2.5 text-white tracking-tight">
                      {item.focus}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Plan Inclusions Banner (Reference UI: Plan Includes) */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Weekly auto-tracked schedule[cite: 3]</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Target className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Exercise targets & sets/reps guidance[cite: 3]</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Flame className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Rest & progressive recovery days[cite: 3]</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 4. AI Modal Render */}
      <AIWorkoutModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
};