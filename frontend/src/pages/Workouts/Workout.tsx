import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Calendar, Flame, ArrowRight, Plus } from 'lucide-react';
import { PREDEFINED_PLANS } from '../../services/Plans';

export const WorkoutsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(PREDEFINED_PLANS[0].id);

  const activePlan = PREDEFINED_PLANS.find((p) => p.id === selectedPlanId) || PREDEFINED_PLANS[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Workout Plans</h1>
          <p className="text-xs text-slate-400 mt-1">
            Choose an evidence-based split or construct your own custom weekly program.
          </p>
        </div>
        <button
          onClick={() => navigate('/routine-builder')}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          Create Custom Routine
        </button>
      </div>

      {/* Plan Selection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PREDEFINED_PLANS.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlanId(plan.id)}
            className={`cursor-pointer rounded-2xl border p-5 transition flex flex-col justify-between ${
              selectedPlanId === plan.id
                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                : 'border-slate-800 bg-[#111827] hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-300 border border-slate-700">
                  {plan.level}
                </span>
                <span className="text-xs font-semibold text-emerald-400">{plan.daysPerWeek} Days / Wk</span>
              </div>
              <h3 className="text-base font-bold text-white">{plan.title}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{plan.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs font-semibold text-slate-300">
              <span>Goal: {plan.goal}</span>
              <ArrowRight className={`h-3.5 w-3.5 ${selectedPlanId === plan.id ? 'text-emerald-400' : 'text-slate-600'}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Selected Plan Details & Schedule Breakdown */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#111827] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">{activePlan.title} Schedule</h2>
            <p className="text-xs text-slate-400">Structured layout for each day of the week</p>
          </div>
          <button
            onClick={() => navigate('/routine-builder')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
          >
            Customize this plan in builder →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {activePlan.scheduleSummary.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-4 ${
                item.focus.toLowerCase().includes('rest')
                  ? 'border-slate-800/50 bg-slate-900/30 text-slate-500'
                  : 'border-slate-800 bg-slate-900/70 text-slate-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400">{item.day}</span>
                {item.focus.toLowerCase().includes('rest') ? (
                  <span className="text-[10px] text-slate-500">Rest Day</span>
                ) : (
                  <Dumbbell className="h-3.5 w-3.5 text-slate-400" />
                )}
              </div>
              <p className="text-xs font-semibold mt-2 text-white">{item.focus}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};