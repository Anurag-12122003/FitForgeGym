import React from 'react';
import { Dumbbell, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export const Navbar: React.FC = () => {
    const navigate=useNavigate();
    const onLoginClick=()=>{
        navigate('/login')
    }
    const onRegisterClick=()=>{
        navigate('/register')
    }
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Dumbbell className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Fit<span className="text-emerald-400">Forge</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="transition hover:text-emerald-400">Workout Plans</a>
          <a href="#exercises" className="transition hover:text-emerald-400">Exercise Library</a>
          <a href="#nutrition" className="transition hover:text-emerald-400">Diet & Nutrition</a>
          {/* <a href="#progress" className="transition hover:text-emerald-400">Tracker</a> */}
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onLoginClick}
            className="text-sm font-medium cursor-pointer text-slate-300 transition hover:text-white"
          >
            Login
          </button>
          <button 
            onClick={onRegisterClick}
            className="flex items-center gap-2 cursor-pointer rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#0B0F19] transition hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </header>
  );
};