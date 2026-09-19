import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './routes/ProtectedRoutes';

import { HomePage } from './pages/Home';
import { LoginPage } from './pages/AuthPage/LoginPage';
import { OnboardingPage } from './pages/AuthPage/Onboarding';
import { DashboardPage } from './pages/Dashboard/Dashboard';
import { RegisterPage } from './pages/AuthPage/RegisterPage';
import { AppLayout } from './layouts/AppLayouts';
import { ExercisesPage } from './pages/Exercises/Exercise';
import { ExerciseDetailsPage } from './pages/ExerciseDetails/ExerciseDetails';
import { RoutineBuilderPage } from './pages/RoutineBuilder/RoutineBuilder';
import { WorkoutsPage } from './pages/Workouts/Workout';
import { NutritionPage } from './pages/Nutrition/Nutrition';
import { WorkoutTrackerPage } from './pages/Progress/WorkoutTracker';
import { ProgressPage } from './pages/Progress/Progress';
import { ProfilePage } from './pages/Profile/Profile';
import { AdminFullPage } from './pages/Admin/AdminFullPage';
// import VideoComponent from './components/video/VideoComponent';
import ExerciseVideoPlayer from './components/video/VideoComponent';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          {/* <Route path="/video" element={<VideoComponent url={'https://www.instagram.com/reel/DaBDYC2p3GD'} />} /> */}
          <Route path="/video" element={<ExerciseVideoPlayer title={'My Upper Chest'} url={'https://www.instagram.com/reel/DaBDYC2p3GD'} />} />

          {/* Public Only (Unauthenticated) Routes */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Routes (Require Authentication) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/workout-session" element={<WorkoutTrackerPage />} />
            {/* Authenticated App Shell */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/exercises" element={<ExercisesPage />} />
              <Route path="/exercises/:slug" element={<ExerciseDetailsPage />} />
              <Route path="/workouts" element={<WorkoutsPage />} />
              <Route path="/routine-builder" element={<RoutineBuilderPage />} />
              <Route path="/nutrition" element={<NutritionPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<ProfilePage />} />
              {/* <Route path="/admin" element={<AdminPage />} /> */}
              <Route path="/admin" element={<AdminFullPage />} />
              {/* Agle modules yahan add honge: /exercises, /routine-builder, /nutrition */}
            </Route>
            {/* Future Protected Routes: /exercises, /routines, /nutrition, /tracker */}
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;