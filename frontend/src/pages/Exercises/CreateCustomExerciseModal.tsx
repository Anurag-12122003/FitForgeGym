import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dumbbell, Upload, X, Loader2 } from 'lucide-react';
import { uploadApi } from '../../api/uploadApi';

const MUSCLE_CHOICES = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Abs', 'Calves'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (exercise: any) => void;
}

export const CreateCustomExerciseModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [sets, setSets] = useState(3);
  const [targetWeight, setTargetWeight] = useState(10);
  const [repsMin, setRepsMin] = useState(8);
  const [repsMax, setRepsMax] = useState(12);
  const [restSeconds, setRestSeconds] = useState(90);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: uploadApi.createUserExercise,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      if (onCreated) onCreated(data.exercise);
      onClose();
      reset();
    },
  });

  const reset = () => {
    setName('');
    setDescription('');
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate({
      name,
      description,
      difficulty,
      image: imageFile || undefined,
      defaultSets: Number(sets),
      repsMin: Number(repsMin),
      repsMax: Number(repsMax),
      restSeconds: Number(restSeconds),
      targetWeightKg:Number(targetWeight),
      instructions: ['Execute with controlled cadence.'],
      commonMistakes: ['Rushing sets without full lockout.'],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col font-sans">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-emerald-400" />
            Create Personal Custom Exercise
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Exercise Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ring Dips (Weighted)"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Description / Cues</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keep elbows close, lean forward for chest emphasis..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Difficulty Level</label>
            <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option>BEGINNER</option>
                  <option>INTERMEDIATE</option>
                  <option>ADVANCED</option>
                </select>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Sets</label>
              <input
                type="number"
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Min Reps</label>
              <input
                type="number"
                value={repsMin}
                onChange={(e) => setRepsMin(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Max Reps</label>
              <input
                type="number"
                value={repsMax}
                onChange={(e) => setRepsMax(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Rest (sec)</label>
              <input
                type="number"
                value={restSeconds}
                onChange={(e) => setRestSeconds(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Target Weight</label>
              <input
                type="number"
                value={targetWeight}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Photo / Demo Upload */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Exercise Reference Image (Optional)</label>
            {previewUrl ? (
              <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-700">
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-black/60 p-1 rounded-lg text-white hover:bg-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-24 w-full rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 hover:border-emerald-500/50 cursor-pointer">
                <Upload className="h-5 w-5 text-slate-500 mb-1" />
                <span className="text-xs text-slate-300">Upload Media</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition flex items-center justify-center gap-2"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {createMutation.isPending ? 'Uploading & Creating...' : 'Save My Exercise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};