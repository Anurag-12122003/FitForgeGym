import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Scale, Trophy, Flame, TrendingUp, Plus, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { progressApi } from '../../api/progressApi';

export const ProgressPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form inputs
  const [weightKg, setWeightKg] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [armsCm, setArmsCm] = useState('');

  const { data: progressRecords = [], isLoading } = useQuery({
    queryKey: ['progress-records'],
    queryFn: progressApi.getLogs,
  });

  const { data: summary } = useQuery({
    queryKey: ['progress-summary'],
    queryFn: progressApi.getSummary,
  });

  const logMutation = useMutation({
    mutationFn: progressApi.logMetrics,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-records'] });
      queryClient.invalidateQueries({ queryKey: ['progress-summary'] });
      setIsModalOpen(false);
      setWeightKg('');
      setWaistCm('');
      setChestCm('');
      setArmsCm('');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg) return;
    logMutation.mutate({
      weightKg: parseFloat(weightKg),
      waistCm: waistCm ? parseFloat(waistCm) : undefined,
      chestCm: chestCm ? parseFloat(chestCm) : undefined,
      armsCm: armsCm ? parseFloat(armsCm) : undefined,
    });
  };

  const chartData = progressRecords.map((r) => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weightKg: r.weightKg,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Progress & Body Metrics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze historical body changes, total volume tonnage, and adherence records.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
        >
          <Plus className="h-4 w-4" />
          Log Measurements
        </button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed Sessions</span>
            <Trophy className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{summary?.completedSessions || 0}</p>
          <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Verified workouts</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tonnage Lifted</span>
            <Scale className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {((summary?.totalTonnageKg || 0) / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">kg</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Cumulative load moved</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Recorded Entries</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{progressRecords.length}</p>
          <p className="text-[10px] text-amber-400 mt-1 font-semibold">Total weigh-ins</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Current Weight</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {progressRecords[progressRecords.length - 1]?.weightKg || '--'} <span className="text-xs font-normal text-slate-400">kg</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Latest weigh-in</p>
        </div>
      </div>

      {/* Trajectory Area Chart */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Body Weight Trajectory</h2>
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        ) : chartData.length === 0 ? (
          <p className="text-xs text-slate-500 py-12 text-center">No metric entries logged yet. Add your first measurement above.</p>
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="weightKg" stroke="#10B981" strokeWidth={2} fill="url(#weightGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Measurement Log Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Log Current Measurements</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Body Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 74.5"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={waistCm}
                    onChange={(e) => setWaistCm(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={chestCm}
                    onChange={(e) => setChestCm(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Arms (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={armsCm}
                    onChange={(e) => setArmsCm(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
                >
                  {logMutation.isPending ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};