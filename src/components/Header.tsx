import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { cn } from '../lib/utils';
import { ReactNode } from 'react';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
  rightAction?: ReactNode;
  className?: string;
}

export function Header({ showBack, title, rightAction, className }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={cn("flex h-[60px] shrink-0 items-center justify-between border-b border-border-light bg-brand-primary px-[24px]", className)}>
      <div className="flex w-[60px] items-center justify-start">
        {showBack ? (
          <button 
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-brand-tertiary"
          >
            <ArrowLeft className="text-text-primary" size={24} />
          </button>
        ) : (
          <Logo />
        )}
      </div>

      {title && (
        <div className="flex flex-1 items-center justify-center">
          <h2 className="text-[17px] font-bold text-text-primary truncate">{title}</h2>
        </div>
      )}

      <div className="flex w-[60px] items-center justify-end">
        {rightAction || (
          // Placeholder for visual balance if rightAction is empty but showBack/Logo exists
          <div className="w-10 h-10" />
        )}
      </div>
    </header>
  );
}
