import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';

export function Welcome() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  useEffect(() => {
    // If they already completed it, they shouldn't be here, but just in case
    if (profile?.onboarding_completed) {
      navigate('/', { replace: true });
      return;
    }
    // Resume to the correct step
    if (profile?.onboarding_step) {
      const step = profile.onboarding_step;
      if (step === 2) navigate('/onboarding/age', { replace: true });
      if (step === 3) navigate('/onboarding/height', { replace: true });
      if (step === 4) navigate('/onboarding/weight', { replace: true });
      if (step === 5) navigate('/onboarding/goal-weight', { replace: true });
      if (step === 6) navigate('/onboarding/activity', { replace: true });
      if (step >= 7) navigate('/onboarding/calculating', { replace: true });
    }
  }, [profile, navigate]);

  return (
    <div className="flex h-full flex-col bg-brand-primary px-[24px] pb-[16px] pt-[60px]">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="mb-2 text-[48px]">🍽️</div>
          <h1 className="mb-2 text-[40px] font-extrabold leading-none text-text-primary">
            KALORI
          </h1>
          <p className="text-[16px] text-text-secondary">AI-Powered Calorie Tracker</p>
          <p className="mt-1 text-[14px] text-text-secondary">Built for Indian Food 🇮🇳</p>
        </motion.div>
      </div>

      <div className="safe-area-bottom mb-[24px] w-full">
        <PrimaryButton fullWidth onClick={() => navigate('/onboarding/gender')}>
          Get Started
        </PrimaryButton>
      </div>
    </div>
  );
}
