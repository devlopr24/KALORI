import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Sparkles, X, Pencil } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mealService } from '@/lib/mealService';
import { premiumGateService } from '@/lib/premiumGateService';
import toast from 'react-hot-toast';

// Configuration Data
const PORTION_OPTIONS = [
  { id: '1katori', label: '1 Katori', emoji: '🥣', calories: 247, grams: '150g', p: 15, c: 36, f: 12 },
  { id: '1plate', label: '1 Plate', emoji: '🍽️', calories: 578, grams: '350g', p: 35, c: 85, f: 28 },
  { id: 'fullplate', label: 'Full Plate', emoji: '🍛', calories: 825, grams: '500g', p: 50, c: 121, f: 40 },
  { id: 'custom', label: 'Custom', emoji: '📏', calories: 0, grams: 'Enter', p: 0, c: 0, f: 0 }
];

const EXTRAS_OPTIONS = [
  { id: 'ghee', label: 'Extra Ghee', emoji: '🧈', calories: 80, p: 0, c: 0, f: 9 },
  { id: 'cheese', label: 'Cheese', emoji: '🧀', calories: 100, p: 5, c: 1, f: 8 },
  { id: 'sugar', label: 'Sugar', emoji: '🍯', calories: 50, p: 0, c: 13, f: 0 },
  { id: 'coconut', label: 'Coconut', emoji: '🥥', calories: 60, p: 1, c: 3, f: 6 },
  { id: 'tadka', label: 'Extra Tadka', emoji: '🌶️', calories: 40, p: 0, c: 1, f: 4 },
  { id: 'cream', label: 'Cream', emoji: '🥛', calories: 90, p: 1, c: 2, f: 10 },
  { id: 'nuts', label: 'Nuts', emoji: '🥜', calories: 70, p: 2, c: 3, f: 6 }
];

const getStoredJSON = (storage: Storage, key: string, defaultValue: any) => {
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.warn(`Error reading ${key}:`, error);
    return defaultValue;
  }
};

const setStoredJSON = (storage: Storage, key: string, value: any) => {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error storing ${key}:`, error);
  }
};

export function ScanConfirm() {
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);
  const portionRef = useRef<HTMLDivElement>(null);

  const rawImage = sessionStorage.getItem('captured_image') || '';
  const aiResult = getStoredJSON(sessionStorage, 'ai_result', null);
  
  const [showPortions, setShowPortions] = useState(false);
  const [selectedPortion, setSelectedPortion] = useState(PORTION_OPTIONS[1]); // Default to 1 Plate
  const [selectedExtras, setSelectedExtras] = useState<typeof EXTRAS_OPTIONS>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!aiResult) {
      if(process.env.NODE_ENV !== 'development') navigate('/');
    }
  }, [aiResult, navigate]);

  if (!aiResult) return null;

  const handleYes = () => {
    setShowPortions(true);
    setTimeout(() => {
      portionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const toggleExtra = (ext: typeof EXTRAS_OPTIONS[0]) => {
    setSelectedExtras(prev => 
      prev.find(e => e.id === ext.id) ? prev.filter(e => e.id !== ext.id) : [...prev, ext]
    );
  };

  // Calculations
  const totalCalories = selectedPortion.calories + selectedExtras.reduce((sum, e) => sum + e.calories, 0);
  const totalP = (selectedPortion.p) + selectedExtras.reduce((sum, e) => sum + e.p, 0);
  const totalC = (selectedPortion.c) + selectedExtras.reduce((sum, e) => sum + e.c, 0);
  const totalF = (selectedPortion.f) + selectedExtras.reduce((sum, e) => sum + e.f, 0);

  const getMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "breakfast";
    if (hour >= 11 && hour < 16) return "lunch";
    if (hour >= 16 && hour < 19) return "snack";
    if (hour >= 19 && hour < 23) return "dinner";
    return "late_night";
  };

  const handleAddLog = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const ingredientsString = typeof aiResult.detected_ingredients === 'string' ? aiResult.detected_ingredients : JSON.stringify(aiResult.detected_ingredients);

      await mealService.addMeal(user.id, {
        name: aiResult.dish_name_english,
        name_hindi: aiResult.dish_name_hindi,
        emoji: aiResult.emoji,
        meal_type: getMealType(),
        calories: totalCalories,
        protein: totalP,
        carbs: totalC,
        fats: totalF,
        portion_label: selectedPortion.label,
        portion_grams: parseInt(selectedPortion.grams) || null,
        servings: 1, // default
        scan_method: 'ai_camera',
        ai_confidence: aiResult.confidence,
        notes: JSON.stringify({ extras: selectedExtras.map(e => e.label), ingredients: ingredientsString })
      });

      try {
        await premiumGateService.recordSuccessfulScan(user.id, {
          identified_name: aiResult.dish_name_english,
          identified_food_id: null,
          ai_provider: 'fallback',
          ai_model: null,
          ai_confidence: aiResult.confidence || null,
          ai_response: aiResult,
          image_url: rawImage.substring(0, 50) === 'data:image' ? null : null, // we shouldn't save giant base64 to DB unless needed. We'll skip for now or limit size
          processing_time_ms: null,
          api_cost_inr: null
        });
      } catch (e) {
        console.warn("Failed to record scan", e);
      }

      setShowSuccess(true);
      setTimeout(() => navigate('/'), 800);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-[#F0F0F0] px-[16px] bg-white">
        <button onClick={() => navigate(-1)} className="flex h-[40px] w-[40px] items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all">
          <ArrowLeft className="text-[#1A1A1A]" size={24} />
        </button>
        <span className="text-[17px] font-bold text-[#1A1A1A]">Confirm Meal</span>
        <div className="w-[40px]"></div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto pb-[140px]" ref={topRef}>
        
        {/* Photo Section */}
        <div className="flex flex-col items-center bg-[#FAFAFA] px-[20px] py-[24px]">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="relative h-[220px] w-[220px]">
            {rawImage ? (
               <img src={rawImage} alt={aiResult.dish_name_english} className="h-full w-full rounded-[28px] object-cover shadow-[0_8px_24px_rgba(0,0,0,0.08)]" />
            ) : (
               <div className="h-full w-full rounded-[28px] bg-gray-200"></div>
            )}
            
            {/* Confidence Badge */}
            <div className={`absolute right-[12px] top-[12px] flex items-center gap-[4px] rounded-full px-[12px] py-[6px] ${aiResult.confidence > 0.8 ? 'bg-[#4CAF50]' : 'bg-[#FFA500]'}`}>
               <Check size={12} strokeWidth={4} color="white" />
               <span className="text-[11px] font-bold text-white">{Math.round(aiResult.confidence * 100)}% Match</span>
            </div>
          </motion.div>
          
          <div className="mt-[20px] text-center">
             <h2 className="text-[26px] font-extrabold text-[#1A1A1A]">{aiResult.dish_name_english}</h2>
             <h3 className="mt-[4px] text-[16px] font-medium text-[#8E8E93]">{aiResult.dish_name_hindi}</h3>
          </div>
        </div>

        {/* Question Area */}
        <div className="bg-white p-[20px]">
          <p className="mb-[12px] text-center text-[14px] font-medium text-[#8E8E93]">Is this correct?</p>
          <div className="flex gap-[12px]">
             <button 
               onClick={handleYes} 
               className="flex flex-[1.5] items-center justify-center rounded-full bg-[#1A1A1A] p-[14px] text-[15px] font-semibold text-white active:scale-95 transition-transform"
             >
               Yes, that's right ✓
             </button>
             <button 
               onClick={() => alert("Change dish modal placeholder")} 
               className="flex flex-[1] items-center justify-center rounded-full border-[1.5px] border-[#1A1A1A] bg-white p-[14px] text-[15px] font-semibold text-[#1A1A1A] active:scale-95 transition-transform"
             >
               Change
             </button>
          </div>
        </div>

        {/* Portion Selector + Details (Hidden until "Yes" is tapped, or always visible based on user preference, but let's animate it in) */}
        <AnimatePresence>
          {showPortions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <div ref={portionRef}></div>

              {/* Portion Selector */}
              <div className="px-[20px] pt-[24px] pb-[16px]">
                <h3 className="text-[20px] font-bold text-[#1A1A1A]">How much did you eat?</h3>
                <p className="mt-[2px] text-[13px] text-[#8E8E93]">Select your portion size</p>
              </div>

              <div className="grid grid-cols-2 gap-[12px] px-[20px]">
                {PORTION_OPTIONS.map((p, idx) => {
                  const isSelected = selectedPortion.id === p.id;
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (p.id === 'custom') {
                          alert("Custom portion input placeholder");
                        } else {
                          setSelectedPortion(p);
                        }
                      }}
                      className={`relative flex min-h-[100px] cursor-pointer flex-col items-center justify-between rounded-[20px] border-[2px] p-[20px] transition-all bg-white ${
                        isSelected ? 'border-[#1A1A1A] bg-[#FAFAFA] shadow-[0_4px_12px_rgba(0,0,0,0.08)]' : 'border-[#F0F0F0]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute right-[8px] top-[8px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#1A1A1A]">
                          <Check size={14} color="white" strokeWidth={4} />
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-[4px] mt-1">
                        <span className="text-[36px]">{p.emoji}</span>
                        <span className="text-[14px] font-semibold text-[#1A1A1A]">{p.label}</span>
                      </div>
                      
                      {p.id !== 'custom' && (
                        <div className="flex flex-col items-center mt-3">
                           <span className="text-[18px] font-extrabold text-[#FF6B35] leading-none">{p.calories} cal</span>
                           <span className="mt-[2px] text-[11px] text-[#8E8E93]">{p.grams}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Extras Toggle */}
              <div className="px-[20px] pt-[24px]">
                <h3 className="text-[18px] font-bold text-[#1A1A1A]">Add Extras?</h3>
                <p className="mt-[2px] text-[13px] text-[#8E8E93]">Did you add any of these?</p>
                
                <div className="no-scrollbar mt-[12px] flex gap-[8px] overflow-x-auto pb-[4px]">
                  {EXTRAS_OPTIONS.map((ext) => {
                    const isSelected = !!selectedExtras.find(e => e.id === ext.id);
                    return (
                      <button
                        key={ext.id}
                        onClick={() => toggleExtra(ext)}
                        className={`shrink-0 rounded-full border-[1.5px] px-[16px] py-[10px] text-[13px] font-medium whitespace-nowrap transition-all ${
                          isSelected ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-[#F0F0F0] bg-white text-[#1A1A1A]'
                        }`}
                      >
                        {ext.emoji} {ext.label} <span className="opacity-70">(+{ext.calories})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ingredients */}
              <div className="px-[20px] pt-[24px]">
                <div className="flex items-center justify-between">
                   <h3 className="text-[18px] font-bold text-[#1A1A1A]">Detected Ingredients</h3>
                   <button className="text-[13px] font-semibold text-[#1A1A1A]">+ Add more</button>
                </div>
                
                <div className="mt-[12px] flex flex-col gap-[8px]">
                  {aiResult.detected_ingredients.map((ing: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-[16px] bg-[#FAFAFA] p-[14px]">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-semibold text-[#1A1A1A]">{ing.name}</span>
                        <span className="mt-[2px] text-[12px] text-[#8E8E93]">{ing.portion}</span>
                      </div>
                      <div className="flex items-center gap-[12px]">
                        <span className="text-[14px] font-bold text-[#1A1A1A]">{ing.calories} cal</span>
                        <button className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 active:scale-95 transition-all">
                           <Pencil size={14} color="#1A1A1A" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Big Summary Card */}
              <div className="m-[24px_20px] rounded-[28px] bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-[28px_24px] text-white shadow-[0_12px_32px_rgba(0,0,0,0.15)]">
                 <div className="flex flex-col items-start">
                   <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8E8E93]">TOTAL CALORIES</span>
                   <div className="flex items-baseline gap-[4px] mt-[4px]">
                     <span className="text-[56px] font-extrabold leading-none">{totalCalories}</span>
                   </div>
                   <span className="mt-[2px] text-[14px] font-medium text-[#8E8E93]">calories</span>
                 </div>

                 <div className="my-[20px] h-[1px] w-full bg-white/10" />

                 <div className="grid grid-cols-3 gap-[16px]">
                   <div className="flex flex-col items-center gap-[8px]">
                     <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#FF6B6B]">
                       <span className="text-[16px] font-extrabold text-white">P</span>
                     </div>
                     <span className="text-[18px] font-bold text-white">{totalP}g</span>
                     <span className="text-[11px] font-medium text-[#8E8E93]">Protein</span>
                   </div>
                   
                   <div className="flex flex-col items-center gap-[8px]">
                     <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#FFA500]">
                       <span className="text-[16px] font-extrabold text-white">C</span>
                     </div>
                     <span className="text-[18px] font-bold text-white">{totalC}g</span>
                     <span className="text-[11px] font-medium text-[#8E8E93]">Carbs</span>
                   </div>
                   
                   <div className="flex flex-col items-center gap-[8px]">
                     <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#4A90E2]">
                       <span className="text-[16px] font-extrabold text-white">F</span>
                     </div>
                     <span className="text-[18px] font-bold text-white">{totalF}g</span>
                     <span className="text-[11px] font-medium text-[#8E8E93]">Fats</span>
                   </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 flex gap-[12px] border-t border-[#F0F0F0] bg-white p-[16px_20px] safe-area-bottom">
        <button 
          onClick={() => alert("Fix results placeholder")}
          className="flex flex-[1] items-center justify-center gap-[6px] rounded-full border-[1.5px] border-[#F0F0F0] bg-white p-[16px] text-[15px] font-semibold text-[#1A1A1A] active:scale-95 transition-all"
        >
          <Sparkles size={16} /> Fix Results
        </button>
        <button 
          onClick={handleAddLog}
          className="flex flex-[1.5] items-center justify-center gap-[6px] rounded-full bg-[#1A1A1A] p-[16px] text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-95 transition-all"
        >
          <Check size={16} strokeWidth={3} /> Add to Log
        </button>
      </div>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-[8px]"
          >
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 12, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#4CAF50]">
                 <Check size={56} color="white" strokeWidth={3} />
              </div>
              <h2 className="mt-[16px] text-[24px] font-extrabold text-white">Added to Log!</h2>
              <p className="mt-[4px] text-[16px] font-bold text-[#4CAF50]">+{totalCalories} calories logged</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
