import { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface PrimaryButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function PrimaryButton({ children, fullWidth, isLoading, disabled, className, ...props }: PrimaryButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={cn(
        "flex items-center justify-center rounded-full bg-button-black px-[32px] py-[16px] text-[17px] font-semibold text-brand-primary shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-colors hover:bg-neutral-800 active:bg-neutral-900",
        fullWidth ? "w-full" : "w-auto",
        (disabled || isLoading) ? "pointer-events-none opacity-80" : "",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-white/20 border-t-white" />
      ) : (
        children
      )}
    </motion.button>
  );
}
