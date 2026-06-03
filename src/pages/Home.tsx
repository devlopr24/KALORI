import { useUserData } from '@/hooks/useUserData';
import { Logo } from '@/components/Logo';
import { DateSelector } from '@/components/DateSelector';
import { CircularProgress } from '@/components/CircularProgress';
import { MacroCard } from '@/components/MacroCard';
import { MealCard } from '@/components/MealCard';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const data = useUserData();
  const navigate = useNavigate();

  if (!data) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-text-tertiary border-t-text-primary rounded-full"></div>
      </div>
    );
  }

  const consumedCalories = data.meals_today.reduce((acc, meal) => acc + meal.calories, 0);
  const consumedProtein = data.meals_today.reduce((acc, meal) => acc + meal.protein, 0);
  const consumedCarbs = data.meals_today.reduce((acc, meal) => acc + meal.carbs, 0);
  const consumedFats = data.meals_today.reduce((acc, meal) => acc + meal.fats, 0);

  const caloriesRemaining = data.daily_calorie_goal - consumedCalories;
  const isOverGoal = caloriesRemaining < 0;

  const handleMealClick = (id: string) => {
    navigate(`/meal/${id}`);
  };

  const formatNum = (num: number) => Intl.NumberFormat('en-US').format(Math.round(num));

  return (
    <div className="flex min-h-full flex-col pb-[120px]">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between bg-brand-primary px-[16px]">
        <Logo />
        <motion.button 
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center gap-1 rounded-full border border-border-light bg-brand-primary px-[14px] py-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          onClick={() => {}}
        >
          <span className="text-[14px]">🔥</span>
          <span className="text-[14px] font-semibold text-text-primary">{formatNum(data.current_streak)}</span>
        </motion.button>
      </header>

      {/* 2. DATE SELECTOR */}
      <DateSelector />

      {/* 3. MAIN CALORIE CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-[16px] mt-[16px] flex items-center justify-between rounded-[28px] bg-brand-primary p-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      >
        <div className="flex flex-col">
          <span className="text-[14px] text-text-secondary">Calories eaten</span>
          <div className="mt-1 flex items-baseline gap-1 relative -left-1">
            <span className="text-[48px] font-extrabold leading-none tracking-tight text-text-primary">
              {formatNum(consumedCalories)}
            </span>
            <span className="text-[24px] font-medium text-text-secondary leading-none">
              /{formatNum(data.daily_calorie_goal)}
            </span>
          </div>
          <span className={`mt-2 text-[13px] font-medium ${isOverGoal ? 'text-protein-red' : 'text-success-green'}`}>
            {isOverGoal 
              ? `over by ${formatNum(Math.abs(caloriesRemaining))} cal` 
              : `calories remaining: ${formatNum(caloriesRemaining)}`}
          </span>
        </div>

        <div className="shrink-0">
          <CircularProgress 
            value={consumedCalories} 
            max={data.daily_calorie_goal}
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
          <div className="snap-start"><MacroCard label="Protein eaten" consumed={consumedProtein} goal={data.protein_goal_g} color="#FF6B6B" icon="🍗" /></div>
          <div className="snap-start"><MacroCard label="Carbs eaten" consumed={consumedCarbs} goal={data.carbs_goal_g} color="#FFA500" icon="🌾" /></div>
          <div className="snap-start"><MacroCard label="Fats eaten" consumed={consumedFats} goal={data.fats_goal_g} color="#4A90E2" icon="🥑" /></div>
        </div>
        <div className="mt-[8px] flex justify-center gap-[4px]">
          <div className="h-[6px] w-[6px] rounded-full bg-text-primary"></div>
          <div className="h-[6px] w-[6px] rounded-full bg-text-tertiary"></div>
          <div className="h-[6px] w-[6px] rounded-full bg-text-tertiary"></div>
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
          <h3 className="text-[20px] font-bold text-text-primary">Recently uploaded</h3>
          <button 
            onClick={() => navigate('/history')}
            className="text-[14px] font-medium text-text-secondary active:text-text-primary transition-colors"
          >
            See all
          </button>
        </div>

        {data.meals_today.length > 0 ? (
          <div className="flex flex-col">
            {data.meals_today.map((meal, index) => (
              <MealCard key={meal.id || index} meal={meal} onClick={() => handleMealClick(meal.id)} />
            ))}
          </div>
        ) : (
          <div className="mt-[24px] flex flex-col items-center justify-center rounded-[24px] border border-dashed border-text-tertiary bg-brand-primary p-[32px] text-center">
            <span className="text-[64px] mb-4">🍽️</span>
            <h4 className="text-[17px] font-bold text-text-primary">No meals logged yet</h4>
            <p className="mt-1 text-[13px] text-text-secondary max-w-[200px]">
              Tap the + button to scan your first meal
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
