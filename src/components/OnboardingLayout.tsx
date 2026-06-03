import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PrimaryButton } from './PrimaryButton';
import { ReactNode } from 'react';

interface OnboardingLayoutProps {
  progress?: number;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  onContinue?: () => void;
  continueText?: string;
  isContinueDisabled?: boolean;
  isLoading?: boolean;
  showBack?: boolean;
  hideTop?: boolean;
  hideBottom?: boolean;
}

export function OnboardingLayout({
  progress = 1,
  title,
  subtitle,
  children,
  onContinue,
  continueText = "Continue",
  isContinueDisabled = false,
  isLoading = false,
  showBack = true,
  hideTop = false,
  hideBottom = false,
}: OnboardingLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col bg-brand-primary">
      {!hideTop && (
        <div className="flex h-[60px] shrink-0 items-center justify-between px-[16px]">
          <div className="flex w-[40px] items-center justify-start">
            {showBack && (
              <button 
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-brand-tertiary"
              >
                <ArrowLeft className="text-text-primary" size={24} />
              </button>
            )}
          </div>
          
          <div className="flex-1 px-4">
            {progress > 0 && progress <= 7 && (
              <div className="mx-auto h-[4px] w-full max-w-[200px] overflow-hidden rounded-full bg-border-light">
                <motion.div 
                  className="h-full bg-button-black"
                  initial={{ width: `${((progress - 1) / 7) * 100}%` }}
                  animate={{ width: `${(progress / 7) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
          
          <div className="flex w-[40px] items-center justify-end"></div>
        </div>
      )}

      <div className="no-scrollbar flex-1 overflow-y-auto px-[24px] py-[32px]">
        {title && (
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 text-center text-[32px] font-bold leading-tight text-text-primary"
          >
            {title}
          </motion.h1>
        )}
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 text-center text-[15px] text-text-secondary"
          >
            {subtitle}
          </motion.p>
        )}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="flex w-full flex-col items-center pb-8"
        >
          {children}
        </motion.div>
      </div>

      {!hideBottom && (
        <div className="safe-area-bottom shrink-0 mb-[16px] p-[20px]">
          <PrimaryButton 
            fullWidth 
            onClick={onContinue}
            disabled={isContinueDisabled || isLoading}
            isLoading={isLoading}
            className={isContinueDisabled ? "pointer-events-none opacity-40 shadow-none" : ""}
          >
            {continueText}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
