import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Users,
    Dumbbell,
    Flame,
    TrendingUp,
    Plus,
    Trash2,
    Upload,
    X,
    ShieldAlert,
    Utensils,
    Loader2,
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';
import { uploadApi } from '../../api/uploadApi';
import { exerciseApi } from '../../api/exerciseApi';
import { foodApi } from '../../api/foodApi';
import { authApi } from '../../api/authApi';
import { muscleApi } from '../../api/muscleApi';
import { equipmentApi } from '../../api/equipmentApi';

const USER_REGISTRATION_TRENDS = [
    { month: 'Jan', users: 140 },
    { month: 'Feb', users: 280 },
    { month: 'Mar', users: 510 },
    { month: 'Apr', users: 840 },
    { month: 'May', users: 1290 },
    { month: 'Jun', users: 1850 },
];


const MUSCLE_PILLS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Abs', 'Calves'];

type FoodFormData = {
    foodName: string;
    foodServing: string;
    foodUnit: string;
    foodCalories: string;
    foodProtein: string;
    foodCarbs: string;
    foodFat: string;
    foodFiber: string;
    foodPreviewUrl: string | null;
};

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

export const AdminFullPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'exercises' | 'foods'>('analytics');

    // React Query Database Sync
    const { data: exercisesList = [], isLoading: loadingExercises } = useQuery({
        queryKey: ['admin-exercises'],
        queryFn: exerciseApi.getAll,
    });
    const { data: muscles = [] } = useQuery({
        queryKey: ['muscles'],
        queryFn: muscleApi.getAll,
    });
    // Component ke andar query add karo:
    const { data: equipments = [] } = useQuery({
        queryKey: ['equipments'],
        queryFn: equipmentApi.getAll,
    });

    const { data: foodsList = [], isLoading: loadingFoods } = useQuery({
        queryKey: ['admin-foods'],
        queryFn: foodApi.getAll,
    });

    const [usersList, setUsersList] = useState([]);

    // File Upload State
    const [exFile, setExFile] = useState<File | null>(null);
    const [foodFile, setFoodFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Dynamic Instructions & Mistakes Inputs
    const [currentInstruction, setCurrentInstruction] = useState('');
    const [currentMistake, setCurrentMistake] = useState('');

    // Modals
    const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
    const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);

    // Form State
    const [exerciseFormData, setExerciseFormData] = useState({
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


    const [foodFormData, setFoodFormData] = useState<FoodFormData>({
        foodName: '',
        foodServing: '100',
        foodUnit: 'g',
        foodCalories: '',
        foodProtein: '',
        foodCarbs: '',
        foodFat: '',
        foodFiber: '0',
        foodPreviewUrl: null,
    });

    const handleExerciseDataChange = <K extends keyof ExerciseFormData>(name: K, value: ExerciseFormData[K]) => {
        setExerciseFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFoodDataChange = <K extends keyof FoodFormData>(name: K, value: FoodFormData[K]) => {
        setFoodFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleExerciseImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setExFile(file);
            handleExerciseDataChange('exPreviewUrl', URL.createObjectURL(file));
        }
    };

    const handleFoodImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFoodFile(file);
            handleFoodDataChange('foodPreviewUrl', URL.createObjectURL(file));
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
                    ? prev.exSecondaryMuscles.filter(
                        (id) => id !== muscleId
                    )
                    : [...prev.exSecondaryMuscles, muscleId],
            };
        });
    };


    // Mutations
    const deleteExerciseMutation = useMutation({
        mutationFn: exerciseApi.deleteAdmin,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-exercises'] }),
    });

    const deleteFoodMutation = useMutation({
        mutationFn: foodApi.deleteAdmin,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-foods'] }),
    });

    // Admin Exercise Create & Upload Handler (Matches: POST /assets/admin)
    const handleCreateExercise = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // 1. Create exercise record first in DB
            const createdEx = await exerciseApi.createAdmin({
                name: exerciseFormData.exName,
                description: exerciseFormData.exDescription,
                difficulty: exerciseFormData.exDifficulty,
                primaryMuscleId: exerciseFormData.exMuscle,
                secondaryMuscleIds: exerciseFormData.exSecondaryMuscles,
                defaultSets: Number(exerciseFormData.set),
                repsMin: Number(exerciseFormData.repsMin),
                repsMax: Number(exerciseFormData.repsMax),
                restSeconds: Number(exerciseFormData.restTime),
                targetWeightKg: Number(exerciseFormData.targetWeightKg),
                instructions: exerciseFormData.instructions,
                commonMistakes: exerciseFormData.commonMistakes,
            });

            // 2. If file attached, call your custom uploadApi.adminUpload
            if (exFile && createdEx?.id) {
                await uploadApi.adminUpload(exFile, 'exercise', createdEx.id);
            }

            queryClient.invalidateQueries({ queryKey: ['admin-exercises'] });
            setIsExerciseModalOpen(false);
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

    // Admin Food Create & Upload Handler (Matches: POST /assets/admin)
    const handleCreateFood = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // 1. Create food record first in DB
            const createdFood = await foodApi.createAdmin({
                name: foodFormData.foodName,
                servingAmount: parseFloat(foodFormData.foodServing),
                servingUnit: foodFormData.foodUnit,
                calories: parseFloat(foodFormData.foodCalories),
                protein: parseFloat(foodFormData.foodProtein),
                carbs: parseFloat(foodFormData.foodCarbs),
                fat: parseFloat(foodFormData.foodFat),
                fiber: parseFloat(foodFormData.foodFiber),
            });

            // 2. Upload photo to your backend endpoint using resourceId
            if (foodFile && createdFood?.id) {
                await uploadApi.adminUpload(foodFile, 'food', createdFood.id);
            }

            queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
            setIsFoodModalOpen(false);
            setFoodFile(null);
            setFoodFormData({
                foodName: '',
                foodServing: '100',
                foodUnit: 'g',
                foodCalories: '',
                foodProtein: '',
                foodCarbs: '',
                foodFat: '',
                foodFiber: '0',
                foodPreviewUrl: null,
            });
        } catch (err) {
            console.error('Failed to create and upload food item:', err);
        } finally {
            setIsProcessing(false);
        }
    };
    useEffect(() => {
        const getData = async () => {
            try {
                const res = await authApi.getAllUser();
                if (!res) {
                    setUsersList([]);
                    return
                }
                const onlyUsers = res.users.filter(
                    (user: any) => user.role === "USER"
                );
                setUsersList(onlyUsers)
            } catch (error: any) {
                throw new error;
            }
        }
        getData();
    }, [])

    return (
        <div className="space-y-6 max-w-7xl mx-auto font-sans">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        FitForge Administrator Console
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Platform Operations & Metrics</h1>
                </div>

                {/* Tab Selection */}
                <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Analytics & Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${activeTab === 'users' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Users ({usersList.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('exercises')}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${activeTab === 'exercises' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Exercise Catalog ({exercisesList.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('foods')}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${activeTab === 'foods' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Food Catalog ({foodsList.length})
                    </button>
                </div>
            </div>

            {/* Snapshot Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
                    <div className="flex justify-between text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Athletes</span>
                        <Users className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-black text-white mt-2">{usersList.length}</p>
                    <p className="text-[10px] text-emerald-400 mt-1 font-semibold">↑ +24% this month</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
                    <div className="flex justify-between text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Sessions Logged</span>
                        <Dumbbell className="h-4 w-4 text-cyan-400" />
                    </div>
                    <p className="text-2xl font-black text-white mt-2">18,420</p>
                    <p className="text-[10px] text-slate-400 mt-1">Across 85 countries</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
                    <div className="flex justify-between text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Catalog Items</span>
                        <Flame className="h-4 w-4 text-amber-400" />
                    </div>
                    <p className="text-2xl font-black text-white mt-2">{exercisesList.length + foodsList.length}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{exercisesList.length} Ex • {foodsList.length} Foods</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
                    <div className="flex justify-between text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Active Monthly Ratio</span>
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-black text-white mt-2">78.4%</p>
                    <p className="text-[10px] text-emerald-400 mt-1 font-semibold">High retention</p>
                </div>
            </div>

            {/* Tab 1: Growth Analytics View */}
            {activeTab === 'analytics' && (
                <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
                    <div>
                        <h2 className="text-base font-bold text-white">Registered Athletes Growth</h2>
                        <p className="text-xs text-slate-400">Monthly new user onboarding trajectory</p>
                    </div>
                    <div className="h-72 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={USER_REGISTRATION_TRENDS}>
                                <defs>
                                    <linearGradient id="userGrowth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
                                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderColor: '#334155',
                                        borderRadius: '0.75rem',
                                        fontSize: '12px',
                                        color: '#fff',
                                    }}
                                />
                                <Area type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} fill="url(#userGrowth)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Tab 2: User Management Directory */}
            {activeTab === 'users' && (
                <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <h2 className="text-base font-bold text-white">Athlete Accounts</h2>
                        <span className="text-xs text-slate-500">Live platform members</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                                    <th className="pb-3">NAME</th>
                                    <th className="pb-3">EMAIL</th>
                                    <th className="pb-3">PRIMARY GOAL</th>
                                    <th className="pb-3">JOINED DATE</th>
                                    <th className="pb-3 text-right">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {usersList.map((u) => (
                                    <tr key={Math.random()} className="hover:bg-slate-900/40">
                                        <td className="py-3 font-semibold text-white">{u?.name}</td>
                                        <td className="py-3 text-slate-400">{u.email}</td>
                                        <td className="py-3 text-emerald-400 font-medium">{u.primaryGoal}</td>
                                        <td className="py-3 text-slate-400">{u.joinedDate}</td>
                                        <td className="py-3 text-right">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                                                {u.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Exercise Catalog Management */}
            {activeTab === 'exercises' && (
                <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                        <div>
                            <h2 className="text-base font-bold text-white">Exercise Database Catalog</h2>
                            <p className="text-xs text-slate-400">Add verified movement patterns with reference photos</p>
                        </div>
                        <button
                            onClick={() => setIsExerciseModalOpen(true)}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
                        >
                            <Plus className="h-4 w-4" />
                            Add Exercise
                        </button>
                    </div>

                    {loadingExercises ? (
                        <div className="py-12 flex justify-center text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400">
                                        <th className="pb-3">MEDIA</th>
                                        <th className="pb-3">NAME</th>
                                        <th className="pb-3">DIFFICULTY</th>
                                        <th className="pb-3">REPS RANGE</th>
                                        <th className="pb-3">REST</th>
                                        <th className="pb-3 text-right">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    {exercisesList.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-900/40">
                                            <td className="py-2.5">
                                                <img src={item.imageUrl || ''} alt="" className="h-10 w-12 rounded-lg object-cover bg-slate-900" />
                                            </td>
                                            <td className="py-2.5 font-semibold text-white">{item.name}</td>
                                            <td className="py-2.5 text-slate-300">{item.difficulty}</td>
                                            <td className="py-2.5 text-emerald-400 font-mono">
                                                {item.defaultSets} × {item.repsMin}-{item.repsMax} reps
                                            </td>
                                            <td className="py-2.5 text-slate-400">{item.restSeconds}s</td>
                                            <td className="py-2.5 text-right">
                                                <button
                                                    onClick={() => deleteExerciseMutation.mutate(item.id)}
                                                    disabled={deleteExerciseMutation.isPending}
                                                    className="p-1.5 text-slate-500 hover:text-red-400 transition disabled:opacity-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Tab 4: Food Catalog Management */}
            {activeTab === 'foods' && (
                <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                        <div>
                            <h2 className="text-base font-bold text-white">Food Nutritional Database</h2>
                            <p className="text-xs text-slate-400">Add catalog food items, reference images & macro breakdowns</p>
                        </div>
                        <button
                            onClick={() => setIsFoodModalOpen(true)}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
                        >
                            <Plus className="h-4 w-4" />
                            Add Food
                        </button>
                    </div>

                    {loadingFoods ? (
                        <div className="py-12 flex justify-center text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400">
                                        <th className="pb-3">MEDIA</th>
                                        <th className="pb-3">FOOD ITEM</th>
                                        <th className="pb-3">SERVING</th>
                                        <th className="pb-3">CALORIES</th>
                                        <th className="pb-3">PROTEIN</th>
                                        <th className="pb-3">CARBS</th>
                                        <th className="pb-3">FAT</th>
                                        <th className="pb-3 text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    {foodsList.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-900/40">
                                            <td className="py-2.5">
                                                <img src={item.imageUrl || ''} alt="" className="h-10 w-12 rounded-lg object-cover bg-slate-900" />
                                            </td>
                                            <td className="py-3 font-semibold text-white">{item.name}</td>
                                            <td className="py-3 text-slate-400">{item.servingAmount} {item.servingUnit}</td>
                                            <td className="py-3 text-emerald-400 font-bold">{item.calories} kcal</td>
                                            <td className="py-3 text-slate-300">{item.protein}g</td>
                                            <td className="py-3 text-slate-300">{item.carbs}g</td>
                                            <td className="py-3 text-slate-300">{item.fat}g</td>
                                            <td className="py-3 text-right">
                                                <button
                                                    onClick={() => deleteFoodMutation.mutate(item.id)}
                                                    disabled={deleteFoodMutation.isPending}
                                                    className="p-1.5 text-slate-500 hover:text-red-400 transition disabled:opacity-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Full-Featured Exercise Creation */}
            {isExerciseModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Dumbbell className="h-4 w-4 text-emerald-400" />
                                Create Catalog Exercise
                            </h3>
                            <button onClick={() => setIsExerciseModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateExercise}
                            className="space-y-4 overflow-y-auto pr-1 flex-1 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent">
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
                                    <label className="block text-xs text-slate-400 mb-1">
                                        Primary Muscle *
                                    </label>

                                    <select
                                        value={exerciseFormData.exMuscle}
                                        onChange={(e) =>
                                            handleExerciseDataChange('exMuscle', e.target.value)
                                        }
                                        required
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                                    >
                                        <option value="">Select muscle</option>

                                        {muscles.map((muscle: any) => (
                                            <option key={muscle.id} value={muscle.id}>
                                                {muscle.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* EQUIPMENT */}
                                {/* EQUIPMENT DROPDOWN */}
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">
                                        Equipment *
                                    </label>
                                    <select
                                        value={exerciseFormData.exEquipment}
                                        onChange={(e) => handleExerciseDataChange('exEquipment', e.target.value)}
                                        required
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                                    >
                                        <option value="">Select Equipment</option>
                                        {equipments.map((eq: any) => (
                                            <option key={eq.id} value={eq.id}>
                                                {eq.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* DIFFICULTY */}
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">
                                        Difficulty
                                    </label>

                                    <select
                                        value={exerciseFormData.exDifficulty}
                                        onChange={(e) =>
                                            handleExerciseDataChange(
                                                'exDifficulty',
                                                e.target.value as any
                                            )
                                        }
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
                                <label className="block text-xs text-slate-400 mb-1.5">
                                    Secondary Muscles Involved
                                </label>

                                <div className="flex flex-wrap gap-1.5">
                                    {muscles
                                        .filter(
                                            (muscle: any) =>
                                                muscle.id !== exerciseFormData.exMuscle
                                        )
                                        .map((muscle: any) => {
                                            const isSelected =
                                                exerciseFormData.exSecondaryMuscles.includes(
                                                    muscle.id
                                                );

                                            return (
                                                <button
                                                    type="button"
                                                    key={muscle.id}
                                                    onClick={() =>
                                                        toggleSecondaryMuscle(muscle.id)
                                                    }
                                                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${isSelected
                                                        ? 'bg-emerald-500 text-slate-950 font-bold'
                                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                                        }`}
                                                >
                                                    {muscle.name}

                                                    {isSelected && ' ✓'}
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
                                    <label className="block text-[11px] text-slate-400 mb-1">Target Weight (Kg)</label>
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
                                    onClick={() => setIsExerciseModalOpen(false)}
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
            )}

            {/* Modal: Food Creation */}
            {isFoodModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Utensils className="h-4 w-4 text-emerald-400" />
                                Add Food to Catalog
                            </h3>
                            <button onClick={() => setIsFoodModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateFood} className="space-y-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Food Item Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={foodFormData.foodName}
                                    onChange={(e) => handleFoodDataChange('foodName', e.target.value)}
                                    placeholder="e.g. Greek Yogurt 0% Fat"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Serving Amount</label>
                                    <input
                                        type="number"
                                        required
                                        value={foodFormData.foodServing}
                                        onChange={(e) => handleFoodDataChange('foodServing', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Serving Unit</label>
                                    <select
                                        value={foodFormData.foodUnit}
                                        onChange={(e) => handleFoodDataChange('foodUnit', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                                    >
                                        <option value="g">Grams (g)</option>
                                        <option value="ml">Milliliters (ml)</option>
                                        <option value="scoop">Scoop</option>
                                        <option value="piece">Piece</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Calories (kcal) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={foodFormData.foodCalories}
                                        onChange={(e) => handleFoodDataChange('foodCalories', e.target.value)}
                                        placeholder="120"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Protein (g) *</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={foodFormData.foodProtein}
                                        onChange={(e) => handleFoodDataChange('foodProtein', e.target.value)}
                                        placeholder="15"
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
                                        required
                                        value={foodFormData.foodCarbs}
                                        onChange={(e) => handleFoodDataChange('foodCarbs', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">Fat (g)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={foodFormData.foodFat}
                                        onChange={(e) => handleFoodDataChange('foodFat', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">Fiber (g)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={foodFormData.foodFiber}
                                        onChange={(e) => handleFoodDataChange('foodFiber', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Food Reference Image</label>
                                {foodFormData.foodPreviewUrl ? (
                                    <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-700">
                                        <img src={foodFormData.foodPreviewUrl} alt="" className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFoodFile(null);
                                                handleFoodDataChange('foodPreviewUrl', null);
                                            }}
                                            className="absolute top-2 right-2 bg-black/60 p-1 rounded-lg text-white hover:bg-red-500/80"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-28 w-full rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 hover:border-emerald-500/50 cursor-pointer">
                                        <Upload className="h-5 w-5 text-slate-500 mb-1" />
                                        <span className="text-xs text-slate-300">Upload Food Dish Image</span>
                                        <input type="file" accept="image/*" onChange={handleFoodImageSelect} className="hidden" />
                                    </label>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsFoodModalOpen(false)}
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
                                    {isProcessing ? 'Processing...' : 'Publish Food'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};