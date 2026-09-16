import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Dumbbell, Check } from 'lucide-react';

const goals = [
  { value: 'BUILD_MUSCLE', label: 'Build Muscle' },
  { value: 'LOSE_FAT', label: 'Lose Fat' },
  { value: 'MAINTAIN_WEIGHT', label: 'Maintain Weight' },
  { value: 'IMPROVE_STRENGTH', label: 'Build Strength' },
  { value: 'IMPROVE_ENDURANCE', label: 'Improve Endurance' },
  { value: 'GENERAL_FITNESS', label: 'General Fitness' },
];

export const OnboardingPage: React.FC = () => {
  const { completeProfile } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    gender: 'MALE',
    age: '',
    heightCm: '',
    weightKg: '',
    fitnessLevel: 'BEGINNER',
    primaryGoal: ''
  })
  const handleDataChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const dataChange = (name: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }))
  }
  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...profileData,
      age: Number(profileData.age),
      heightCm: Number(profileData.heightCm),
      weightKg: Number(profileData.weightKg),
    };
    completeProfile(payload);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-[#111827] p-8 shadow-xl">

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">FitForge Profile Setup</span>
          </div>
          {/* <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
            Step 1 of 1
          </span> */}
        </div>

        <h2 className="text-xl font-bold mb-1 text-white">Let's personalise your plan</h2>
        <p className="text-xs text-slate-400 mb-6">These metrics calculate your daily basal calories and volume threshold.</p>

        <form onSubmit={handleFinish} className="space-y-5">
          {/* Gender Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Gender</label>
            <div className="grid grid-cols-3 gap-3">
              {(['MALE', 'FEMALE'] as const).map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => dataChange('gender', item)}
                  className={`py-2 text-xs font-medium rounded-lg border transition ${profileData?.gender === item
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Age</label>
              <input
                type="number"
                name='age'
                value={profileData?.age}
                onChange={handleDataChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Height (cm)</label>
              <input
                type="number"
                name='heightCm'
                value={profileData?.heightCm}
                onChange={handleDataChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={profileData?.weightKg}
                name='weightKg'
                onChange={handleDataChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Experience Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Training Experience</label>
            <div className="grid grid-cols-3 gap-3">
              {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => dataChange('fitnessLevel', lvl)}
                  className={`py-2 text-xs font-medium rounded-lg border transition ${profileData?.fitnessLevel === lvl
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Target Goal</label>
            <div className="grid grid-cols-3 gap-3">
              {goals.map((goal) => (
                <button
                  type="button"
                  key={goal?.value}
                  name='primaryGoal'
                  onClick={() => dataChange('primaryGoal', goal?.value)}
                  className={`py-2 text-xs font-medium rounded-lg border transition ${profileData?.primaryGoal === goal?.value
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                >
                  {goal?.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 mt-6"
          >
            <Check className="h-4 w-4" />
            Complete Profile & Go to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};