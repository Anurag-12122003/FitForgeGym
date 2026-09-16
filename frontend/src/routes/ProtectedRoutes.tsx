import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const {
    isAuthenticated,
    isLoading,
    user,
  } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        Loading...
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