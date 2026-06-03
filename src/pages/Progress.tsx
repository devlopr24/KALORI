import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  Area,
  AreaChart,
  CartesianGrid
} from 'recharts';
import { Target, Trophy, TrendingUp, BarChart2, CheckCircle2, ChevronRight, Scale, X, Flame } from 'lucide-react';

const getStoredData = (key: string, defaultValue: any) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.warn(`Error reading ${key}:`, error);
    return defaultValue;
  }
};

const mockWeightHistory = [
  { month: 'Jun', weight: 75.0, date: '2025-06-01' },
  { month: 'Jul', weight: 74.2, date: '2025-07-01' },
  { month: 'Aug', weight: 73.5, date: '2025-08-01' },
  { month: 'Sep', weight: 72.5, date: '2025-09-01' },
  { month: 'Oct', weight: 71.5, date: '2025-10-01' },
  { month: 'Nov', weight: 70.5, date: '2025-11-01' }
];

const mockDailyInsights = [
  { day: 'M', calories: 2400, status: 'hit' },
  { day: 'T', calories: 2350, status: 'hit' },
  { day: 'W', calories: 2500, status: 'close' },
  { day: 'T', calories: 2420, status: 'hit' },
  { day: 'F', calories: 2800, status: 'over' },
  { day: 'S', calories: 2100, status: 'hit' },
  { day: 'S', calories: 0, status: 'missed' }
];

export function Progress() {
  const [currentWeight, setCurrentWeight] = useState(70.5);
  const [goalWeight, setGoalWeight] = useState(65.0);
  const [streak, setStreak] = useState(5);
  const [weightHistory, setWeightHistory] = useState(mockWeightHistory);
  const [timeRange, setTimeRange] = useState('6M');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState(currentWeight);

  useEffect(() => {
    // Initialize data
    const localWeight = getStoredData('current_weight_kg', 70.5);
    const localGoal = getStoredData('goal_weight_kg', 65.0);
    const localStreak = getStoredData('current_streak', 5);
    const localHist = getStoredData('weight_history', mockWeightHistory);

    setCurrentWeight(localWeight);
    setGoalWeight(localGoal);
    setStreak(localStreak);
    setWeightHistory(localHist);
    setNewWeight(localWeight);
  }, []);

  const progressPercent = Math.min(
    100,
    Math.max(0, ((75 - currentWeight) / (75 - goalWeight)) * 100) // Assuming starting at 75 for demo
  );

  const isLosing = weightHistory.length > 1 && weightHistory[weightHistory.length - 1].weight <= weightHistory[weightHistory.length - 2].weight;
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-[#1A1A1A] px-3 py-2 text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
          <p className="text-sm font-semibold">{`${label}: ${payload[0].value} kg`}</p>
        </div>
      );
    }
    return null;
  };

  const handleSaveWeight = () => {
    localStorage.setItem('current_weight_kg', JSON.stringify(newWeight));
    setCurrentWeight(newWeight);
    
    const newEntry = {
      month: new Date().toLocaleDateString('en-US', { month: 'short' }),
      weight: newWeight,
      date: new Date().toISOString()
    };
    
    const newHistory = [...weightHistory, newEntry];
    setWeightHistory(newHistory);
    localStorage.setItem('weight_history', JSON.stringify(newHistory));
    
    setShowWeightModal(false);
  };

  return (
    <div className="relative h-screen w-full bg-[#FAFAFA] overflow-y-auto no-scrollbar pb-[100px]">
      {/* 1. HEADER SECTION */}
      <div className="bg-white px-4 pb-4 pt-5">
        <h1 className="text-[28px] font-extrabold text-[#1A1A1A]">Progress</h1>
        <p className="mt-1 text-[14px] font-medium text-[#8E8E93]">Your transformation journey</p>
      </div>

      {/* 2. TOP STATS CARDS ROW */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        {/* Weight Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col gap-3 rounded-[22px] border border-[#F0F0F0] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
        >
          <div>
            <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-[#8E8E93]">Your Weight</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[28px] font-extrabold leading-none text-[#1A1A1A]">{currentWeight}</span>
              <span className="text-[14px] font-bold text-[#8E8E93]">kg</span>
            </div>
          </div>
          
          <div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#F5F5F7]">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-[#1A1A1A]" 
              />
            </div>
            <p className="mt-1 text-[11px] font-medium text-[#8E8E93]">Goal: {goalWeight} kg</p>
          </div>

          <button 
            onClick={() => setShowWeightModal(true)}
            className="mt-1 flex items-center justify-between rounded-xl bg-[#1A1A1A] p-2.5 text-[13px] font-semibold text-white transition-opacity active:opacity-80"
          >
            Log Weight
            <ChevronRight size={16} />
          </button>
        </motion.div>

        {/* Streak Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="relative min-h-[140px] overflow-hidden rounded-[22px] bg-gradient-to-br from-[#FFE5DB] to-[#FFD4B8] p-4 shadow-[0_4px_16px_rgba(255,107,53,0.15)]"
        >
          <div className="absolute -right-2 -top-2 rotate-[15deg] text-[120px] opacity-15">
            🔥
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <span className="text-[48px] font-black leading-none text-[#FF6B35] drop-shadow-sm">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  {streak}
                </motion.span>
              </span>
              <p className="mt-1 text-[14px] font-bold text-[#FF6B35]">Day Streak</p>
            </div>
            
            <div className="mt-3 flex gap-1">
              {['S','M','T','W','T','F','S'].map((day, i) => {
                const isToday = i === 4; // Mocking today as Thursday
                const isLogged = i < 4;
                return (
                  <div 
                    key={i} 
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold
                      ${isLogged ? 'bg-[#FF6B35] text-white' : 
                        isToday ? 'border-2 border-[#FF6B35] bg-white text-[#FF6B35]' : 
                        i > 4 ? 'bg-white/40 text-[#FF6B35]' : 
                        'border border-dashed border-[#FF6B35]/30 bg-transparent text-[#FF6B35]/50'
                      }`}
                  >
                    {isLogged ? <CheckCircle2 size={10} className="stroke-[3]" /> : day}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. WEIGHT PROGRESS GRAPH */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mx-4 mt-4 rounded-[22px] border border-[#F0F0F0] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-[#1A1A1A]">Weight Progress</h2>
          <div className="flex items-center gap-1 rounded-full bg-[#F5F5F7] px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A]">
            <Target size={12} className="text-[#FF6B35]" />
            {Math.round(progressPercent)}% of goal
          </div>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isLosing ? "#4CAF50" : "#FF6B6B"} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={isLosing ? "#4CAF50" : "#FF6B6B"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#8E8E93', dy: 10}} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#8E8E93'}} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke={isLosing ? "#4CAF50" : "#FF6B6B"} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorWeight)" 
                activeDot={{ r: 6, fill: '#fff', stroke: isLosing ? "#4CAF50" : "#FF6B6B", strokeWidth: 2, className: 'shadow-[0_0_0_8px_rgba(76,175,80,0.2)]' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex justify-center gap-1 rounded-full bg-[#F5F5F7] p-1">
          {['90D', '6M', '1Y', 'ALL'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-full px-4 py-2 text-[12px] font-semibold transition-all ${
                timeRange === range 
                  ? 'bg-white text-[#1A1A1A] shadow-[0_1px_3px_rgba(0,0,0,0.1)]' 
                  : 'text-[#8E8E93] active:bg-black/5'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#E8F5E9] px-4 py-3 text-[#4CAF50]">
          <SparklesIcon />
          <p className="text-[13px] font-medium leading-tight">
            {progressPercent > 80 ? "Almost there! You've got this! 💪" : "Great job! Consistency is key, and you're mastering it!"}
          </p>
        </div>
      </motion.div>

      {/* 4. DAILY CALORIE INSIGHTS */}
      <div className="mx-4 mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-[#1A1A1A]">Daily Average Calories</h2>
          <span className="text-[12px] font-medium text-[#8E8E93]">Last 7 days</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mb-3 rounded-[22px] border border-[#F0F0F0] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[36px] font-extrabold leading-none text-[#1A1A1A]">2,415</div>
              <div className="mt-1 text-[14px] font-medium text-[#8E8E93]">cal</div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-[#E8F5E9] px-2.5 py-1.5 text-[12px] font-bold text-[#4CAF50]">
              <TrendingUp size={14} className="stroke-[3]" />
              90% on target
            </div>
          </div>

          <div className="mt-5 flex h-[80px] items-end gap-1.5">
            {mockDailyInsights.map((day, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <motion.div 
                  initial={{ height: 0 }} animate={{ height: day.calories > 0 ? `${(day.calories / 3000) * 100}%` : '8px' }} transition={{ delay: 0.5 + (i * 0.1) }}
                  className={`w-full rounded-t-md ${
                    day.status === 'hit' ? 'bg-[#1A1A1A]' : 
                    day.status === 'over' ? 'bg-[#FF6B6B]' : 
                    day.status === 'close' ? 'bg-[#FF6B35]' : 'bg-[#C7C7CC]'
                  }`}
                  style={{ minHeight: '8px' }}
                />
                <span className="text-[10px] font-semibold text-[#8E8E93]">{day.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-2 border-transparent"
        >
          {[
            { label: 'Best Day', value: '1,890 cal', icon: '🏆', color: 'bg-white' },
            { label: 'Off Day', value: '3,200 cal', icon: '📊', color: 'bg-white' },
            { label: 'Weekly Avg', value: '2,415 cal', icon: '📈', color: 'bg-white' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-1 rounded-[16px] border border-[#F0F0F0] bg-white p-3 text-center shadow-sm">
              <span className="text-[20px]">{stat.icon}</span>
              <span className="text-[11px] font-medium text-[#8E8E93]">{stat.label}</span>
              <span className="text-[13px] font-bold text-[#1A1A1A]">{stat.value}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 5. STREAK CALENDAR */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="mx-4 mt-6 mb-6 rounded-[22px] border border-[#F0F0F0] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-[#1A1A1A]">Activity Calendar</h2>
          <span className="text-[12px] font-medium text-[#8E8E93]">Last 30 days</span>
        </div>

        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: 30 }).map((_, i) => {
            const isToday = i === 28;
            const isFuture = i > 28;
            const completed = i < 28 && Math.random() > 0.3; // mock past data
            const intensity = completed ? Math.floor(Math.random() * 3) + 1 : 0;
            
            let bgClass = "bg-[#FAFAFA] border border-[#F0F0F0]";
            if (isToday) bgClass = "bg-[#FF6B35] text-white";
            else if (isFuture) bgClass = "bg-[#F5F5F7] border border-dashed border-[#E5E5EA]";
            else if (intensity === 3) bgClass = "bg-[#1A1A1A]";
            else if (intensity === 2) bgClass = "bg-[#A0A0A0]";
            else if (intensity === 1) bgClass = "bg-[#E0E0E0]";

            return (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.1 }}
                className={`flex aspect-square items-center justify-center rounded-md ${bgClass} transition-transform`}
              >
                {isToday && <span className="text-[10px] font-bold text-white">{new Date().getDate()}</span>}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-medium text-[#8E8E93]">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-2.5 w-2.5 rounded-sm border border-[#F0F0F0] bg-[#FAFAFA]" />
            <div className="h-2.5 w-2.5 rounded-sm bg-[#E0E0E0]" />
            <div className="h-2.5 w-2.5 rounded-sm bg-[#A0A0A0]" />
            <div className="h-2.5 w-2.5 rounded-sm bg-[#1A1A1A]" />
          </div>
          <span>More</span>
        </div>
      </motion.div>

      {/* 6. ACHIEVEMENT BADGES */}
      <div className="mx-4 mb-6">
        <h2 className="mb-3 text-[18px] font-bold text-[#1A1A1A]">Achievements</h2>
        
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '🥇', label: 'First Scan', unlocked: true },
            { icon: '🔥', label: '7 Day Streak', unlocked: streak >= 7 },
            { icon: '💪', label: '30 Day Streak', unlocked: streak >= 30 },
            { icon: '🎯', label: 'Goal Hit', unlocked: false },
          ].map((badge, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + (i * 0.1) }}
              whileTap={{ scale: 0.95 }}
              className={`flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[18px] border p-2 text-center transition-all ${
                badge.unlocked 
                  ? 'border-[#FF6B35] bg-gradient-to-br from-[#FFE5DB] to-[#FFD4B8] shadow-[0_4px_12px_rgba(255,107,53,0.2)]'
                  : 'border-transparent bg-[#F5F5F7] opacity-60 grayscale filter'
              }`}
            >
              <span className="text-[28px]">{badge.icon}</span>
              <span className={`text-[10px] font-bold leading-tight ${badge.unlocked ? 'text-[#1A1A1A]' : 'text-[#8E8E93]'}`}>{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* WEIGHT LOGGING MODAL */}
      <AnimatePresence>
        {showWeightModal && (
          <div className="relative z-[100] flex items-end justify-center sm:items-center">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
               onClick={() => setShowWeightModal(false)} 
            />
            <motion.div
               initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed bottom-0 w-full rounded-t-[28px] bg-white pb-[max(32px,env(safe-area-inset-bottom))] pt-6 sm:relative sm:w-full sm:max-w-[400px] sm:rounded-[28px] sm:pb-6"
            >
              <div className="px-5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-[22px] font-extrabold text-[#1A1A1A]">Log Your Weight</h2>
                    <p className="text-[14px] font-medium text-[#8E8E93]">Track your progress</p>
                  </div>
                  <button onClick={() => setShowWeightModal(false)} className="rounded-full bg-[#F5F5F7] p-2 transition-colors active:bg-gray-200">
                    <X size={20} className="text-[#1A1A1A]" />
                  </button>
                </div>

                <div className="mx-auto mb-6 flex w-fit rounded-full bg-[#F5F5F7] p-1">
                  <button className="rounded-full bg-white px-5 py-1.5 text-[13px] font-bold text-[#1A1A1A] shadow-sm">kg</button>
                  <button className="rounded-full px-5 py-1.5 text-[13px] font-bold text-[#8E8E93] transition-colors hover:text-[#1A1A1A]">lbs</button>
                </div>

                <div className="mb-8 text-center object-center">
                  <div className="text-[72px] font-black tracking-tight text-[#1A1A1A] leading-none">
                    {newWeight.toFixed(1)}
                  </div>
                  <div className="text-[20px] font-bold text-[#8E8E93] mt-2">kg</div>
                </div>

                <div className="mb-8 flex items-center justify-center gap-3">
                  <button onClick={() => setNewWeight(w => Number((w - 0.5).toFixed(1)))} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F7] text-[24px] font-medium text-[#1A1A1A] active:scale-95 transition-transform">−</button>
                  
                  <div className="flex gap-2 overflow-hidden px-4">
                    {[newWeight - 0.5, newWeight, newWeight + 0.5].map((w, i) => (
                      <div key={i} className={`flex h-12 w-16 items-center justify-center rounded-xl font-bold transition-all ${
                        i === 1 ? 'bg-[#1A1A1A] text-white shadow-md' : 'bg-transparent text-[#8E8E93]'
                      }`}>
                        {w.toFixed(1)}
                      </div>
                    ))}
                  </div>

                  <button onClick={() => setNewWeight(w => Number((w + 0.5).toFixed(1)))} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F7] text-[24px] font-medium text-[#1A1A1A] active:scale-95 transition-transform">+</button>
                </div>

                <div className="mb-6 flex gap-2">
                  <button className="flex-1 rounded-xl bg-[#1A1A1A] py-2.5 text-[13px] font-bold text-white">Today</button>
                  <button className="flex-1 rounded-xl bg-[#F5F5F7] py-2.5 text-[13px] font-bold text-[#8E8E93] transition-colors active:bg-gray-200">Yesterday</button>
                </div>

                <textarea 
                  placeholder="Add a note..." 
                  className="mb-6 min-h-[80px] w-full rounded-xl bg-[#FAFAFA] border border-[#F0F0F0] p-3 text-[14px] text-[#1A1A1A] placeholder:text-[#8E8E93] outline-none focus:border-[#1A1A1A] transition-colors"
                />

                <button 
                  onClick={handleSaveWeight}
                  className="w-full rounded-full bg-[#1A1A1A] py-4 text-[16px] font-bold text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-opacity active:opacity-90"
                >
                  Save Weight Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2L12 8.5L18.5 10.5L12 12.5L10 19L8 12.5L1.5 10.5L8 8.5L10 2Z" fill="currentColor"/>
      <path d="M18.5 17L19.5 19.5L22 20.5L19.5 21.5L18.5 24L17.5 21.5L15 20.5L17.5 19.5L18.5 17Z" fill="currentColor"/>
      <path d="M19 4L19.5 5.5L21 6L19.5 6.5L19 8L18.5 6.5L17 6L18.5 5.5L19 4Z" fill="currentColor"/>
    </svg>
  );
}

