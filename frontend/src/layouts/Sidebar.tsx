import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Dumbbell,
    CalendarDays,
    Utensils,
    TrendingUp,
    Settings,
    ShieldAlert,
    LogOut,
    Flame,
    User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/exercises', label: 'Exercises', icon: Dumbbell },
        { to: '/workouts', label: 'Workouts', icon: CalendarDays },
        { to: '/nutrition', label: 'Diet & Nutrition', icon: Utensils },
        { to: '/progress', label: 'Progress & Stats', icon: TrendingUp },
        { to: '/settings', label: 'Settings', icon: Settings },
    ];

    // Admin exclusive navigation link
    const isAdmin = user?.role === 'ADMIN';

    const userInitial = user?.fullName
        ? user?.fullName.charAt(0).toUpperCase()
        : user?.email?.charAt(0).toUpperCase() || 'A';

    return (
        <aside className="w-64 h-screen bg-[#0B0F19] border-r border-slate-800/80 flex flex-col justify-between p-4 fixed left-0 top-0 z-30 font-sans select-none">
            <div className="space-y-6">
                {/* Brand Logo */}
                <div
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer group"
                >
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                        <Flame className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-white tracking-wider flex items-center gap-1">
                            FIT<span className="text-emerald-400">FORGE</span>
                        </h1>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">
                            Performance Core
                        </span>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-1">
                    {navLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => {
                                    // Yahan hum check kar rahe hain ki agar user /workouts par hai 
                                    // AUR sath hi agar user routine builder (/routine-builder ya /workouts/builder) par hai, 
                                    // toh bhi Workouts link active/highlighted rahe.
                                    const isWorkoutsActive =
                                        item.to === '/workouts' &&
                                        (isActive || location.pathname.startsWith('/routine-builder') || location.pathname.startsWith('/workouts/'));

                                    const finalActive = isActive || isWorkoutsActive;

                                    return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${finalActive
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm font-bold'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                                        }`;
                                }}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}

                    {/* Admin Exclusive Tab */}
                    {isAdmin && (
                        <div className="pt-3 mt-3 border-t border-slate-800/80">
                            <span className="px-3.5 text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">
                                Staff Operations
                            </span>
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive
                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm font-bold'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                                    }`
                                }
                            >
                                <ShieldAlert className="h-4 w-4 shrink-0 text-purple-400" />
                                <span>Admin Console</span>
                            </NavLink>
                        </div>
                    )}
                </nav>
            </div>

            {/* Bottom Profile & Sign Out Block */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div
                    onClick={() => navigate('/settings')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60 cursor-pointer hover:border-slate-700 transition"
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {userInitial}
                        </div>
                        <div className="truncate">
                            <p className="text-xs font-bold text-white truncate leading-tight">
                                {user?.fullName || 'Athlete'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-none">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    {isAdmin && (
                        <span className="text-[9px] font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded shrink-0">
                            ADM
                        </span>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};