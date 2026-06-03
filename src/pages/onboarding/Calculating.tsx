import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/lib/profileService';
import toast from 'react-hot-toast';

export function Calculating() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [phase, setPhase] = useState<'calculating' | 'results'>('calculating');
  const [calcText, setCalcText] = useState('Analyzing your data...');
  const [goals, setGoals] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const texts = [
      "Analyzing your data...",
      "Calculating BMR...",
      "Setting your daily calorie goal...",
      "Creating your personalized plan..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < texts.length) {
        setCalcText(texts[i]);
      }
    }, 800);

    const calculateGoals = async () => {
      if (!user) return;
      
      const startTime = Date.now();
      const profile = await profileService.getProfile(user.id);
      
      if (!profile) {
        setError("Failed to load profile data.");
        clearInterval(interval);
        return;
      }

      const result = await profileService.calculateAndSaveGoals(
        user.id,
        {
          gender: profile.gender as any,
          age: profile.age,
          height_cm: profile.height_cm,
          current_weight_kg: profile.current_weight_kg,
          goal_weight_kg: profile.goal_weight_kg,
          activity_level: profile.activity_level
        }
      );
      
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 3200 - elapsed);
      
      setTimeout(() => {
        clearInterval(interval);
        if (result.success) {
          setGoals(result.goals);
          setPhase('results');
        } else {
          setError(result.error || "Failed to calculate goals.");
          toast.error(result.error || 'Failed to calculate goals');
        }
      }, remainingTime);
    };

    calculateGoals();

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const handleStartJourney = async () => {
    await refreshProfile();
    navigate('/', { replace: true });
  };

  // We need current_weight and goal_weight to show weeks
  const [weeks, setWeeks] = useState(0);

  useEffect(() => {
    if (phase === 'results' && user) {
       profileService.getProfile(user.id).then(p => {
         if (p && p.current_weight_kg && p.goal_weight_kg) {
           const diff = Math.abs(p.current_weight_kg - p.goal_weight_kg);
           if (diff === 0) {
             setWeeks(0);
           } else {
             setWeeks(Math.round(diff * 7700 / 500 / 7));
           }
         }
       });
    }
  }, [phase, user]);

  return (
    <div className="flex h-full flex-col bg-brand-primary">
      {phase === 'calculating' ? (
        <div className="relative flex flex-1 flex-col items-center justify-center p-[24px]">
          <div className="absolute left-0 top-0 flex h-[60px] w-full shrink-0 items-center justify-center">
             <div className="mx-auto h-[4px] w-full max-w-[200px] overflow-hidden rounded-full bg-border-light">
                <div className="h-full w-full bg-button-black"></div>
             </div>
          </div>
          
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="mb-8 flex h-[100px] w-[100px] items-center justify-center rounded-full bg-brand-tertiary text-[40px] shadow-[0_0_40px_rgba(0,0,0,0.05)]"
          >
            🧠
          </motion.div>
          <h2 className="text-center text-[24px] font-bold text-text-primary">Calculating your perfect plan...</h2>
          <div className="mt-2 h-[24px] overflow-hidden text-[15px] font-medium text-text-secondary">
            <AnimatePresence mode="wait">
              <motion.span
                key={calcText}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="block text-center"
              >
                {calcText}
              </motion.span>
            </AnimatePresence>
          </div>
          {error && (
            <div className="mt-4 text-center text-red-500 font-medium">{error}</div>
          )}
        </div>
      ) : (
        <OnboardingLayout
          hideTop
          title="Your Personalized Plan is Ready! 🎉"
          subtitle="Based on your goals, here's your daily nutrition target"
          onContinue={handleStartJourney}
          continueText="Start My Journey 🚀"
        >
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="relative flex w-full flex-col items-center overflow-hidden rounded-[28px] bg-[#1A1A1A] p-[32px] text-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
           >
             <span className="absolute right-4 top-4 text-[24px] opacity-20">🔥</span>
             <span className="text-[12px] font-bold uppercase tracking-wider text-text-tertiary">Daily Calorie Goal</span>
             <div className="mt-4 flex items-baseline gap-1">
               <span className="text-[60px] font-extrabold leading-none tracking-tight">{Intl.NumberFormat('en-US').format(Number(goals?.daily_calorie_goal))}</span>
             </div>
             <span className="mt-1 text-[14px] font-medium text-text-tertiary">calories per day</span>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="mt-4 flex w-full gap-[12px]"
           >
              {[
                { label: 'P', val: goals?.protein_goal_g, color: '#FF6B6B' },
                { label: 'C', val: goals?.carbs_goal_g, color: '#FFA500' },
                { label: 'F', val: goals?.fats_goal_g, color: '#4A90E2' },
              ].map((m) => (
                <div key={m.label} className="flex flex-1 flex-col items-center rounded-[20px] border border-border-light bg-brand-primary p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <span className="mb-2 text-[17px] font-bold text-text-primary">{m.label} {m.val}g</span>
                  <div className="h-[6px] w-full rounded-full" style={{ backgroundColor: m.color }} />
                </div>
              ))}
           </motion.div>

           {weeks > 0 && (
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="mt-8 text-center text-[15px] font-semibold text-success-green"
             >
               You'll reach your goal in approximately {weeks} weeks
             </motion.p>
           )}
        </OnboardingLayout>
      )}
    </div>
  );
}
