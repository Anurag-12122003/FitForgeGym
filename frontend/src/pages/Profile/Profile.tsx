import React, { useState } from 'react';
import { User, Lock, Check, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, completeProfile } = useAuth();
  const [name] = useState(user?.fullName ?? '');
  const [email] = useState(user?.email ?? '');

  const [age, setAge] = useState<number | ''>(user?.profile?.age ?? '');
  const [height, setHeight] = useState<number | ''>(
    user?.profile?.heightCm ?? ''
  );
  const [weight, setWeight] = useState<number | ''>(
    user?.profile?.weightKg ?? ''
  );

  const [fitnessLevel, setFitnessLevel] = useState(
    user?.profile?.fitnessLevel ?? ''
  );

  const [fitnessGoal, setFitnessGoal] = useState(
    user?.profile?.primaryGoal ?? ''
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const genderUser=user?.profile?.gender === "MALE" ? "MALE" : "FEMALE"
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();

    setSavedSuccess(true);
    const payload = {
      gender:genderUser,
      fitnessLevel:fitnessLevel,
      primaryGoal:fitnessGoal,
      age: Number(age),
      heightCm: Number(height),
      weightKg: Number(weight),
    };
    completeProfile(payload);

    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  const displayValue = (value: string | number | null | undefined) =>
    value !== null && value !== undefined && value !== ''
      ? value
      : 'Not set';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Account & Profile Settings
        </h1>

        <p className="text-xs text-slate-400 mt-1">
          Manage personal metrics, security preferences, and fitness benchmarks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Profile Summary */}
        <div className="md:col-span-4 rounded-2xl border border-slate-800/80 bg-[#111827] p-6 text-center space-y-4">
          <div className="relative mx-auto h-24 w-24 rounded-full border-2 border-emerald-500/40 bg-slate-900 flex items-center justify-center text-3xl font-black text-emerald-400">
            {name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div>
            <h2 className="text-base font-bold text-white">
              {displayValue(name)}
            </h2>

            <p className="text-xs text-slate-400">
              {displayValue(email)}
            </p>

            <span className="mt-2 inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 text-[10px] font-bold text-emerald-400">
              {user?.role ?? 'USER'}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-left space-y-3 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Fitness Level:</span>
              <strong className="text-white">
                {displayValue(fitnessLevel)}
              </strong>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Goal:</span>
              <strong className="text-white text-right max-w-[170px]">
                {displayValue(fitnessGoal)}
              </strong>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Current Weight:</span>
              <strong className="text-emerald-400">
                {weight !== '' && weight !== null && weight !== undefined
                  ? `${weight} kg`
                  : 'Not set'}
              </strong>
            </div>
          </div>
        </div>

        {/* Editable Forms */}
        <div className="md:col-span-8 space-y-6">
          {/* Personal & Physical Metrics */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#111827] p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-400" />
              Personal & Physical Metrics
            </h3>

            <form onSubmit={handleProfileSave} className="space-y-4">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    // onChange={(e) => setName(e.target.value)}
                    disabled
                    // placeholder="Enter full name"
                    // className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/30 p-2.5 text-xs text-slate-500 cursor-not-allowed"
                    />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Email Address
                  </label>

                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/30 p-2.5 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Age / Height / Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Age
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) =>
                      setAge(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="Age"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Height (cm)
                  </label>

                  <input
                    type="number"
                    min="50"
                    max="250"
                    value={height}
                    onChange={(e) =>
                      setHeight(
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    placeholder="Height"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Weight (kg)
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="500"
                    value={weight}
                    onChange={(e) =>
                      setWeight(
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    placeholder="Weight"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Fitness Level */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Fitness Level
                </label>

                <div className="relative">
                  <select
                    value={fitnessLevel}
                    onChange={(e) => setFitnessLevel(e.target.value)}
                    className="
        w-full appearance-none
        rounded-xl
        border border-slate-700/80
        bg-slate-900/80
        px-3.5 py-3 pr-10
        text-xs font-medium text-white
        shadow-sm shadow-black/20
        outline-none
        transition-all duration-200
        cursor-pointer

        hover:border-slate-600
        hover:bg-slate-900

        focus:border-emerald-500
        focus:ring-2
        focus:ring-emerald-500/10
        focus:bg-slate-900

        [&>option]:bg-slate-900
        [&>option]:text-white
        [&>option]:py-2
      "
                  >
                    <option value="" disabled>
                      Select fitness level
                    </option>

                    <option value="BEGINNER">
                      Beginner
                    </option>

                    <option value="INTERMEDIATE">
                      Intermediate
                    </option>

                    <option value="ADVANCED">
                      Advanced
                    </option>
                  </select>

                  {/* Custom Arrow */}
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg
                      className="h-4 w-4 text-slate-500 transition-colors duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>


              {/* Primary Goal */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Primary Goal
                </label>

                <input
                  type="text"
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  placeholder="Enter primary fitness goal"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Save */}
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
              >
                {savedSuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {savedSuccess ? 'Changes Saved!' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Password & Security */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#111827] p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-400" />
              Update Password
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Current Password
                  </label>

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
