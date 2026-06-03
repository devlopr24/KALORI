import { cn } from '../lib/utils';
import { HTMLAttributes } from 'react';

export function Logo({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2 text-[20px] font-extrabold text-text-primary", className)} {...props}>
      <span className="text-[20px] leading-none">🍽️</span> KALORI
    </div>
  );
}
