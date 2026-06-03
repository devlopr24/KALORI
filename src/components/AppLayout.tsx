import { Outlet, useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';
import { ScanOptions } from '../pages/ScanOptions';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const background = location.state && (location.state as any).background;
  
  // Hide bottom nav on specific routes
  const hideBottomNavRoutes = ['/onboarding', '/scan', '/paywall', '/meal'];
  const shouldHideBottomNav = hideBottomNavRoutes.some(route => 
    location.pathname.startsWith(route)
  ) && location.pathname !== '/scan/options';

  return (
    <div className="flex h-screen w-full items-center justify-center bg-brand-tertiary">
      <div className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-brand-primary shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] sm:h-[852px] sm:w-[430px] sm:rounded-[48px] sm:border-[8px] sm:border-text-primary",
      )}>
        {/* Safe Area Top for mobile/notch simulation */}
        <div className="safe-area-top flex h-[44px] w-full items-end justify-center pb-2 sm:h-[44px]">
          <div className="h-[30px] w-[120px] rounded-[20px] bg-text-primary sm:block hidden"></div>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden relative">
          <Outlet />
        </div>

        {!shouldHideBottomNav && (
          <BottomNav onNavigate={(path) => navigate(path)} currentPath={location.pathname} />
        )}
      </div>
    </div>
  );
}
