import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Utensils, Upload, X, Loader2 } from 'lucide-react';
import { foodApi, type FoodItem,  } from '../../api/foodApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (food: FoodItem) => void;
}

export const CreateCustomFoodModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [servingAmount, setServingAmount] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('0');

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: foodApi.createUserFood,
    onSuccess: (newFood) => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      if (onCreated) onCreated(newFood);
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setFiber('0');
    setFile(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !calories) return;

    createMutation.mutate({
      name: name.trim(),
      servingAmount: parseFloat(servingAmount) || 100,
      servingUnit,
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      fiber: parseFloat(fiber) || 0,
      file: file || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Utensils className="h-4 w-4 text-emerald-400" />
            Add Custom Food / Recipe
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto pr-1 flex-1">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Food Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Homemade Sattu Shake"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Serving Amount</label>
              <input
                type="number"
                value={servingAmount}
                onChange={(e) => setServingAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Unit</label>
              <select
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
              >
                <option value="g">Grams (g)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="scoop">Scoop</option>
                <option value="piece">Piece / Item</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Calories (kcal) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="250"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Protein (g) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="20"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Carbs (g)</label>
              <input
                type="number"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="30"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Fat (g)</label>
              <input
                type="number"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="5"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Fiber (g)</label>
              <input
                type="number"
                step="0.1"
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Food Photo (Optional)</label>
            {previewUrl ? (
              <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-700">
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-black/60 p-1 rounded-lg text-white hover:bg-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-20 w-full rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 hover:border-emerald-500/50 cursor-pointer">
                <Upload className="h-4 w-4 text-slate-500 mb-1" />
                <span className="text-[11px] text-slate-300">Upload Food Image</span>
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 py-2 rounded-xl bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition flex items-center justify-center gap-2"
            >
              {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {createMutation.isPending ? 'Saving...' : 'Save & Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};