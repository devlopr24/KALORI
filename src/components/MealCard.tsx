import { motion } from 'framer-motion';

export function MealCard({ meal, onClick }: { meal: any; onClick: () => void }) {
  const formattedTime = meal.logged_at ? new Date(meal.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : (meal.time || '');

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="mb-[12px] flex cursor-pointer rounded-[20px] bg-brand-primary p-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-[16px] bg-brand-tertiary text-[40px] overflow-hidden">
        {meal.image_url ? (
          <img src={meal.image_url} alt={meal.name} className="h-full w-full object-cover" />
        ) : (
          meal.emoji || '🍽️'
        )}
      </div>
      
      <div className="ml-[12px] flex flex-1 flex-col justify-center">
        <div className="flex items-center justify-between">
          <h4 className="text-[16px] font-bold text-text-primary limit-lines-1 truncate pr-2">{meal.name}</h4>
          <span className="shrink-0 text-[12px] text-text-secondary">{formattedTime}</span>
        </div>
        
        <div className="mt-[4px] text-[15px] font-semibold text-text-primary">
          <span className="text-xl inline-block mr-1">🔥</span> {Math.round(meal.calories || 0)} Calories
        </div>
        
        <div className="mt-[4px] text-[12px] text-text-secondary">
          🍗 {Math.round(meal.protein || 0)}g &nbsp; 🌾 {Math.round(meal.carbs || 0)}g &nbsp; 🥑 {Math.round(meal.fats || 0)}g
        </div>
      </div>
    </motion.div>
  );
}
