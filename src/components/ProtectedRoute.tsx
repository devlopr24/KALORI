import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, profile, loading, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow passing state like "from" back after login
  if (!user) {
    return <Navigate to="/auth/welcome" replace state={{ from: location }} />;
  }

  // Enforce onboarding
  if (profile && profile.onboarding_completed === false) {
    if (!location.pathname.startsWith('/onboarding')) {
      return <Navigate to="/onboarding/welcome" replace />;
    }
  }

  // If profile is null but user exists,
  // do NOT block. Allow rendering.
  return <>{children}</>;
};
