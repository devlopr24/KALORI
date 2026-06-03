import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { DateSelector } from '@/components/DateSelector';
import { CircularProgress } from '@/components/CircularProgress';
import { MacroCard } from '@/components/MacroCard';
import { MealCard } from '@/components/MealCard';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { mealService } from '@/lib/mealService';
import { useAuth } from '@/contexts/AuthContext';
import { premiumGateService } from '@/lib/premiumGateService';
import toast from 'react-hot-toast';

export function Home() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [meals, setMeals] = useState<any[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMeals = async () => {
      try {
        setLoadingMeals(true);
        const todayMeals = await mealService.getTodayMeals(user.id);
        setMeals(todayMeals || []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load meals');
      } finally {
        setLoadingMeals(false);
      }
    };

    fetchMeals();
  }, [user]);

  if (!profile || loadingMeals) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  const consumedCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const consumedProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const consumedCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const consumedFats = meals.reduce((sum, m) => sum + (m.fats || 0), 0);

  const caloriesRemaining = profile.daily_calorie_goal - consumedCalories;
  const isOverGoal = caloriesRemaining < 0;
  const isPremium = premiumGateService.isPremium(profile);

  const handleMealClick = (id: string) => {
    navigate(`/meal/${id}`);
  };

  const formatNum = (num: number) => Intl.NumberFormat('en-US').format(Math.round(num));

  return (
    <div className="flex min-h-[100dvh] flex-col pb-[120px]">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between bg-white px-[16px]">
        <Logo />
        <div className="flex items-center gap-[8px]">
          {isPremium && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center rounded-full bg-gradient-to-r from-[#FFD700] to-[#FDB931] px-[12px] py-[6px] shadow-[0_2px_8px_rgba(253,185,49,0.3)]"
            >
              <span className="text-[12px] font-extrabold text-[#996515]">PRO</span>
            </motion.div>
          )}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-1 rounded-full border border-gray-100 bg-white px-[14px] py-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <span className="text-[14px]">🔥</span>
            <span className="text-[14px] font-semibold text-gray-900">{formatNum(profile.current_streak || 0)}</span>
          </motion.button>
        </div>
      </header>

      {/* 2. DATE SELECTOR */}
      <DateSelector />

      {/* 3. MAIN CALORIE CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-[16px] mt-[16px] flex items-center justify-between rounded-[28px] bg-white p-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      >
        <div className="flex flex-col">
          <span className="text-[14px] text-gray-500">Calories eaten</span>
          <div className="mt-1 flex items-baseline gap-1 relative -left-1">
            <span className="text-[48px] font-extrabold leading-none tracking-tight text-gray-900">
              {formatNum(consumedCalories)}
            </span>
            <span className="text-[24px] font-medium text-gray-400 leading-none">
              /{formatNum(profile.daily_calorie_goal)}
            </span>
          </div>
          <span className={`mt-2 text-[13px] font-medium ${isOverGoal ? 'text-red-500' : 'text-green-500'}`}>
            {isOverGoal 
              ? `over by ${formatNum(Math.abs(caloriesRemaining))} cal` 
              : `calories remaining: ${formatNum(caloriesRemaining)}`}
          </span>
        </div>

        <div className="shrink-0">
          <CircularProgress 
            value={consumedCalories} 
            max={profile.daily_calorie_goal}
            size={120}
            strokeWidth={8}
            color="#1A1A1A"
          >
            <span className="text-[32px]">🔥</span>
          </CircularProgress>
        </div>
      </motion.div>

      {/* 4. MACRO CARDS ROW */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-[16px]"
      >
        <div className="no-scrollbar mx-[16px] flex gap-[12px] overflow-x-auto snap-x snap-mandatory pt-1 pb-2">
          <div className="snap-start"><MacroCard label="Protein eaten" consumed={consumedProtein} goal={profile.protein_goal_g} color="#FF6B6B" icon="🍗" /></div>
          <div className="snap-start"><MacroCard label="Carbs eaten" consumed={consumedCarbs} goal={profile.carbs_goal_g} color="#FFA500" icon="🌾" /></div>
          <div className="snap-start"><MacroCard label="Fats eaten" consumed={consumedFats} goal={profile.fats_goal_g} color="#4A90E2" icon="🥑" /></div>
        </div>
        <div className="mt-[8px] flex justify-center gap-[4px]">
          <div className="h-[6px] w-[6px] rounded-full bg-gray-900"></div>
          <div className="h-[6px] w-[6px] rounded-full bg-gray-200"></div>
          <div className="h-[6px] w-[6px] rounded-full bg-gray-200"></div>
        </div>
      </motion.div>

      {/* 5. RECENTLY UPLOADED SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-[16px] mt-[24px]"
      >
        <div className="mb-[16px] flex items-center justify-between">
          <h3 className="text-[20px] font-bold text-gray-900">Recently uploaded</h3>
          <button 
            onClick={() => navigate('/history')}
            className="text-[14px] font-medium text-gray-500 active:text-gray-900 transition-colors"
          >
            See all
          </button>
        </div>

        {meals.length > 0 ? (
          <div className="flex flex-col">
            {meals.map((meal, index) => (
              <MealCard key={meal.id || index} meal={meal} onClick={() => handleMealClick(meal.id)} />
            ))}
          </div>
        ) : (
          <div className="mt-[16px] flex flex-col items-center justify-center rounded-[24px] border border-dashed border-gray-300 bg-white p-[32px] text-center">
            <span className="text-[64px] mb-4">🍽️</span>
            <h4 className="text-[17px] font-bold text-gray-900">No meals logged yet</h4>
            <p className="mt-1 text-[13px] text-gray-500 max-w-[200px]">
              Tap the + button to scan your first meal
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
