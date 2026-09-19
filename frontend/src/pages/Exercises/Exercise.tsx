import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Dumbbell, ChevronRight, Loader2 } from 'lucide-react';
import { exerciseApi } from '../../api/exerciseApi';

const MUSCLE_PILLS = [
  'All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Abs'
];
export const ExercisesPage: React.FC = () => {
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: exerciseApi.getAll,
  });

  const filteredExercises = exercises.filter((ex) => {
    const muscles =
      ex.muscles?.map((m) => m.muscle.name.toLowerCase()) || [];

    const matchesMuscle =
      selectedMuscle === 'All' ||
      muscles.includes(selectedMuscle.toLowerCase());

    const matchesQuery =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesMuscle && matchesQuery;
  });


  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Exercise Library</h1>
        <p className="text-xs text-slate-400 mt-1">Explore target muscle mechanics and volume parameters.</p>
      </div>

      <div className="space-y-4">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises by name..."
            className="w-full rounded-xl border border-slate-800 bg-[#111827] py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {MUSCLE_PILLS.map((muscle) => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${selectedMuscle === muscle
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExercises.map((exercise) => {
            const primaryMuscle = exercise.muscles?.find((m) => m.role === 'PRIMARY')?.muscle.name || 'General';
            return (
              <div
                key={exercise.id}
                onClick={() => navigate(`/exercises/${exercise.slug}`)}
                className="group cursor-pointer rounded-2xl border border-slate-800/80 bg-[#111827] overflow-hidden transition hover:border-slate-700 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-950">
                    <img
                      src={exercise.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'}
                      alt={exercise.name}
                      className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-3 left-3 rounded-md bg-[#0B0F19]/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      {primaryMuscle}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                      {exercise.name}
                    </h3>
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                      <Dumbbell className="h-3.5 w-3.5 text-slate-500" />
                      <span>{exercise.equipment?.name || 'Standard Equipment'}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 px-5 py-3 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>{exercise.defaultSets} sets × {exercise.repsMin}-{exercise.repsMax} reps</span>
                  <div className="flex items-center gap-1 text-emerald-400">
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