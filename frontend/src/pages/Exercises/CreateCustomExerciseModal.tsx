import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dumbbell, Upload, X, Loader2 } from 'lucide-react';
import { uploadApi } from '../../api/uploadApi';
import { exerciseApi } from '../../api/exerciseApi';

interface MuscleOption {
  id: string;
  name: string;
}

interface EquipmentOption {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (exercise: any) => void;
  muscles?: MuscleOption[];
  equipments?: EquipmentOption[];
}

type ExerciseFormData = {
  exName: string;
  exDescription: string;
  exDifficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  exMuscle: string;
  exSecondaryMuscles: string[];
  exEquipment: string;
  set: number | string;
  repsMin: number | string;
  repsMax: number | string;
  restTime: number | string;
  targetWeightKg: number | string;
  instructions: string[];
  commonMistakes: string[];
  exPreviewUrl: string | null;
};

export const CreateCustomExerciseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCreated,
  muscles = [],
  equipments = []
}) => {
  const queryClient = useQueryClient();

  const [exerciseFormData, setExerciseFormData] = useState<ExerciseFormData>({
    exName: '',
    exDescription: '',
    exDifficulty: 'INTERMEDIATE',
    exMuscle: '',
    exSecondaryMuscles: [],
    exEquipment: '',
    set: 3,
    repsMin: 8,
    repsMax: 12,
    restTime: 90,
    targetWeightKg: 10,
    instructions: [],
    commonMistakes: [],
    exPreviewUrl: null,
  });

  const [exFile, setExFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [currentMistake, setCurrentMistake] = useState('');

  const handleExerciseDataChange = <K extends keyof ExerciseFormData>(name: K, value: ExerciseFormData[K]) => {
    setExerciseFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExerciseImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExFile(file);
      handleExerciseDataChange('exPreviewUrl', URL.createObjectURL(file));
    }
  };

  const addInstruction = () => {
    if (!currentInstruction.trim()) return;
    handleExerciseDataChange('instructions', [...exerciseFormData.instructions, currentInstruction.trim()]);
    setCurrentInstruction('');
  };

  const removeInstruction = (index: number) => {
    handleExerciseDataChange('instructions', exerciseFormData.instructions.filter((_, i) => i !== index));
  };

  const addMistake = () => {
    if (!currentMistake.trim()) return;
    handleExerciseDataChange('commonMistakes', [...exerciseFormData.commonMistakes, currentMistake.trim()]);
    setCurrentMistake('');
  };

  const removeMistake = (index: number) => {
    handleExerciseDataChange('commonMistakes', exerciseFormData.commonMistakes.filter((_, i) => i !== index));
  };

  const toggleSecondaryMuscle = (muscleId: string) => {
    setExerciseFormData((prev) => {
      const exists = prev.exSecondaryMuscles.includes(muscleId);
      return {
        ...prev,
        exSecondaryMuscles: exists
          ? prev.exSecondaryMuscles.filter((id) => id !== muscleId)
          : [...prev.exSecondaryMuscles, muscleId],
      };
    });
  };

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Backend multipart/form-data expect karta hai kyunki file upload enable hai
      const formData = new FormData();
      formData.append('name', exerciseFormData.exName);
      formData.append('description', exerciseFormData.exDescription);
      formData.append('difficulty', exerciseFormData.exDifficulty);
      formData.append('defaultSets', String(exerciseFormData.set));
      formData.append('repsMin', String(exerciseFormData.repsMin));
      formData.append('repsMax', String(exerciseFormData.repsMax));
      formData.append('restSeconds', String(exerciseFormData.restTime));

      // Relations pass karein
      if (exerciseFormData.exMuscle) {
        formData.append('primaryMuscleId', exerciseFormData.exMuscle);
      }
      if (exerciseFormData.exEquipment) {
        formData.append('equipmentId', exerciseFormData.exEquipment);
      }
      if (exerciseFormData.exSecondaryMuscles.length > 0) {
        formData.append('secondaryMuscleIds', JSON.stringify(exerciseFormData.exSecondaryMuscles));
      }

      // JSON Arrays
      formData.append('instructions', JSON.stringify(exerciseFormData.instructions));
      formData.append('commonMistakes', JSON.stringify(exerciseFormData.commonMistakes));

      // Media file agar choose ki hai
      if (exFile) {
        formData.append('image', exFile);
      }

      const createdEx = await uploadApi.createUserExercise(formData as any);

      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      if (onCreated) onCreated(createdEx);
      onClose();

      // Reset state
      setExFile(null);
      setExerciseFormData({
        exName: '',
        exDescription: '',
        exDifficulty: 'INTERMEDIATE',
        exMuscle: '',
        exSecondaryMuscles: [],
        exEquipment: '',
        set: 3,
        repsMin: 8,
        repsMax: 12,
        restTime: 90,
        targetWeightKg: 10,
        instructions: [],
        commonMistakes: [],
        exPreviewUrl: null,
      });
    } catch (err) {
      console.error('Failed to create and upload exercise:', err);
    } finally {
      setIsProcessing(false);
    }
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

        <form onSubmit={handleCreateExercise}
          className="space-y-4 overflow-y-auto pr-1 flex-1 [&::-webkit-scrollbar]:w-0">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Exercise Title *</label>
            <input
              type="text"
              required
              value={exerciseFormData.exName}
              onChange={(e) => handleExerciseDataChange('exName', e.target.value)}
              placeholder="e.g. Incline Dumbbell Bench Press"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Description / Overview</label>
            <textarea
              rows={2}
              value={exerciseFormData.exDescription}
              onChange={(e) => handleExerciseDataChange('exDescription', e.target.value)}
              placeholder="Primary movement targeting clavicular head..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* PRIMARY MUSCLE */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Primary Muscle *</label>
              <select
                value={exerciseFormData.exMuscle}
                onChange={(e) => handleExerciseDataChange('exMuscle', e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select muscle</option>
                {muscles.map((muscle) => (
                  <option key={muscle.id} value={muscle.id}>
                    {muscle.name}
                  </option>
                ))}
              </select>
            </div>

            {/* EQUIPMENT */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Equipment *</label>
              <select
                value={exerciseFormData.exEquipment}
                onChange={(e) => handleExerciseDataChange('exEquipment', e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select Equipment</option>
                {equipments.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name}
                  </option>
                ))}
              </select>
            </div>

            {/* DIFFICULTY */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Difficulty</label>
              <select
                value={exerciseFormData.exDifficulty}
                onChange={(e) => handleExerciseDataChange('exDifficulty', e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          {/* SECONDARY MUSCLES */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Secondary Muscles Involved</label>
            <div className="flex flex-wrap gap-1.5">
              {muscles
                .filter((muscle) => muscle.id !== exerciseFormData.exMuscle)
                .map((muscle) => {
                  const isSelected = exerciseFormData.exSecondaryMuscles.includes(muscle.id);
                  return (
                    <button
                      type="button"
                      key={muscle.id}
                      onClick={() => toggleSecondaryMuscle(muscle.id)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${isSelected
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                      {muscle.name} {isSelected && ' ✓'}
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 p-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Sets</label>
              <input
                type="number"
                value={exerciseFormData.set}
                onChange={(e) => handleExerciseDataChange('set', e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Min Reps</label>
              <input
                type="number"
                value={exerciseFormData.repsMin}
                onChange={(e) => handleExerciseDataChange('repsMin', e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Max Reps</label>
              <input
                type="number"
                value={exerciseFormData.repsMax}
                onChange={(e) => handleExerciseDataChange('repsMax', e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Rest (sec)</label>
              <input
                type="number"
                value={exerciseFormData.restTime}
                onChange={(e) => handleExerciseDataChange('restTime', e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Target (Kg)</label>
              <input
                type="number"
                value={exerciseFormData.targetWeightKg}
                onChange={(e) => handleExerciseDataChange('targetWeightKg', e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Instructions Builder */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Execution Steps (Instructions)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentInstruction}
                onChange={(e) => setCurrentInstruction(e.target.value)}
                placeholder="e.g. Squeeze scapula before pressing"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addInstruction}
                className="rounded-xl bg-slate-800 px-3 text-xs font-bold text-emerald-400 hover:bg-slate-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-1">
              {exerciseFormData.instructions.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
                  <span>{idx + 1}. {item}</span>
                  <button type="button" onClick={() => removeInstruction(idx)} className="text-slate-500 hover:text-red-400">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes Builder */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Common Mistakes</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentMistake}
                onChange={(e) => setCurrentMistake(e.target.value)}
                placeholder="e.g. Elbow flaring past 90 degrees"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addMistake}
                className="rounded-xl bg-slate-800 px-3 text-xs font-bold text-amber-400 hover:bg-slate-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-1">
              {exerciseFormData.commonMistakes.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
                  <span>• {item}</span>
                  <button type="button" onClick={() => removeMistake(idx)} className="text-slate-500 hover:text-red-400">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Photo Input */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Exercise Reference Media</label>
            {exerciseFormData.exPreviewUrl ? (
              <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-700">
                <img src={exerciseFormData.exPreviewUrl} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setExFile(null);
                    handleExerciseDataChange('exPreviewUrl', null);
                  }}
                  className="absolute top-2 right-2 bg-black/60 p-1 rounded-lg text-white hover:bg-red-500/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-28 w-full rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 hover:border-emerald-500/50 cursor-pointer">
                <Upload className="h-5 w-5 text-slate-500 mb-1" />
                <span className="text-xs text-slate-300">Upload Exercise Image</span>
                <input type="file" accept="image/*,video/*" onChange={handleExerciseImageSelect} className="hidden" />
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
              disabled={isProcessing}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition flex items-center justify-center gap-2"
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
              {isProcessing ? 'Processing...' : 'Publish to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};