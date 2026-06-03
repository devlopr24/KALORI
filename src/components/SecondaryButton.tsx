import { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface SecondaryButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  fullWidth?: boolean;
}

export function SecondaryButton({ children, fullWidth, className, ...props }: SecondaryButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center justify-center rounded-full border border-border-light bg-brand-primary px-[32px] py-[16px] text-[17px] font-semibold text-text-primary transition-colors hover:bg-brand-secondary active:bg-brand-tertiary",
        fullWidth ? "w-full" : "w-auto",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
