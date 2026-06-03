import React, { useState, useEffect, useMemo } from 'react';
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
import { Target, Trophy, TrendingUp, BarChart2, CheckCircle2, ChevronRight, Scale, X, Flame, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { weightService, WeightEntry } from '@/lib/weightService';
import toast from 'react-hot-toast';

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
  const { user, profile, refreshProfile } = useAuth();
  
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [range, setRange] = useState<'90D'|'6M'|'1Y'|'ALL'>('6M');
  
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [savingWeight, setSavingWeight] = useState(false);
  
  const [newWeight, setNewWeight] = useState(70);
  const [unit, setUnit] = useState<'kg'|'lbs'>('kg');
  const [entryDateType, setEntryDateType] = useState<'today'|'yesterday'|'custom'>('today');
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'bad' | null>(null);

  const rangeToDays: Record<string, number | undefined> = { '90D': 90, '6M': 180, '1Y': 365, 'ALL': undefined };

  const fetchHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(false);
      
      const days = rangeToDays[range];
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const data = await weightService.getWeightHistory(user.id, days);
      clearTimeout(timeoutId);
      
      setWeightHistory(data);
      localStorage.setItem('weight_history_cache', JSON.stringify(data));
    } catch (err: any) {
      console.error(err);
      if (err.name === 'AbortError') {
         setError(true);
         toast.error("Couldn't load weight history (timeout)");
      } else {
        const cached = localStorage.getItem('weight_history_cache');
        if (cached) {
          setWeightHistory(JSON.parse(cached));
          toast("You're offline. Showing last saved data");
        } else {
          setError(true);
          toast.error("Couldn't load weight history");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, range]);

  useEffect(() => {
    if (showWeightModal) {
      const baseWeight = profile?.current_weight_kg || 70;
      setNewWeight(unit === 'lbs' ? Number((baseWeight / 0.453592).toFixed(1)) : baseWeight);
      setEntryDateType('today');
      setNotes('');
      setMood(null);
    }
  }, [showWeightModal]);

  const handleUnitToggle = (newUnit: 'kg'|'lbs') => {
    if (newUnit === unit) return;
    setUnit(newUnit);
    if (newUnit === 'lbs') {
      setNewWeight(Number((newWeight / 0.453592).toFixed(1)));
    } else {
      setNewWeight(Number((newWeight * 0.453592).toFixed(1)));
    }
  };

  const handleSaveWeight = async () => {
    if (!user) return;
    try {
      setSavingWeight(true);
      const weight_kg = unit === 'lbs' ? Number((newWeight * 0.453592).toFixed(2)) : newWeight;
      
      let loggedDate = customDate;
      if (entryDateType === 'today') {
        loggedDate = new Date().toISOString().split('T')[0];
      } else if (entryDateType === 'yesterday') {
        loggedDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      }

      await weightService.upsertWeightEntry(user.id, {
        weight_kg,
        logged_date: loggedDate,
        notes: notes.trim() || null,
        mood
      });

      await refreshProfile();
      await fetchHistory();

      toast.success("Weight saved ✓");
      setShowWeightModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save weight entry");
    } finally {
      setSavingWeight(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    if (!window.confirm("Delete this weight entry?")) return;
    
    try {
      await weightService.deleteWeightEntry(user.id, entryId);
      setWeightHistory(prev => prev.filter(e => e.id !== entryId));
      if (weightHistory.length > 0 && profile) {
          refreshProfile(); // Optionally update profile if the latest weight was deleted, though this might be complex to determine what the 'newest' is directly without a server trigger. We'll let them refresh or re-weigh.
      }
      toast.success("Entry deleted");
    } catch (e) {
      toast.error("Couldn't delete entry");
    }
  };

  const currentWeight = profile?.current_weight_kg;
  const goalWeight = profile?.goal_weight_kg;
  const hasWeightGoal = currentWeight != null && goalWeight != null;
  const streak = profile?.current_streak || 0;

  const getStartWeight = () => {
    if (weightHistory.length === 0) return currentWeight || 0;
    const max = Math.max(...weightHistory.map(w => w.weight_kg));
    if (goalWeight && currentWeight && goalWeight > currentWeight) {
        return Math.min(...weightHistory.map(w => w.weight_kg));
    }
    return max;
  };

  const startW = getStartWeight();
  let progressPercent = 0;
  if (hasWeightGoal && startW !== goalWeight) {
    progressPercent = Math.min(100, Math.max(0, ((startW - currentWeight) / (startW - goalWeight)) * 100));
  }

  const graphData = useMemo(() => {
    return weightHistory.map(entry => {
      const d = new Date(entry.logged_date);
      const month = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { month, dateISO: entry.logged_date, weight: entry.weight_kg };
    });
  }, [weightHistory]);

  const isLosing = graphData.length > 1 && graphData[graphData.length - 1].weight <= graphData[graphData.length - 2].weight;
  
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
          {loading ? (
             <div className="animate-pulse flex flex-col gap-3 h-full">
               <div className="h-4 w-20 bg-gray-200 rounded"></div>
               <div className="h-8 w-24 bg-gray-200 rounded"></div>
               <div className="h-2 w-full bg-gray-200 rounded mt-auto"></div>
             </div>
          ) : (
            <>
              {!hasWeightGoal ? (
                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-[12px] font-medium text-[#8E8E93] text-center mb-2">Goal unset</span>
                  <button onClick={() => setShowWeightModal(true)} className="rounded-xl bg-[#1A1A1A] p-2 text-[13px] font-semibold text-white">Log Weight</button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </>
          )}
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
                const isToday = i === 4; 
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
        className="mx-4 mt-4 rounded-[22px] border border-[#F0F0F0] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex flex-col min-h-[350px]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-[#1A1A1A]">Weight Progress</h2>
          <div className="flex items-center gap-1 rounded-full bg-[#F5F5F7] px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A]">
            <Target size={12} className="text-[#FF6B35]" />
            {Math.round(progressPercent)}% of goal
          </div>
        </div>

        {loading ? (
          <div className="h-[200px] w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#1A1A1A]"></div>
          </div>
        ) : error && graphData.length === 0 ? (
           <div className="h-[200px] w-full flex flex-col items-center justify-center gap-3">
             <span className="text-gray-400 text-sm">Failed to load history</span>
             <button onClick={fetchHistory} className="bg-[#1A1A1A] text-white text-xs px-4 py-2 rounded-lg font-bold shadow">Retry</button>
           </div>
        ) : graphData.length === 0 ? (
          <div className="h-[200px] w-full flex flex-col items-center justify-center text-center">
            <Scale size={32} className="text-[#8E8E93] mb-3 opacity-50" />
            <p className="text-[14px] font-medium text-[#1A1A1A] mb-1">No weight entries yet</p>
            <button onClick={() => setShowWeightModal(true)} className="text-[#FF6B35] font-bold text-[13px]">Log your first weight</button>
          </div>
        ) : (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isLosing ? "#4CAF50" : "#FF6B6B"} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={isLosing ? "#4CAF50" : "#FF6B6B"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#8E8E93', dy: 10}} minTickGap={20} />
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
        )}

        <div className="mt-auto pt-4 flex justify-center gap-1 rounded-full bg-[#F5F5F7] p-1">
          {['90D', '6M', '1Y', 'ALL'].map(r => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className={`rounded-full px-4 py-2 text-[12px] font-semibold transition-all ${
                range === r 
                  ? 'bg-white text-[#1A1A1A] shadow-[0_1px_3px_rgba(0,0,0,0.1)]' 
                  : 'text-[#8E8E93] active:bg-black/5'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 4. RECENT WEIGHT ENTRIES */}
      {weightHistory.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mx-4 mt-6 rounded-[22px] border border-[#F0F0F0] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
        >
          <div className="mb-4">
            <h2 className="text-[18px] font-bold text-[#1A1A1A]">Recent Logs</h2>
          </div>
          <div className="flex flex-col gap-3">
            {weightHistory.slice().reverse().slice(0, 7).map((entry) => (
              <div key={entry.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-2xl bg-[#FAFAFA] border border-[#F0F0F0]">
                <div className="flex items-center gap-3 w-full">
                   <div className="flex-1">
                     <p className="font-bold text-[#1A1A1A] text-[15px]">{entry.weight_kg} kg</p>
                     <p className="font-medium text-[#8E8E93] text-[12px]">{new Date(entry.logged_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                   </div>
                   {entry.mood && (
                      <div className="text-[18px]">
                        {entry.mood === 'great' && '🤩'}
                        {entry.mood === 'good' && '🙂'}
                        {entry.mood === 'okay' && '😐'}
                        {entry.mood === 'bad' && '😩'}
                      </div>
                   )}
                   <button onClick={() => handleDeleteEntry(entry.id)} className="p-2 text-red-500 bg-red-50 rounded-xl opacity-70 active:opacity-100 transition-opacity">
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* DAILY CALORIE INSIGHTS */}
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
      </div>

      {/* WEIGHT LOGGING MODAL */}
      <AnimatePresence>
        {showWeightModal && (
          <div className="relative z-[100] flex items-end justify-center sm:items-center">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
               onClick={() => !savingWeight && setShowWeightModal(false)} 
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
                  <button disabled={savingWeight} onClick={() => setShowWeightModal(false)} className="rounded-full bg-[#F5F5F7] p-2 transition-colors active:bg-gray-200">
                    <X size={20} className="text-[#1A1A1A]" />
                  </button>
                </div>

                <div className="mx-auto mb-6 flex w-fit rounded-full bg-[#F5F5F7] p-1">
                  <button onClick={() => handleUnitToggle('kg')} className={`rounded-full px-5 py-1.5 text-[13px] font-bold transition-all ${unit === 'kg' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#8E8E93]'}`}>kg</button>
                  <button onClick={() => handleUnitToggle('lbs')} className={`rounded-full px-5 py-1.5 text-[13px] font-bold transition-all ${unit === 'lbs' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#8E8E93]'}`}>lbs</button>
                </div>

                <div className="mb-8 text-center object-center">
                  <div className="text-[72px] font-black tracking-tight text-[#1A1A1A] leading-none">
                    {newWeight.toFixed(1)}
                  </div>
                  <div className="text-[20px] font-bold text-[#8E8E93] mt-2">{unit}</div>
                </div>

                <div className="mb-8 flex items-center justify-center gap-3">
                  <button onClick={() => setNewWeight(w => Number((w - (unit === 'kg' ? 0.5 : 1)).toFixed(1)))} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F7] text-[24px] font-medium text-[#1A1A1A] active:scale-95 transition-transform">−</button>
                  
                  <div className="flex gap-2 overflow-hidden px-4">
                    {[-1, 0, 1].map((offset, i) => {
                      const displayedValue = newWeight + (offset * (unit === 'kg' ? 0.5 : 1));
                      return (
                        <div key={i} className={`flex h-12 min-w-[3rem] px-2 items-center justify-center rounded-xl font-bold transition-all ${
                          i === 1 ? 'bg-[#1A1A1A] text-white shadow-md' : 'bg-transparent text-[#8E8E93]'
                        }`}>
                          {(displayedValue > 0 ? displayedValue : 0).toFixed(1)}
                        </div>
                      );
                    })}
                  </div>

                  <button onClick={() => setNewWeight(w => Number((w + (unit === 'kg' ? 0.5 : 1)).toFixed(1)))} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F7] text-[24px] font-medium text-[#1A1A1A] active:scale-95 transition-transform">+</button>
                </div>

                <div className="mb-4 flex gap-2">
                  <button onClick={() => setEntryDateType('today')} className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-colors ${entryDateType === 'today' ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F7] text-[#8E8E93] active:bg-gray-200'}`}>Today</button>
                  <button onClick={() => setEntryDateType('custom')} className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-colors ${entryDateType === 'custom' ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F7] text-[#8E8E93] active:bg-gray-200'}`}>Custom</button>
                </div>
                
                {entryDateType === 'custom' && (
                  <div className="mb-4">
                    <input 
                      type="date" 
                      max={new Date().toISOString().split('T')[0]}
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full rounded-xl bg-[#FAFAFA] border border-[#F0F0F0] p-3 text-[14px] font-semibold text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                )}

                <div className="mb-4 grid grid-cols-4 gap-2">
                   {(['great', 'good', 'okay', 'bad'] as const).map((m) => (
                      <button 
                         key={m}
                         onClick={() => setMood(mood === m ? null : m)}
                         className={`py-2 rounded-xl text-2xl flex flex-col items-center justify-center border transition-all ${mood === m ? 'border-[#1A1A1A] bg-gray-50' : 'border-[#F0F0F0] bg-[#FAFAFA] opacity-70'}`}
                      >
                         {m === 'great' && '🤩'}
                         {m === 'good' && '🙂'}
                         {m === 'okay' && '😐'}
                         {m === 'bad' && '😩'}
                      </button>
                   ))}
                </div>

                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note..." 
                  className="mb-6 min-h-[60px] w-full rounded-xl bg-[#FAFAFA] border border-[#F0F0F0] p-3 text-[14px] text-[#1A1A1A] placeholder:text-[#8E8E93] outline-none focus:border-[#1A1A1A] transition-colors resize-none"
                />

                <button 
                  disabled={savingWeight}
                  onClick={handleSaveWeight}
                  className="w-full rounded-full bg-[#1A1A1A] py-4 text-[16px] font-bold text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-opacity active:opacity-90 disabled:opacity-50"
                >
                  {savingWeight ? (
                    <div className="flex items-center justify-center">
                       <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-white mr-2"></div>
                       Saving...
                    </div>
                  ) : "Save Weight Entry"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
