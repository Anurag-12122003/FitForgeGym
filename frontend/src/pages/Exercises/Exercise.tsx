import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Dumbbell, ChevronRight, Loader2, X, Filter } from 'lucide-react';
import { exerciseApi } from '../../api/exerciseApi';

// High-level muscle groups for clean UI tabs
const MUSCLE_PILLS = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Abs',
  'Calves',
];

// Map broad tabs to specific sub-regions coming from your database API
const MUSCLE_REGION_MAPPING: Record<string, string[]> = {
  Chest: ['chest', 'upper chest', 'middle chest', 'lower chest'],
  Back: ['back', 'lats', 'mid back', 'upper back', 'lower back'],
  Shoulders: ['shoulders', 'front delts', 'side delts', 'rear delts'],
  Biceps: ['biceps', 'biceps long head', 'biceps short head', 'brachialis'],
  Triceps: ['triceps', 'triceps lateral head', 'triceps medial head', 'triceps long head'],
  Quads: ['quads'],
  Hamstrings: ['hamstrings'],
  Glutes: ['glutes', 'glute max'],
  Abs: ['abs', 'upper abs', 'lower abs', 'obliques'],
  Calves: ['calves'],
};

export const ExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: exerciseApi.getAll,
  });

  // Accurate filtering matching API response structure
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex: any) => {
      // 1. Text Search (name, description, equipment name)
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        ex.name.toLowerCase().includes(query) ||
        (ex.description && ex.description.toLowerCase().includes(query)) ||
        (ex.equipment?.name && ex.equipment.name.toLowerCase().includes(query));

      // 2. Difficulty Filter
      const matchesDifficulty =
        selectedDifficulty === 'ALL' || ex.difficulty === selectedDifficulty;

      // 3. Muscle Matching (checks region, muscle.name, and muscle.slug)
      let matchesMuscle = true;
      if (selectedMuscle !== 'All') {
        const allowedKeywords = MUSCLE_REGION_MAPPING[selectedMuscle] || [
          selectedMuscle.toLowerCase(),
        ];

        const exerciseMuscles = (ex.muscles || []).map((m: any) => ({
          name: m.muscle?.name?.toLowerCase() || '',
          slug: m.muscle?.slug?.toLowerCase() || '',
          region: m.region?.toLowerCase() || '',
        }));

        matchesMuscle = exerciseMuscles.some((m: any) =>
          allowedKeywords.some(
            (kw) =>
              m.name.includes(kw) ||
              m.region.includes(kw) ||
              m.slug.includes(kw)
          )
        );
      }

      return matchesSearch && matchesDifficulty && matchesMuscle;
    });
  }, [exercises, searchQuery, selectedMuscle, selectedDifficulty]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Exercise Library
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore mechanics, target muscles, and volume prescriptions.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <strong className="text-emerald-400">{filteredExercises.length}</strong> of{' '}
          {exercises.length} movements
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="space-y-3 bg-[#111827] border border-slate-800/80 rounded-2xl p-4">
        {/* Search Bar + Difficulty */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise name, equipment (Barbell, Cable), mechanics..."
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 py-2.5 pl-10 pr-9 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0 w-full sm:w-auto justify-center">
            {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedDifficulty(lvl)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                  selectedDifficulty === lvl
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Target Muscle Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
          <Filter className="h-3.5 w-3.5 text-slate-500 shrink-0 ml-1" />
          {MUSCLE_PILLS.map((muscle) => {
            const isActive = selectedMuscle === muscle;
            return (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(muscle)}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {muscle}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Cards Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-xs">Loading movements catalog...</p>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-[#111827] p-12 text-center space-y-3">
          <Dumbbell className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Exercises Match Your Filter</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting the target muscle group or clear your search keyword.
          </p>
          <button
            onClick={() => {
              setSelectedMuscle('All');
              setSelectedDifficulty('ALL');
              setSearchQuery('');
            }}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExercises.map((exercise: any) => {
            // Find Primary Muscle region or name from your API response
            const primaryObj = exercise.muscles?.find((m: any) => m.role === 'PRIMARY');
            const primaryName = primaryObj?.region || primaryObj?.muscle?.name || 'General';

            // Find all secondary muscles
            const secondaries = (exercise.muscles || [])
              .filter((m: any) => m.role === 'SECONDARY')
              .map((m: any) => m.region || m.muscle?.name)
              .slice(0, 2);

            return (
              <div
                key={exercise.id}
                onClick={() => navigate(`/exercises/${exercise.slug}`)}
                className="group cursor-pointer rounded-2xl border border-slate-800/80 bg-[#111827] overflow-hidden transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between"
              >
                <div>
                  {/* Media Banner */}
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={
                        exercise.imageUrl ||
                        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={exercise.name}
                      className="h-full w-full object-cover opacity-85 group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />

                    {/* Primary Badge & Difficulty */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        {primaryName}
                      </span>
                      <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-slate-300 border border-slate-700">
                        {exercise.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition leading-snug">
                        {exercise.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {exercise.description || 'Verified kinetic movement pattern.'}
                      </p>
                    </div>

                    {/* Equipment & Secondary Muscles */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/70 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        <Dumbbell className="h-3 w-3 text-slate-400" />
                        {exercise.equipment?.name || 'Bodyweight'}
                      </span>

                      {secondaries.map((secName: string, idx: number) => (
                        <span
                          key={idx}
                          className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-400"
                        >
                          +{secName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="border-t border-slate-800/80 px-5 py-3 flex items-center justify-between text-xs font-semibold text-slate-400 bg-slate-900/30">
                  <span className="font-mono">
                    {exercise.defaultSets} sets × {exercise.repsMin}-{exercise.repsMax}
                  </span>
                  <div className="flex items-center gap-1 text-emerald-400 group-hover:translate-x-1 transition">
                    View Mechanics <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};