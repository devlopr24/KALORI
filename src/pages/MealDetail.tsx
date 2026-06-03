import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Share, MoreHorizontal, Bookmark, Edit2, Copy, Trash2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mealService } from '@/lib/mealService';
import toast from 'react-hot-toast';

const defaultIngredients = [
  { name: 'Basmati Rice', portion: '150g', calories: 195 },
  { name: 'Chicken', portion: '80g', calories: 130 },
  { name: 'Onions', portion: '30g', calories: 12 },
  { name: 'Spices', portion: '10g', calories: 25 },
  { name: 'Ghee', portion: '15g', calories: 130 }
];

export function MealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meal, setMeal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(1);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  useEffect(() => {
    if (!user || !id) return;
    
    const fetchMeal = async () => {
      try {
        setLoading(true);
        const data = await mealService.getMealById(user.id, id);
        if (data) {
          setMeal(data);
          setServings(data.servings || 1);
        } else {
          setMeal(null);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load meal details');
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-brand-tertiary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-400 border-t-gray-900"></div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-brand-tertiary">
        <span className="text-6xl mb-6">🔍</span>
        <h2 className="mb-2 text-2xl font-bold text-[#1A1A1A]">Meal Not Found</h2>
        <p className="mb-8 text-sm font-medium text-gray-500">This meal may have been deleted</p>
        <button
          onClick={() => navigate('/')}
          className="rounded-full bg-[#1A1A1A] px-8 py-3 font-semibold text-white transition-opacity hover:opacity-90"
        >
          Go to Home
        </button>
      </div>
    );
  }

  // Base values adjusted per 1 serving conceptually (we treat stored meal.* as the value for `meal.servings || 1`)
  const baseServings = meal.servings || 1;
  const baseCalories = meal.calories / baseServings;
  const baseProtein = meal.protein / baseServings;
  const baseCarbs = meal.carbs / baseServings;
  const baseFats = meal.fats / baseServings;

  const adjustedCalories = Math.round(baseCalories * servings);
  const adjustedProtein = Math.round(baseProtein * servings);
  const adjustedCarbs = Math.round(baseCarbs * servings);
  const adjustedFats = Math.round(baseFats * servings);

  const getGradientForCategory = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'curries': return 'from-[#FF6B35] to-[#FF8E53]';
      case 'rice': return 'from-[#FFA500] to-[#FFB84D]';
      case 'breads': return 'from-[#8B4513] to-[#A0522D]';
      case 'drinks': return 'from-[#4A90E2] to-[#6BA8E5]';
      case 'sweets': return 'from-[#E91E63] to-[#F06292]';
      default: return 'from-[#1A1A1A] to-[#2A2A2A]';
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: meal.name,
      text: `🍽️ Just ate ${meal.name}!\n🔥 ${adjustedCalories} calories\n\nTracked with KALORI - India's #1 AI Calorie Tracker for Indian Food`,
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        console.log('Share cancelled', e);
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      alert('Copied to clipboard!');
    }
  };

  const handleDelete = async () => {
    if (!user || !id) return;
    try {
      await mealService.deleteMeal(user.id, id);
      toast.success("Meal deleted");
      navigate(-1);
    } catch (e) {
      toast.error("Failed to delete meal");
    }
  };

  const handleDone = async () => {
    if (!user || !id) return;
    try {
      if (servings !== meal.servings) {
        await mealService.updateMeal(user.id, id, {
          servings,
          calories: adjustedCalories,
          protein: adjustedProtein,
          carbs: adjustedCarbs,
          fats: adjustedFats
        });
        toast.success("Meal updated");
      }
      navigate(-1);
    } catch (error) {
      toast.error("Failed to update meal");
    }
  };
  
  const formatDate = () => {
    if (meal.date === 'Today') return 'Today';
    if (meal.date === 'Yesterday') return 'Yesterday';
    return meal.meal_date || meal.date || 'Today';
  };
  
  const parsedNotes = meal.notes ? (typeof meal.notes === 'string' ? JSON.parse(meal.notes) : meal.notes) : null;
  const rawIngredients = parsedNotes?.ingredients ? (typeof parsedNotes.ingredients === 'string' ? JSON.parse(parsedNotes.ingredients) : parsedNotes.ingredients) : null;

  const ingredients = Array.isArray(rawIngredients) && rawIngredients.length > 0 ? rawIngredients : (meal.ingredients || defaultIngredients);
  
  const formattedTime = meal.logged_at ? new Date(meal.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : (meal.time || '');

  return (
    <div className="relative h-screen w-full overflow-hidden bg-brand-tertiary">
      {/* 1. PHOTO SECTION */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative h-[60vh] w-full overflow-hidden"
      >
        {meal.image_url ? (
          <img src={meal.image_url} alt={meal.name} className="h-full w-full object-cover" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getGradientForCategory(meal.category)}`}>
            <span className="text-[120px] drop-shadow-xl">{meal.emoji || '🍽️'}</span>
          </div>
        )}
        
        {/* Gradient Overlay for Top Bar Visibility */}
        <div className="absolute left-0 top-0 h-1/2 w-full bg-gradient-to-b from-black/40 to-transparent" />

        {/* TOP FLOATING BAR */}
        <div className="absolute left-0 top-0 z-10 flex w-full items-center justify-between px-4 pt-12 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-md transition-transform active:scale-95"
          >
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </button>
          
          <h1 className="text-[17px] font-bold text-white drop-shadow-md">Nutrition</h1>
          
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-md transition-transform active:scale-95"
            >
              <Share size={18} className="text-[#1A1A1A]" />
            </button>
            <button
              onClick={() => setShowMoreMenu(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-md transition-transform active:scale-95"
            >
              <MoreHorizontal size={20} className="text-[#1A1A1A]" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. WHITE CARD OVERLAY */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.1 }}
        className="absolute bottom-0 z-20 flex max-h-[75vh] w-full flex-col rounded-t-[32px] bg-white pt-6 shadow-[0_-8px_32px_rgba(0,0,0,0.1)]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#E5E5EA]" />
        
        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-[100px]">
          
          {/* TIME + BOOKMARK */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 rounded-full bg-[#F5F5F7] px-3 py-1.5">
              <Bookmark size={14} className="fill-[#1A1A1A] text-[#1A1A1A] opacity-90" />
              <span className="text-xs font-semibold text-[#1A1A1A]">{formattedTime}</span>
            </div>
            <span className="text-xs font-medium text-[#8E8E93]">{formatDate()}</span>
          </motion.div>

          {/* DISH NAME + SERVIING MULTIPLIER */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6 flex items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="leading-tight text-2xl font-extrabold text-[#1A1A1A]">{meal.name}</h2>
              {meal.name_hindi && (
                <p className="mt-1 text-sm font-medium text-[#8E8E93]">{meal.name_hindi}</p>
              )}
            </div>
            
            <div className="flex min-w-[110px] items-center rounded-full bg-[#F5F5F7] p-1">
              <button 
                onClick={() => setServings(s => Math.max(0.5, s - 0.5))}
                disabled={servings <= 0.5}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform active:scale-95 disabled:opacity-40"
              >
                <span className="text-lg font-medium text-[#1A1A1A]">−</span>
              </button>
              <div className="flex-1 text-center font-bold text-[#1A1A1A]">{servings}</div>
              <button 
                onClick={() => setServings(s => s + 0.5)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform active:scale-95"
              >
                <span className="text-lg font-medium text-[#1A1A1A]">+</span>
              </button>
            </div>
          </motion.div>

          {/* BIG CALORIE CARD */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-4 flex items-center gap-4 rounded-[24px] border border-[#F0F0F0] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#FFF5F0]">
              <span className="text-[32px]">🔥</span>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-[#8E8E93]">Calories</p>
              <motion.div 
                 key={adjustedCalories}
                 initial={{ scale: 0.95, opacity: 0.8 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="mt-0.5 text-4xl font-extrabold leading-none text-[#1A1A1A]"
              >
                {adjustedCalories}
              </motion.div>
              {servings !== 1 && <p className="mt-0.5 text-[11px] font-medium text-[#8E8E93]">Updated for {servings} serving{servings !== 1 ? 's' : ''}</p>}
            </div>
          </motion.div>

          {/* MACROS BREAKDOWN */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-5 grid grid-cols-3 gap-2.5">
            <div className="flex flex-col items-center gap-2 rounded-[18px] border border-[#F0F0F0] bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFE5E5] text-[#FF6B6B] font-bold text-xs">P</div>
                <span className="text-xs font-semibold text-[#8E8E93]">Protein</span>
              </div>
              <motion.span key={adjustedProtein} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-lg font-bold text-[#1A1A1A]">{adjustedProtein}g</motion.span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-[18px] border border-[#F0F0F0] bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFF0E0] text-[#FFA500] font-bold text-xs">C</div>
                <span className="text-xs font-semibold text-[#8E8E93]">Carbs</span>
              </div>
              <motion.span key={adjustedCarbs} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-lg font-bold text-[#1A1A1A]">{adjustedCarbs}g</motion.span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-[18px] border border-[#F0F0F0] bg-white p-3.5 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E5F1FF] text-[#4A90E2] font-bold text-xs">F</div>
                <span className="text-xs font-semibold text-[#8E8E93]">Fats</span>
              </div>
              <motion.span key={adjustedFats} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-lg font-bold text-[#1A1A1A]">{adjustedFats}g</motion.span>
            </div>
          </motion.div>

          {/* PAGINATION DOTS */}
          <div className="mb-6 flex justify-center gap-1.5">
             <div className="h-1.5 w-1.5 rounded-full bg-[#1A1A1A]" />
             <div className="h-1.5 w-1.5 rounded-full bg-[#E5E5EA]" />
          </div>

          {/* INGREDIENTS SECTION */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Ingredients</h3>
              <button className="text-sm font-semibold text-[#1A1A1A] active:opacity-70">+ Add more</button>
            </div>
            <div className="flex flex-col gap-2">
              {ingredients.map((ing, idx) => {
                const itemCalories = Math.round((ing.calories / baseServings) * servings);
                return (
                  <button key={idx} className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] p-3.5 text-left transition-all active:scale-[0.98] active:border-[#1A1A1A]">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#1A1A1A]">{ing.name} • {ing.portion}</span>
                      <span className="mt-0.5 text-xs font-medium text-[#8E8E93]">{itemCalories} cal</span>
                    </div>
                    <div className="rounded-full border border-[#F0F0F0] bg-white px-3 py-1.5 text-[13px] font-medium text-[#8E8E93]">
                      {(parseFloat(ing.portion) || 1) * servings}{ing.portion.replace(/[\d.\s]/g, '')}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
          
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="absolute bottom-0 left-0 w-full border-t border-[#F0F0F0] bg-white px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
          <div className="mx-auto flex max-w-[430px] gap-3">
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#F0F0F0] bg-white py-3.5 text-sm font-semibold text-[#1A1A1A] transition-colors active:bg-gray-50">
              <Sparkles size={16} /> Fix Results
            </button>
            <button 
              onClick={handleDone}
              className="flex flex-[1.5] items-center justify-center gap-1.5 rounded-full bg-[#1A1A1A] py-3.5 text-[15px] font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-opacity active:opacity-90"
            >
              Done
            </button>
          </div>
        </div>
      </motion.div>

      {/* MORE MENU MODAL */}
      <AnimatePresence>
        {showMoreMenu && (
          <div className="relative z-50">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/50" 
               onClick={() => setShowMoreMenu(false)} 
            />
            <motion.div
               initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed bottom-0 left-0 w-full rounded-t-[28px] bg-white p-5 pb-[max(20px,env(safe-area-inset-bottom))]"
            >
              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-3 rounded-2xl bg-[#FAFAFA] p-4 transition-colors active:bg-gray-100">
                  <Edit2 size={20} className="text-[#1A1A1A]" />
                  <span className="text-base font-semibold text-[#1A1A1A]">Edit Meal</span>
                </button>
                <button className="flex items-center gap-3 rounded-2xl bg-[#FAFAFA] p-4 transition-colors active:bg-gray-100">
                  <Copy size={20} className="text-[#1A1A1A]" />
                  <span className="text-base font-semibold text-[#1A1A1A]">Duplicate to Today</span>
                </button>
                <button 
                  onClick={() => {
                    setShowMoreMenu(false);
                    setTimeout(() => setShowDeleteConfirm(true), 200);
                  }}
                  className="flex items-center gap-3 rounded-2xl bg-[#FFF0F0] p-4 transition-colors active:bg-red-50"
                >
                  <Trash2 size={20} className="text-[#FF6B6B]" />
                  <span className="text-base font-semibold text-[#FF6B6B]">Delete Meal</span>
                </button>
                <button 
                  onClick={() => setShowMoreMenu(false)}
                  className="mt-1 rounded-2xl border border-[#F0F0F0] bg-white p-4 text-center text-base font-semibold text-[#1A1A1A] transition-colors active:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="relative z-[60] flex items-center justify-center">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/60" 
            />
            <motion.div
               initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className="fixed inset-x-10 top-1/2 -translate-y-1/2 overflow-hidden rounded-[24px] bg-white p-6 shadow-xl"
            >
              <h3 className="mb-2 text-center text-lg font-bold text-[#1A1A1A]">Delete this meal?</h3>
              <p className="mb-6 text-center text-sm font-medium text-[#8E8E93]">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-full bg-[#F5F5F7] py-3 text-sm font-bold tracking-tight text-[#1A1A1A]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 rounded-full bg-[#FF6B6B] py-3 text-sm font-bold tracking-tight text-white"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
