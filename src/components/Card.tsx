import { cn } from '../lib/utils';
import { ComponentProps, ReactNode } from 'react';

interface CardProps extends ComponentProps<"div"> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-border-light bg-brand-primary p-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
