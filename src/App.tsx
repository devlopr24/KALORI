/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { Home } from './pages/Home';
import { Progress } from './pages/Progress';
import { Settings } from './pages/Settings';
import { ProfileEdit } from './pages/ProfileEdit';
import { History } from './pages/History';
import { Scan } from './pages/Scan';
import { ScanOptions } from './pages/ScanOptions';
import { ScanProcessing } from './pages/ScanProcessing';
import { ScanConfirm } from './pages/ScanConfirm';
import { ScanResult } from './pages/ScanResult';
import { MealDetail } from './pages/MealDetail';
import { Paywall } from './pages/Paywall';
import { PaywallSuccess } from './pages/PaywallSuccess';
import { Welcome } from './pages/onboarding/Welcome';
import { Gender } from './pages/onboarding/Gender';
import { Age } from './pages/onboarding/Age';
import { Height } from './pages/onboarding/Height';
import { Weight } from './pages/onboarding/Weight';
import { GoalWeight } from './pages/onboarding/GoalWeight';
import { Activity } from './pages/onboarding/Activity';
import { Calculating } from './pages/onboarding/Calculating';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { supabase } from './lib/supabase';
import { AuthWelcome } from './pages/auth/AuthWelcome';
import { AuthSignIn } from './pages/auth/AuthSignIn';
import { AuthSignUp } from './pages/auth/AuthSignUp';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const location = useLocation();
  const background = location.state && (location.state as any).background;

  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <Routes location={background || location}>
        {/* Auth Routes */}
        <Route path="/auth/welcome" element={<AuthWelcome />} />
        <Route path="/auth/signin" element={<AuthSignIn />} />
        <Route path="/auth/signup" element={<AuthSignUp />} />

        <Route path="/" element={<AppLayout />}>
          {/* Main tabs */}
        <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="settings/profile" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
        <Route path="history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        
        {/* Onboarding */}
        <Route path="onboarding" element={<Navigate to="/onboarding/welcome" replace />} />
        <Route path="onboarding/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
        <Route path="onboarding/gender" element={<ProtectedRoute><Gender /></ProtectedRoute>} />
        <Route path="onboarding/age" element={<ProtectedRoute><Age /></ProtectedRoute>} />
        <Route path="onboarding/height" element={<ProtectedRoute><Height /></ProtectedRoute>} />
        <Route path="onboarding/weight" element={<ProtectedRoute><Weight /></ProtectedRoute>} />
        <Route path="onboarding/goal-weight" element={<ProtectedRoute><GoalWeight /></ProtectedRoute>} />
        <Route path="onboarding/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
        <Route path="onboarding/calculating" element={<ProtectedRoute><Calculating /></ProtectedRoute>} />
        
        
        {/* Scanning flow */}
        <Route path="scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
        {/* Important: /scan/options is also here as a fallback if background state is missing */}
        <Route path="scan/options" element={<ProtectedRoute><ScanOptions /></ProtectedRoute>} />
        <Route path="scan/processing" element={<ProtectedRoute><ScanProcessing /></ProtectedRoute>} />
        <Route path="scan/confirm" element={<ProtectedRoute><ScanConfirm /></ProtectedRoute>} />
        <Route path="scan/result" element={<ProtectedRoute><ScanResult /></ProtectedRoute>} />
        
        {/* Meal Detail */}
        <Route path="meal/:id" element={<ProtectedRoute><MealDetail /></ProtectedRoute>} />
        
        {/* Paywall */}
        <Route path="paywall" element={<ProtectedRoute><Paywall /></ProtectedRoute>} />
        <Route path="paywall/success" element={<ProtectedRoute><PaywallSuccess /></ProtectedRoute>} />
      </Route>
    </Routes>

    {background && (
      <Routes>
        <Route path="scan/options" element={<ProtectedRoute><ScanOptions /></ProtectedRoute>} />
      </Routes>
    )}
    </AuthProvider>
  );
}
