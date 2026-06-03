import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Target, Activity, Flame, Bell, Clock, Scale, Moon, Download, Lock, FileText, HelpCircle, MessageCircle, Star, Share, Info, Trash2, RotateCcw, LogOut, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { settingsService } from '@/lib/settingsService';
import { premiumGateService } from '@/lib/premiumGateService';
import toast from 'react-hot-toast';

export function Settings() {
  const navigate = useNavigate();
  const { user, profile: authProfile, refreshProfile, signOut } = useAuth();
  
  // Settings State
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Modal temporary state
  const [tempCalorieGoal, setTempCalorieGoal] = useState(2000);
  const [tempTargetWeight, setTempTargetWeight] = useState(70);
  const [tempActivity, setTempActivity] = useState('Moderate');
  const [tempWeightUnit, setTempWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [tempHeightUnit, setTempHeightUnit] = useState<'cm' | 'ft'>('cm');

  // Macro modal state (percentages)
  const [macroP, setMacroP] = useState(30);
  const [macroC, setMacroC] = useState(40);
  const [macroF, setMacroF] = useState(30);

  // Derived Values
  const calorie_goal = authProfile?.daily_calorie_goal || 2000;
  const username = user?.user_metadata?.full_name || 'KALORI User';
  const weight_unit = authProfile?.weight_unit || 'kg';
  const height_unit = authProfile?.height_unit || 'cm';
  const streak = authProfile?.current_streak || 0;
  const current_weight = authProfile?.current_weight_kg || 0;
  const notifications = authProfile?.notifications_enabled ?? true;

  const handleToggleNotifications = async () => {
    if (!user) return;
    const newVal = !notifications;
    try {
      // Optmistic UI usually is applied through auth context or fast refresh, but here we await
      await settingsService.updateProfile(user.id, { notifications_enabled: newVal });
      await refreshProfile();
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const handleResetApp = async () => {
    if (!user) return;
    try {
      setSaving(true);
      await settingsService.resetUserData(user.id);
      
      // Clear all local caches
      localStorage.removeItem('user_profile_cache');
      localStorage.removeItem('weight_history_cache');
      localStorage.removeItem('meals_today');
      localStorage.removeItem('current_streak');
      
      await refreshProfile();
      setShowResetModal(false);
      toast.success('App data reset successfully');
      navigate('/onboarding/welcome', { replace: true });
    } catch (e) {
      toast.error('Failed to reset app data');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!user || isExporting) return;
    try {
      setIsExporting(true);
      const data = await settingsService.exportUserData(user.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kalori_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (e) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const saveSetting = async (updates: any) => {
    if (!user) return;
    try {
      setSaving(true);
      await settingsService.updateProfile(user.id, updates);
      await refreshProfile();
      setActiveModal(null);
      toast.success('Updated successfully');
    } catch (e) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const saveMacros = async () => {
    if (macroP + macroC + macroF !== 100) {
      toast.error("Macros must equal 100%");
      return;
    }
    const protein_goal_g = Math.round((calorie_goal * (macroP / 100)) / 4);
    const carbs_goal_g = Math.round((calorie_goal * (macroC / 100)) / 4);
    const fats_goal_g = Math.round((calorie_goal * (macroF / 100)) / 9);

    await saveSetting({ protein_goal_g, carbs_goal_g, fats_goal_g });
  };

  const openModal = (type: string) => {
    if (type === 'calories') setTempCalorieGoal(calorie_goal);
    if (type === 'weight') setTempTargetWeight(authProfile?.goal_weight_kg || 70);
    if (type === 'activity') setTempActivity(authProfile?.activity_level || 'Moderate');
    if (type === 'macros') {
      // Calculate current percentages
      const p = authProfile?.protein_goal_g || 150;
      const c = authProfile?.carbs_goal_g || 200;
      const f = authProfile?.fats_goal_g || 66;
      const totalCal = p * 4 + c * 4 + f * 9;
      
      const pp = Math.round((p * 4 / totalCal) * 100);
      const cp = Math.round((c * 4 / totalCal) * 100);
      const fp = 100 - pp - cp;
      
      setMacroP(pp || 30);
      setMacroC(cp || 40);
      setMacroF(fp || 30);
    }
    if (type === 'unit_weight') setTempWeightUnit(weight_unit as any);
    if (type === 'unit_height') setTempHeightUnit(height_unit as any);

    setActiveModal(type);
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
      <div className="flex items-center gap-1.5 min-w-[50px] justify-end">
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
            {username.charAt(0) || 'K'}
          </div>
          <div className="flex flex-1 flex-col gap-1 text-white">
            <h2 className="text-[18px] font-bold">{username}</h2>
            <p className="text-[12px] text-[#8E8E93] limit-lines-1">{user?.email}</p>
            {premiumGateService.isPremium(authProfile) ? (
              <div className="mt-1 flex w-fit items-center gap-1 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] px-2.5 py-1 text-[11px] font-bold text-[#1A1A1A]">
                <span>⭐</span> {authProfile?.premium_plan || 'Premium'}
              </div>
            ) : (
              <div className="mt-1 text-[11px] text-white/70">Free Plan</div>
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
          <span className="mt-0.5 text-[16px] font-extrabold text-[#1A1A1A]">{calorie_goal}</span>
          <span className="text-[11px] font-medium text-[#8E8E93]">Daily Goal</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 rounded-[16px] border border-[#F0F0F0] bg-white p-3.5 shadow-sm">
          <span className="text-[24px]">🔥</span>
          <span className="mt-0.5 text-[16px] font-extrabold text-[#1A1A1A]">{streak}</span>
          <span className="text-[11px] font-medium text-[#8E8E93]">Day Streak</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 rounded-[16px] border border-[#F0F0F0] bg-white p-3.5 shadow-sm">
          <span className="text-[24px]">⚖️</span>
          <span className="mt-0.5 text-[16px] font-extrabold text-[#1A1A1A]">{current_weight} <span className="text-xs">{weight_unit}</span></span>
          <span className="text-[11px] font-medium text-[#8E8E93]">Current</span>
        </div>
      </motion.div>

      {/* GOALS & NUTRITION */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Section title="Goals & Nutrition">
          <SettingsRow 
            onClick={() => openModal('calories')}
            icon={<Flame size={18} className="text-[#FF6B35]" />} bg="bg-[#FFE5DB]"
            title="Daily Calorie Goal" subtitle="Adjust your daily target"
            right={<><span className="text-[14px] font-semibold text-[#1A1A1A]">{calorie_goal} cal</span><ChevronRight size={18} className="text-[#C7C7CC]" /></>}
          />
          <SettingsRow 
            onClick={() => openModal('macros')}
            icon={<span className="text-[18px]">🥗</span>} bg="bg-[#E5FFE5]"
            title="Macro Distribution" subtitle="Protein/Carbs/Fats ratio"
            right={<><span className="text-[14px] font-semibold text-[#1A1A1A] text-right truncate max-w-[100px]">P: {authProfile?.protein_goal_g} C: {authProfile?.carbs_goal_g} F: {authProfile?.fats_goal_g}</span><ChevronRight size={18} className="text-[#C7C7CC] shrink-0" /></>}
          />
          <SettingsRow 
            onClick={() => openModal('weight')}
            icon={<Target size={18} className="text-[#E91E63]" />} bg="bg-[#FFE5F0]"
            title="Target Weight" subtitle="Set your goal weight"
            right={<><span className="text-[14px] font-semibold text-[#1A1A1A]">{authProfile?.goal_weight_kg || 0} {weight_unit}</span><ChevronRight size={18} className="text-[#C7C7CC]" /></>}
          />
          <SettingsRow 
            onClick={() => openModal('activity')}
            icon={<Activity size={18} className="text-[#4A90E2]" />} bg="bg-[#E5F1FF]"
            title="Activity Level" subtitle="Update your activity level"
            right={<><span className="text-[14px] font-semibold text-[#1A1A1A] text-right truncate max-w-[80px]">{({ 'sedentary': 'Sedentary', 'lightly_active': 'Light', 'moderately_active': 'Moderate', 'very_active': 'Active' } as any)[authProfile?.activity_level || 'moderately_active']}</span><ChevronRight size={18} className="text-[#C7C7CC] shrink-0" /></>}
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
            onClick={() => openModal('unit_weight')}
            icon={<Scale size={18} className="text-[#8E8E93]" />} bg="bg-[#F0F0F0]"
            title="Units (Weight)" subtitle="kg or lbs"
            right={<><span className="text-[14px] font-semibold text-[#1A1A1A]">{weight_unit}</span><ChevronRight size={18} className="text-[#C7C7CC]" /></>}
          />
          <SettingsRow 
            onClick={() => openModal('unit_height')}
            icon={<FileText size={18} className="text-[#8E8E93]" />} bg="bg-[#F0F0F0]"
            title="Units (Height)" subtitle="cm or ft"
            right={<><span className="text-[14px] font-semibold text-[#1A1A1A]">{height_unit}</span><ChevronRight size={18} className="text-[#C7C7CC]" /></>}
          />
        </Section>
      </motion.div>

      {/* PREMIUM BLOCK */}
      {authProfile && !premiumGateService.isPremium(authProfile) ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          onClick={() => navigate('/paywall?source=settings')}
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
      ) : authProfile && premiumGateService.isPremium(authProfile) ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="mx-4 mb-6 rounded-[20px] border border-[#F0F0F0] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-center gap-3 border-b border-[#F0F0F0] pb-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF5DB]">
               <span className="text-[20px]">⭐</span>
             </div>
             <div>
               <h3 className="text-[15px] font-bold text-[#1A1A1A]">{authProfile.premium_plan || 'Premium Plan'}</h3>
               <p className="text-[12px] text-[#8E8E93]">
                 {authProfile.premium_expires_at ? `Valid until ${new Date(authProfile.premium_expires_at).toLocaleDateString()}` : 'Lifetime Access'}
               </p>
             </div>
          </div>
          <button className="mt-3 w-full rounded-full bg-[#F5F5F7] py-2.5 text-[13px] font-bold text-[#1A1A1A] active:bg-[#eaeaec] transition-colors">
            Manage Subscription
          </button>
        </motion.div>
      ) : null}

      {/* DATA & PRIVACY */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Section title="Data & Privacy">
          <SettingsRow 
            onClick={handleExportData}
            icon={<Download size={18} className="text-[#4A90E2]" />} bg="bg-[#E5F1FF]"
            title="Export Data" subtitle={isExporting ? "Exporting..." : "Download your meal history"}
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
          <SettingsRow 
            onClick={() => setActiveModal('privacy')}
            icon={<Lock size={18} className="text-[#8E8E93]" />} bg="bg-[#F0F0F0]"
            title="Privacy Policy"
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
          <SettingsRow 
            onClick={() => setActiveModal('terms')}
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
            onClick={() => window.location.href = 'mailto:support@kalori.app'}
            icon={<MessageCircle size={18} className="text-[#4CAF50]" />} bg="bg-[#E5FFE5]"
            title="Contact Support" subtitle="Get help via email"
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
          <SettingsRow 
            onClick={() => window.open('https://play.google.com/store')}
            icon={<Star size={18} className="text-[#FFA500]" />} bg="bg-[#FFF5DB]"
            title="Rate Us" subtitle="Help us improve"
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
          <SettingsRow 
            icon={<Share size={18} className="text-[#4A90E2]" />} bg="bg-[#E5F1FF]"
            title="Share KALORI" subtitle="Tell your friends"
            onClick={() => {
              if (navigator.share) {
                navigator.share({title: 'KALORI', text: 'Track Indian food smartly!', url: window.location.origin}).catch(()=>{})
              } else {
                navigator.clipboard.writeText(window.location.origin);
                toast.success('Link copied to clipboard');
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
        </Section>
      </motion.div>

      {/* DANGER ZONE */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Section title="Account">
          <SettingsRow 
            icon={<LogOut size={18} className="text-[#8E8E93]" />} bg="bg-[#F0F0F0]"
            title="Sign Out" subtitle="Log out of your account"
            onClick={async () => {
              await signOut();
              navigate('/auth/welcome');
            }}
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
          <SettingsRow 
            icon={<RotateCcw size={18} className="text-[#FF8C00]" />} bg="bg-[#FFF0E0]"
            title="Reset App Data" subtitle="Clear local cache"
            onClick={() => setShowResetModal(true)}
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
          <SettingsRow 
            icon={<Trash2 size={18} className="text-[#FF6B6B]" />} bg="bg-[#FFE0E0]" danger
            title="Delete Account" subtitle="Permanently delete everything"
            onClick={() => setShowDeleteModal(true)}
            right={<ChevronRight size={18} className="text-[#C7C7CC]" />}
          />
        </Section>
      </motion.div>

      {/* --- MODALS --- */}
      
      {/* RESET APP MODAL */}
      <AnimatePresence>
        {showResetModal && (
          <div className="relative z-[100] flex items-center justify-center px-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
               onClick={() => !saving && setShowResetModal(false)} 
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
                  disabled={saving}
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 rounded-full bg-[#F5F5F7] py-3.5 text-[15px] font-bold text-[#1A1A1A] transition-colors hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  disabled={saving}
                  onClick={handleResetApp}
                  className="flex-1 rounded-full bg-[#FF8C00] py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90 shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Resetting...' : 'Yes, Reset'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE ACCOUNT MODAL (PLACEHOLDER) */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="relative z-[100] flex items-center justify-center px-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
               onClick={() => setShowDeleteModal(false)} 
            />
            <motion.div
               initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
               className="relative z-10 w-full max-w-[340px] overflow-hidden rounded-[24px] bg-white p-6 shadow-xl"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFE0E0]">
                <Trash2 size={24} className="text-[#FF6B6B]" />
              </div>
              <h3 className="mb-2 text-center text-[20px] font-bold text-[#1A1A1A]">Delete Account?</h3>
              <p className="mb-6 text-center text-[14px] font-medium leading-relaxed text-[#8E8E93]">
                This action is permanent and will delete all your data. Please contact support to proceed.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-full bg-[#F5F5F7] py-3.5 text-[15px] font-bold text-[#1A1A1A] transition-colors hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                     setShowDeleteModal(false);
                     window.location.href = 'mailto:support@kalori.app?subject=Account Deletion Request';
                  }}
                  className="flex-1 rounded-full bg-[#FF6B6B] py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90 shadow-sm"
                >
                  Contact Support
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SETTINGS MODALS */}
      <AnimatePresence>
        {activeModal && (
          <div className="relative z-[100] flex items-end justify-center sm:items-center">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
               onClick={() => !saving && setActiveModal(null)} 
            />
            <motion.div
               initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed bottom-0 w-full rounded-t-[28px] bg-white pb-[max(32px,env(safe-area-inset-bottom))] pt-6 sm:relative sm:w-full sm:max-w-[400px] sm:rounded-[28px] sm:pb-6"
            >
              <div className="px-5">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-[22px] font-extrabold text-[#1A1A1A]">
                    {activeModal === 'calories' && 'Daily Calories'}
                    {activeModal === 'weight' && 'Target Weight'}
                    {activeModal === 'activity' && 'Activity Level'}
                    {activeModal === 'macros' && 'Macro Distribution'}
                    {activeModal === 'unit_weight' && 'Weight Unit'}
                    {activeModal === 'unit_height' && 'Height Unit'}
                    {activeModal === 'privacy' && 'Privacy Policy'}
                    {activeModal === 'terms' && 'Terms of Service'}
                  </h2>
                  <button disabled={saving} onClick={() => setActiveModal(null)} className="rounded-full bg-[#F5F5F7] p-2 transition-colors active:bg-gray-200">
                    <X size={20} className="text-[#1A1A1A]" />
                  </button>
                </div>

                {activeModal === 'calories' && (
                  <>
                    <p className="text-[#8E8E93] text-sm mb-4">Set your daily calorie goal to adjust your target.</p>
                    <input 
                      type="number" 
                      value={tempCalorieGoal} 
                      onChange={(e) => setTempCalorieGoal(parseInt(e.target.value) || 0)}
                      className="w-full text-center text-3xl font-black mb-6 bg-[#FAFAFA] rounded-2xl py-4 border border-[#F0F0F0]"
                    />
                    <button disabled={saving} onClick={() => saveSetting({ daily_calorie_goal: tempCalorieGoal })} className="w-full rounded-full bg-[#1A1A1A] py-4 font-bold text-white">Save</button>
                  </>
                )}

                {activeModal === 'weight' && (
                  <>
                    <p className="text-[#8E8E93] text-sm mb-4">Set your target goal weight ({weight_unit}).</p>
                    <input 
                      type="number" 
                      value={tempTargetWeight} 
                      onChange={(e) => setTempTargetWeight(parseFloat(e.target.value) || 0)}
                      className="w-full text-center text-3xl font-black mb-6 bg-[#FAFAFA] rounded-2xl py-4 border border-[#F0F0F0]"
                    />
                    <button disabled={saving} onClick={() => saveSetting({ goal_weight_kg: tempTargetWeight })} className="w-full rounded-full bg-[#1A1A1A] py-4 font-bold text-white">Save</button>
                  </>
                )}

                {activeModal === 'macros' && (
                  <>
                    <div className="mb-4">
                       <label className="text-sm font-semibold text-[#1A1A1A]">Protein ({macroP}%)</label>
                       <input type="range" min="0" max="100" value={macroP} onChange={(e) => setMacroP(parseInt(e.target.value))} className="w-full mt-2" />
                    </div>
                    <div className="mb-4">
                       <label className="text-sm font-semibold text-[#1A1A1A]">Carbs ({macroC}%)</label>
                       <input type="range" min="0" max="100" value={macroC} onChange={(e) => setMacroC(parseInt(e.target.value))} className="w-full mt-2" />
                    </div>
                    <div className="mb-6">
                       <label className="text-sm font-semibold text-[#1A1A1A]">Fats ({macroF}%)</label>
                       <input type="range" min="0" max="100" value={macroF} onChange={(e) => setMacroF(parseInt(e.target.value))} className="w-full mt-2" />
                    </div>
                    <div className="text-center text-sm font-bold text-gray-500 mb-6">Total: {macroP + macroC + macroF}%</div>
                    <button disabled={saving || macroP + macroC + macroF !== 100} onClick={saveMacros} className="w-full rounded-full bg-[#1A1A1A] py-4 font-bold text-white disabled:opacity-50">Save Macros</button>
                  </>
                )}

                {activeModal === 'activity' && (
                  <div className="flex flex-col gap-3 mb-4">
                    {['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'].map((level) => {
                      const dbToActivityUI: any = { 'sedentary': 'Sedentary', 'lightly_active': 'Light', 'moderately_active': 'Moderate', 'very_active': 'Active' };
                      const activityUIToDb: any = { 'Sedentary': 'sedentary', 'Light': 'lightly_active', 'Moderate': 'moderately_active', 'Active': 'very_active', 'Very Active': 'very_active' };

                      return (
                      <button 
                        key={level} 
                        onClick={() => saveSetting({ activity_level: activityUIToDb[level] as any })}
                        className={`w-full text-left py-4 px-5 rounded-2xl border font-bold text-[15px] transition-all ${dbToActivityUI[authProfile?.activity_level || 'moderately_active'] === level ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md' : 'bg-white text-[#1A1A1A] border-[#F0F0F0]'}`}
                      >
                        {level}
                      </button>
                    )})}
                  </div>
                )}

                {activeModal === 'unit_weight' && (
                  <div className="flex gap-3 mb-4">
                    {['kg', 'lbs'].map((unit) => (
                      <button 
                        key={unit} 
                        onClick={() => saveSetting({ weight_unit: unit })}
                        className={`flex-1 py-4 rounded-2xl border font-bold text-[16px] transition-all ${weight_unit === unit ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md' : 'bg-white text-[#1A1A1A] border-[#F0F0F0]'}`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                )}

                {activeModal === 'unit_height' && (
                  <div className="flex gap-3 mb-4">
                    {['cm', 'ft'].map((unit) => (
                      <button 
                        key={unit} 
                        onClick={() => saveSetting({ height_unit: unit })}
                        className={`flex-1 py-4 rounded-2xl border font-bold text-[16px] transition-all ${height_unit === unit ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md' : 'bg-white text-[#1A1A1A] border-[#F0F0F0]'}`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                )}

                {activeModal === 'privacy' && (
                  <div className="h-[250px] overflow-y-auto mb-4 text-[#8E8E93] text-sm leading-relaxed p-4 bg-[#FAFAFA] rounded-2xl border border-[#F0F0F0]">
                     Your privacy is important to us. This privacy policy explains how KALORI collects and uses your data. We store your data securely using Supabase and do not sell your personal information to third parties. All your logged meals, weight data, and personal statistics remain fully under your control. You may export or delete your account at any time through these settings.
                  </div>
                )}

                {activeModal === 'terms' && (
                  <div className="h-[250px] overflow-y-auto mb-4 text-[#8E8E93] text-sm leading-relaxed p-4 bg-[#FAFAFA] rounded-2xl border border-[#F0F0F0]">
                     By using KALORI, you agree to these Terms of Service. You must provide accurate profile data to ensure calculation accuracy. The app's nutrition information, macro estimations, and AI recognitions are approximations and should not substitute professional medical or dietary advice. KALORI is not liable for health issues or dietary inaccuracies.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
