import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Scale, Trophy, Flame, TrendingUp, Plus, Loader2, Trash2, Calendar, Ruler } from 'lucide-react';
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

type MetricTab = 'weightKg' | 'waistCm' | 'chestCm' | 'armsCm';

export const ProgressPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMetricTab, setActiveMetricTab] = useState<MetricTab>('weightKg');

  // Form inputs
  const [weightKg, setWeightKg] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [armsCm, setArmsCm] = useState('');
  const [bodyFatPct, setBodyFatPct] = useState('');
  const [notes, setNotes] = useState('');

  // Queries
  const { data: progressRecords = [], isLoading } = useQuery({
    queryKey: ['progress-records'],
    queryFn: progressApi.getLogs,
  });

  const { data: summary } = useQuery({
    queryKey: ['progress-summary'],
    queryFn: progressApi.getSummary,
  });

  // Mutations
  const logMutation = useMutation({
    mutationFn: progressApi.logMetrics,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-records'] });
      queryClient.invalidateQueries({ queryKey: ['progress-summary'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: progressApi.deleteLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-records'] });
      queryClient.invalidateQueries({ queryKey: ['progress-summary'] });
    },
  });

  const resetForm = () => {
    setWeightKg('');
    setWaistCm('');
    setChestCm('');
    setArmsCm('');
    setBodyFatPct('');
    setNotes('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg) return;
    logMutation.mutate({
      weightKg: parseFloat(weightKg),
      bodyFatPct: bodyFatPct ? parseFloat(bodyFatPct) : undefined,
      waistCm: waistCm ? parseFloat(waistCm) : undefined,
      chestCm: chestCm ? parseFloat(chestCm) : undefined,
      armsCm: armsCm ? parseFloat(armsCm) : undefined,
    });
  };

  // Chart data formatting based on active metric tab
  const chartData = progressRecords
    .filter((r) => r[activeMetricTab] !== null && r[activeMetricTab] !== undefined)
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: r[activeMetricTab],
    }));

  const metricLabelMap: Record<MetricTab, { title: string; unit: string; color: string }> = {
    weightKg: { title: 'Body Weight', unit: 'kg', color: '#10B981' },
    waistCm: { title: 'Waist Circumference', unit: 'cm', color: '#06B6D4' },
    chestCm: { title: 'Chest Measurement', unit: 'cm', color: '#F59E0B' },
    armsCm: { title: 'Arms Circumference', unit: 'cm', color: '#8B5CF6' },
  };

  const latestRecord = progressRecords[progressRecords.length - 1];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Progress & Body Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track weight trajectories, body circumferences, and cumulative workout volume.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          Log Measurements
        </button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed Sessions</span>
            <Trophy className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{summary?.completedSessions || 0}</p>
          <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Verified finished workouts</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tonnage Lifted</span>
            <Scale className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {((summary?.totalTonnageKg || 0) / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">kg</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Cumulative volume moved</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Recorded Weigh-ins</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{progressRecords.length}</p>
          <p className="text-[10px] text-amber-400 mt-1 font-semibold">Logged biometrics</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Current Weight</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {latestRecord?.weightKg || '--'} <span className="text-xs font-normal text-slate-400">kg</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Latest weigh-in</p>
        </div>
      </div>

      {/* Trajectory Area Chart Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">{metricLabelMap[activeMetricTab].title} Trajectory</h2>
            <p className="text-xs text-slate-400">Historical trend progression over time</p>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex flex-wrap rounded-xl bg-slate-900 border border-slate-800 p-1">
            {(['weightKg', 'waistCm', 'chestCm', 'armsCm'] as MetricTab[]).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setActiveMetricTab(tabKey)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  activeMetricTab === tabKey
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {metricLabelMap[tabKey].title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        ) : chartData.length === 0 ? (
          <p className="text-xs text-slate-500 py-16 text-center italic">
            No entries found for {metricLabelMap[activeMetricTab].title}. Log your measurements to visualize data.
          </p>
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricLabelMap[activeMetricTab].color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={metricLabelMap[activeMetricTab].color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis
                  domain={['dataMin - 1', 'dataMax + 1']}
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  unit={metricLabelMap[activeMetricTab].unit}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={metricLabelMap[activeMetricTab].color}
                  strokeWidth={2}
                  fill="url(#metricGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Historical Measurements Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Logged History Entries</h2>
          </div>
          <span className="text-xs text-slate-500">{progressRecords.length} records</span>
        </div>

        {progressRecords.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center italic">No measurement logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">DATE</th>
                  <th className="pb-3">WEIGHT</th>
                  <th className="pb-3">BODY FAT</th>
                  <th className="pb-3">WAIST</th>
                  <th className="pb-3">CHEST</th>
                  <th className="pb-3">ARMS</th>
                  <th className="pb-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {[...progressRecords].reverse().map((record) => (
                  <tr key={record.id} className="hover:bg-slate-900/40">
                    <td className="py-3 text-slate-300 font-mono">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 font-bold text-emerald-400">{record.weightKg} kg</td>
                    <td className="py-3 text-slate-400">{record.bodyFatPct ? `${record.bodyFatPct}%` : '--'}</td>
                    <td className="py-3 text-slate-300">{record.waistCm ? `${record.waistCm} cm` : '--'}</td>
                    <td className="py-3 text-slate-300">{record.chestCm ? `${record.chestCm} cm` : '--'}</td>
                    <td className="py-3 text-slate-300">{record.armsCm ? `${record.armsCm} cm` : '--'}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => deleteMutation.mutate(record.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition"
                        title="Delete log"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Measurement Log Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Ruler className="h-4 w-4 text-emerald-400" />
              Log Current Measurements
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="74.5"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFatPct}
                    onChange={(e) => setBodyFatPct(e.target.value)}
                    placeholder="14.5"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={waistCm}
                    onChange={(e) => setWaistCm(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={chestCm}
                    onChange={(e) => setChestCm(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Arms (cm)</label>
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
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition flex items-center justify-center gap-1.5"
                >
                  {logMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
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