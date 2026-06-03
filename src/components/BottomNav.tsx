import { BarChart2, Home, Plus, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface BottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function BottomNav({ currentPath, onNavigate }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Progress', path: '/progress', icon: BarChart2 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <button
        onClick={() => navigate('/scan/options', { state: { background: location } })}
        className="absolute bottom-[95px] right-[24px] z-50 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-button-black text-brand-primary shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-transform hover:scale-105 active:scale-95"
      >
        <Plus size={24} strokeWidth={3} />
      </button>

      <nav className="z-40 flex h-[80px] items-center justify-around border-t border-border-light bg-brand-primary pb-[20px] pt-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
          return (
            <div
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 cursor-pointer transition-opacity duration-300",
                isActive ? "opacity-100" : "opacity-40"
              )}
            >
              <item.icon
                size={24}
                className={cn(
                  "transition-colors duration-300",
                  isActive ? "text-text-primary" : "text-text-secondary"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[11px] font-bold transition-colors duration-300",
                  isActive ? "text-text-primary" : "text-text-secondary"
                )}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>
    </>
  );
}
