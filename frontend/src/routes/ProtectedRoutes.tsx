import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const {
    isAuthenticated,
    isLoading,
    user,
  } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  // Login nahi hai
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Profile already complete hai
  // onboarding dobara access nahi kar sakta
  if (user?.profile && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  // Profile complete nahi hai
  // onboarding ke alawa kahin nahi ja sakta
  if (!user?.profile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  // if(user?.role === "ADMIN"){
  //   return <Navigate to="/admin" replace/>
  // }

  return <Outlet />;
};


// Logged-in users ko Login/Register se dashboard bhejne ke liye
export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.profile !== null ? "/dashboard" : "/onboarding"} replace />;
  }

  return <Outlet />;
};