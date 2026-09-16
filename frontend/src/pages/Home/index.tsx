import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { FeatureCard } from './components/FeatureCard';
import { 
  Dumbbell, 
  Flame, 
  CalendarDays, 
  LineChart, 
  Utensils, 
  Layers,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Workout Plans",
    description: "Predefined & custom routines tuned for hypertrophy, strength, or fat loss."
  },
  {
    icon: Layers,
    title: "Exercise Library",
    description: "Step-by-step instructions, target muscles, and common mistake breakdowns."
  },
  {
    icon: Utensils,
    title: "Diet & Nutrition",
    description: "Precision macro targets and structured meal plans for muscle gain and cutting."
  },
  {
    icon: LineChart,
    title: "Progress Tracker",
    description: "Log sets, progressive overload, body measurements, and visualize trends."
  }
];

const MUSCLE_GROUPS = ["Chest","Back","Shoulders","Biceps","Triceps","Forearms","Abs","Lower Back","Glutes","Quads","Calves","Traps","Neck"];
// ,"Adductors","Abductors", "Hamstrings", "Obliques"

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* 1. Header Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden py-16 lg:py-24 border-b border-slate-800/60">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-[600px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
              
              {/* Left Hero Content */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <Flame className="h-3.5 w-3.5" />
                  Your Smart Fitness System
                </div>
                
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
                  Build a Stronger, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    Healthier You
                  </span>
                </h1>

                <p className="max-w-xl text-base sm:text-lg text-slate-400">
                  Personalized workout plans, comprehensive muscle guides, intuitive routine customization, and macro tracking — all in one unified platform.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-[#0B0F19] hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 transition">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className="rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition">
                    Explore Exercises
                  </button>
                </div>

                {/* Micro trust checklist */}
                <div className="flex flex-wrap gap-6 pt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> No credit card required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Evidence-based routines
                  </span>
                </div>
              </div>

              {/* Right Hero Image Card (Mocking the dark gym visual) */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=80" 
                    alt="Fitness Athlete Physique" 
                    className="h-96 w-full object-cover opacity-80 transition duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-slate-800 bg-[#0B0F19]/90 p-4 backdrop-blur-md">
                    <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Today's Focus</p>
                    <p className="text-sm font-bold text-white">Chest Hypertrophy & Arms</p>
                    <p className="text-xs text-slate-400 mt-1">4 Exercises • 14 Sets • ~50 Mins</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. Core Modules Grid */}
        <section id="features" className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Engineered For Complete Progression
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Replace random workouts with structured progression and detailed feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat) => (
              <FeatureCard 
                key={feat.title}
                icon={feat.icon}
                title={feat.title}
                description={feat.description}
              />
            ))}
          </div>
        </section>

        {/* 4. Muscle Explorer Preview Pill Bar */}
        <section id="exercises" className="py-12 border-t border-slate-800/60 bg-[#0d1322]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Explore Target Muscles</h3>
                <p className="text-xs text-slate-400">Find targeted exercises instantly</p>
              </div>
              <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                View All Categories →
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {MUSCLE_GROUPS.map((muscle) => (
                <button 
                  key={muscle}
                  className="rounded-lg border border-slate-800 bg-[#111827] px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400"
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 5. Minimal Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© FitForge. Built for discipline and performance.</p>
      </footer>

    </div>
  );
};