import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Target, Activity, Flame, Bell, Clock, Scale, Moon, Download, Lock, FileText, HelpCircle, MessageCircle, Star, Share, Info, Trash2, RotateCcw } from 'lucide-react';

export function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>({});
  
  // Settings State
  const [notifications, setNotifications] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  
  // Update state from local storage
  const loadData = () => {
    const getSetting = (key: string, def: any) => {
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : def;
      } catch {
        return def;
      }
    };

    setProfile({
      name: getSetting('user_name', 'KALORI User'),
      email: getSetting('user_email', 'teachmantra90@gmail.com'),
      calorie_goal: getSetting('daily_calorie_goal', 2547),
      protein_goal: getSetting('protein_goal_g', 120),
      carbs_goal: getSetting('carbs_goal_g', 250),
      fats_goal: getSetting('fats_goal_g', 85),
      target_weight: getSetting('goal_weight_kg', 65),
      current_weight: getSetting('current_weight_kg', 70),
      activity: getSetting('activity_level', 'Moderate'),
      weight_unit: getSetting('weight_unit', 'kg'),
      is_premium: getSetting('is_premium', false),
      streak: getSetting('current_streak', 5)
    });
    setNotifications(getSetting('notifications_enabled', true));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const handleToggleNotifications = () => {
    const newVal = !notifications;
    setNotifications(newVal);
    localStorage.setItem('notifications_enabled', JSON.stringify(newVal));
  };

  const handleResetApp = () => {
    localStorage.clear();
    setShowResetModal(false);
    navigate('/onboarding/welcome', { replace: true });
    window.location.reload();
  };

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button 
      onClick={onToggle}
      className={`relative flex h-[28px] w-[48px] items-center rounded-full p-[2px] transition-colors ${active ? 'bg-[#1A1A1A]' : 'bg-[#C7C7CC]'}`}
    >
      <div className={`h-[24px] w-[24px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform ${active ? 'translate-x-[20px]' : 'translate-x-0'}`} />
    </button>
  );

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="mb-2 ml-6 text-[11px] font-bold tracking-[1px] text-[#8E8E93] uppercase">{title}</h3>
      <div className="overflow-hidden rounded-[18px] border border-[#F0F0F0] bg-white mx-4">
        {children}
      </div>
    </div>
  );

  const SettingsRow = ({ icon, bg, title, subtitle, right, danger = false, onClick }: any) => (
    <div 
      onClick={onClick}
      className="flex items-center gap-3.5 border-b border-[#F5F5F7] p-4 transition-colors active:bg-[#FAFAFA] last:border-b-0 cursor-pointer"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${bg}`}>
        {icon}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className={`text-[15px] font-semibold ${danger ? 'text-[#FF6B6B]' : 'text-[#1A1A1A]'}${title === 'Reset App Data' ? ' text-[#FF8C00]' : ''}`}>{title}</span>
        {subtitle && <span className="text-[12px] text-[#8E8E93]">{subtitle}</span>}
      </div>
      <div className="flex items-center gap-1.5">
        {right}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#FAFAFA] overflow-y-auto no-scrollbar pb-[100px] pt-safe">
      {/* HEADER */}
      <div className="bg-white px-4 pb-2 pt-12">
        <h1 className="text-[28px] font-extrabold text-[#1A1A1A]">Settings</h1>
      </div>

      {/* PROFILE CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="relative mx-4 mt-2 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
      >
        <div className="absolute -right-10 -top-10 h-[200px] w-[200px] rounded-full bg-[radial-gradient(circle,rgba(255,107,53,0.15),transparent)]" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-white/10 bg-gradient-to-br from-[#FF6B35] to-[#FFA500] text-[28px] font-extrabold text-white">
            {profile.name?.charAt(0) || 'K'}
          </div>
          <div className="flex flex-1 flex-col gap-1 text-white">
            <h2 className="text-[18px] font-bold">{profile.name}</h2>
            <p className="text-[12px] text-[#8E8E93]">Track Indian food smartly</p>
            {profile.is_premium && (
              <div className="mt-1 flex w-fit items-center gap-1 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] px-2.5 py-1 text-[11px] font-bold text-[#1A1A1A]">
                <span>⭐</span> Premium
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/settings/profile')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors active:bg-white/20"
          >
            <span className="text-[16px]">✏️</span>
          </button>
        </div>
      </motion.div>

      {/* STATS QUICK VIEW */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mx-4 mt-4 mb-2 grid grid-cols-3 gap-2.5">
        <div className="flex flex-col items-center justify-center gap-1 rounded-[16px] border border-[#F0F0F0] bg-white p-3.5 shadow-sm">
          <span className="text-[24px]">🎯</span>
          <span className="mt-0.5 text-[16px] font-extrabold text-[#1A1A1A]">{profile.calorie_goal}</span>
          <span className="text-[11px] font-medium text-[#8E8E93]">Daily Goal</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 rounded-[16px] border border-[#F0F0F0] bg-white p-3.5 shadow-sm">
          <span className="text-[24px]">🔥</span>
          <span className="mt-0.5 text-[16px] font-extrabold text-[#1A1A1A]">{profile.streak}</span>
          <span className="text-[11px] font-medium text-[#8E8E93]">Day Streak</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 rounded-[16px] border border-[#F0F0F0] bg-white p-3.5 shadow-sm">
          <span className="text-[24px]">⚖️</span>
          <span className="mt-0.5 text-[16px] font-extrabold text-[#1A1A1A]">{profile.current_weight} {profile.weight_unit}</span>
          <span className="text-[11px] font-medium text-[#8E8E93]">Current</span>
        </div>
      </motion.div>

      {/* GOALS & NUTRITION */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Section title="Goals & Nutrition">
          <SettingsRow 
            icon={<Flame size={18} className="text-[#FF6B35]" />} bg="bg-[#FFE5DB]"
            title="Daily Calorie Goal" subtitle="Adjust your daily target"
            right={<><span className="text-[14px] font-semibold text-[#1A1A1A]">{profile.calorie_goal} cal</span><ChevronRight size={18} className="text-[#C7C7CC]" /></>}
          />
          <SettingsRow 
            icon={<span className="text-[18px]">🥗</span>} bg="bg-[#E5FFE5]"
            title="Macro Distribution" subtitle="Protein/Carbs/Fats ratio"
            right={<><span className="text-[14px] font-semibold text-[#1A1A1A]">P: {profile.protein_goal} C: {profile.carbs_goal} F: {profile.fats_goal}</span><ChevronRight size={18} className="text-[#C7C7CC]" /></>}
          />
          <SettingsRow 
            icon={<Target size={18} className="text-[#E91E63]" />} bg="bg-[#FFE5F0]"
            title="Target Weight" subtitle="Set your goal weight"
            right={<><span className="text-[14px] font-semibold text-[#1A1A1A]">{profile.target_weight} {profile.weight_unit}</span><ChevronRight size={18} className="text-[#C7C7CC]" /></>}
          />
          <SettingsRow 
            icon={<Activity size={18} className="text-[#4A90E2]" />} bg="bg-[#E5F1FF]"
            title="Activity Level" subtitle="Update your activity level"
            right={<><span className="text-[14px] font-semibold text-[#1A1A1A]">{profile.activity}</span><ChevronRight size={18} className="text-[#C7C7CC]" /></>}
          />
        </Section>
      </motion.div>

      {/* APP PREFERENCES */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Section title="App Preferences">
          <SettingsRow 
            icon={<Bell size={18} className="text-[#FFA500]" />} bg="bg-[#FFF5DB]"
            title="Notifications" subtitle="Meal reminders & alerts"
            right={<Toggle active={notifications} onToggle={handleToggleNotifications} />}
          />
          <SettingsRow 
            icon={<Clock size={18} className="text-[#4A90E2]" />} bg="bg-[#E5F1FF]"
            title="Daily Reminders" subtitle="Set meal reminder times"
            right={<><span className="text-[14px] font-semibold text-[#1A1A1A]">3 times</span><ChevronRight size={18} className="text-[#C7C7CC]" /></>}
          />
          <SettingsRow 
            icon={<Scale size={18} className="text-[#8E8E93]" />} bg="bg-[#F0F0F0]"
            title="Units (Weight)" subtitle="kg or lbs"
            right={<><span className="text-[14px] font-semibold text-[#1A1A1A]">{profile.weight_unit}</span><ChevronRight size={18} className="text-[#C7C7CC]" /></>}
          />
          <SettingsRow 
            icon={<Moon fill="white" size={18} className="text-white" />} bg="bg-[#1A1A1A]"
            title="Dark Mode" subtitle="Coming soon"
            right={<Toggle active={false} onToggle={() => {}} />}
          />
        </Section>
      </motion.div>

      {/* PREMIUM BLOCK */}
      {!profile.is_premium && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          onClick={() => navigate('/paywall')}
          className="mx-4 mb-6 flex cursor-pointer items-center justify-between rounded-[20px] bg-gradient-to-r from-[#FFD700] to-[#FFA500] p-5 shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-4">
            <span className="text-[40px] drop-shadow-sm">⭐</span>
            <div>
              <h3 className="text-[16px] font-extrabold text-[#1A1A1A]">Upgrade to Premium</h3>
              <p className="text-[12px] font-semibold text-[#1A1A1A] opacity-80">Unlock unlimited scans & more</p>
            </div>
          </div>
          <button className="rounded-full bg-[#1A1A1A] px-4 py-2 text-[12px] font-bold text-white shadow-sm">
            Try Free
          </button>
        </motion.div>
      )}

      {/* DATA & PRIVACY */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Section title="Data & Privacy">
          <SettingsRow 
            icon={<Download size={18} className="text-[#4A90E2]" />} bg="bg-[#E5F1FF]"
            title="Export Data" subtitle="Download your meal history"
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
          <SettingsRow 
            icon={<Lock size={18} className="text-[#8E8E93]" />} bg="bg-[#F0F0F0]"
            title="Privacy Policy"
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
          <SettingsRow 
            icon={<FileText size={18} className="text-[#8E8E93]" />} bg="bg-[#F0F0F0]"
            title="Terms of Service"
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
        </Section>
      </motion.div>

      {/* SUPPORT */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Section title="Support">
          <SettingsRow 
            icon={<HelpCircle size={18} className="text-[#4A90E2]" />} bg="bg-[#E5F1FF]"
            title="Help Center" subtitle="FAQs and tutorials"
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
          <SettingsRow 
            icon={<MessageCircle size={18} className="text-[#4CAF50]" />} bg="bg-[#E5FFE5]"
            title="Contact Support" subtitle="Get help via email"
            onClick={() => window.location.href = 'mailto:support@kalori.app'}
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
          <SettingsRow 
            icon={<Star size={18} className="text-[#FFA500]" />} bg="bg-[#FFF5DB]"
            title="Rate Us" subtitle="Help us improve"
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
          <SettingsRow 
            icon={<Share size={18} className="text-[#4A90E2]" />} bg="bg-[#E5F1FF]"
            title="Share KALORI" subtitle="Tell your friends"
            onClick={() => {
              if (navigator.share) {
                navigator.share({title: 'KALORI', text: 'Track Indian food smartly!', url: window.location.origin})
              }
            }}
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
        </Section>
      </motion.div>

      {/* ABOUT */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Section title="About">
          <SettingsRow 
            icon={<Info size={18} className="text-[#8E8E93]" />} bg="bg-[#F0F0F0]"
            title="Version"
            right={<span className="text-[14px] font-semibold text-[#8E8E93]">1.0.0</span>}
          />
          <SettingsRow 
            icon={<span className="text-[18px]">✨</span>} bg="bg-[#FFE5DB]"
            title="What's New" subtitle="See latest updates"
            right={<><span className="rounded-full bg-[#FF6B35] px-2 py-0.5 text-[10px] font-bold text-white">New</span><ChevronRight size={18} className="text-[#C7C7CC]" /></>}
          />
        </Section>
      </motion.div>

      {/* DANGER ZONE */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Section title="Danger Zone">
          <SettingsRow 
            icon={<RotateCcw size={18} className="text-[#FF8C00]" />} bg="bg-[#FFF0E0]"
            title="Reset App Data" subtitle="Clear all data and start over"
            onClick={() => setShowResetModal(true)}
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
          <SettingsRow 
            icon={<Trash2 size={18} className="text-[#FF6B6B]" />} bg="bg-[#FFE0E0]" danger
            title="Delete Account" subtitle="Permanently delete everything"
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
        </Section>
      </motion.div>

      {/* RESET APP MODAL */}
      <AnimatePresence>
        {showResetModal && (
          <div className="relative z-[100] flex items-center justify-center px-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
               onClick={() => setShowResetModal(false)} 
            />
            <motion.div
               initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
               className="relative z-10 w-full max-w-[340px] overflow-hidden rounded-[24px] bg-white p-6 shadow-xl"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0E0]">
                <RotateCcw size={24} className="text-[#FF8C00]" />
              </div>
              <h3 className="mb-2 text-center text-[20px] font-bold text-[#1A1A1A]">Reset App Data?</h3>
              <p className="mb-6 text-center text-[14px] font-medium leading-relaxed text-[#8E8E93]">
                This will delete all your meals, weight history, and settings. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 rounded-full bg-[#F5F5F7] py-3.5 text-[15px] font-bold text-[#1A1A1A] transition-colors hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleResetApp}
                  className="flex-1 rounded-full bg-[#FF8C00] py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90 shadow-sm"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
