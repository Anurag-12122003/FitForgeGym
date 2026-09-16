import { ArrowRight, Dumbbell, Lock, Mail, User as UserIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [userData,setUserData]=useState({
    email:'',
    password:'',
    fullName:''
  })
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(userData);
    navigate('/onboarding');
  };
  const handleChangeData=(name:string, value:string)=>{
    setUserData((prev)=>({
      ...prev,
      [name]:value
    }))
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-slate-800 bg-[#111827] shadow-2xl">
        
        {/* Left Side: Brand Visual Card */}
        <div className="relative hidden md:flex flex-col justify-between p-8 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80')` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
          
          <div className="relative z-10 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Fit<span className="text-emerald-400">Forge</span></span>
          </div>

          <div className="relative z-10 space-y-2">
            <h3 className="text-2xl font-bold text-white leading-tight">Your Goals.<br /><span className="text-emerald-400">Our Mission.</span></h3>
            <p className="text-xs text-slate-400">Log every lift, master your macros, and push your absolute limits daily.</p>
          </div>
        </div>

        {/* Right Side: Auth Inputs */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="flex items-center justify-center text-white p-1 mb-6"> 
            Create Account
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={userData?.fullName}
                    onChange={(e) => handleChangeData('fullName',e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={userData?.email}
                  onChange={(e) => handleChangeData('email',e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={userData?.password}
                  onChange={(e) => handleChangeData('password',e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 shadow-md shadow-emerald-500/20 mt-2"
            >
              {'Create Account'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-slate-500">
            By continuing, you agree to FitForge's Terms & Conditions.
          </p>
        </div>

      </div>
    </div>
  );
};