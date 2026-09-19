import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';

// Base items for standard users
const BASE_NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Exercises', path: '/exercises', icon: Dumbbell },
  { name: 'Workouts', path: '/workouts', icon: Dumbbell },
  { name: 'Diet & Nutrition', path: '/nutrition', icon: UtensilsCrossed },
  { name: 'Progress & Stats', path: '/progress', icon: TrendingUp },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  console.log("search query: ", searchQuery)
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sirf ADMIN role ke liye special link inject hoga
  const navItems = [
    ...(user?.role === 'ADMIN'
      ? [{ name: 'Admin Console', path: '/admin', icon: ShieldCheck }]
      : []),
    ...BASE_NAV_ITEMS
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#0B0F19] text-slate-100 antialiased overflow-hidden font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 1. Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800/80 bg-[#111827] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <Sidebar />
      </aside>

      {/* 2. Main Viewport Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0B0F19]/90 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                name="global-search"       // <-- Yeh add karein
                autoComplete="off"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search portal..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />

              {searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-11 z-50 rounded-xl border border-slate-800 bg-[#111827] p-2 shadow-xl">
                  {filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setSearchQuery('')}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <Icon className="h-4 w-4 text-emerald-400" />
                        {item.name}
                      </NavLink>
                    );
                  })}

                  {filteredNavItems.length === 0 && (
                    <p className="px-3 py-2 text-xs text-slate-500">No matching page found</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Gym Action */}
            <button
              onClick={() => navigate('/workout-session')}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Live Floor
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-center text-slate-400 hover:text-white transition"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Routed Pages Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
};