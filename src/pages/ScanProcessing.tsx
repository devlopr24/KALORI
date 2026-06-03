import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function ScanProcessing() {
  const navigate = useNavigate();
  const [msgIdx, setMsgIdx] = useState(0);

  const rawImage = sessionStorage.getItem('captured_image') || '';
  
  const msgs = [
    "🔍 Analyzing your food...",
    "🧠 Identifying ingredients...",
    "🍽️ Detecting portion size...",
    "🔥 Calculating calories...",
    "✨ Almost done..."
  ];
  
  useEffect(() => {
    // Check if there is an image, else fallback gracefully
    if (!rawImage) {
      if(process.env.NODE_ENV !== 'development') {
         navigate('/scan');
         return;
      }
    }

    const msgInterval = setInterval(() => {
      setMsgIdx(prev => Math.min(prev + 1, msgs.length - 1));
    }, 1200);
    
    const finishTimeout = setTimeout(() => {
      const mockAIResult = {
        dish_name_english: 'Chicken Biryani',
        dish_name_hindi: 'चिकन बिरयानी',
        confidence: 0.92,
        detected_ingredients: [
          { name: 'Basmati Rice', portion: '150g', calories: 195 },
          { name: 'Chicken', portion: '80g', calories: 130 },
          { name: 'Onions', portion: '30g', calories: 12 },
          { name: 'Mixed Spices', portion: '10g', calories: 25 },
          { name: 'Ghee', portion: '15g', calories: 130 }
        ],
        cooking_method: 'curry',
        meal_context: 'restaurant',
        category: 'rice_dish',
        base_calories_per_100g: 165,
        protein_per_100g: 14,
        carbs_per_100g: 18,
        fats_per_100g: 6,
        emoji: '🍛'
      };

      try {
        sessionStorage.setItem('ai_result', JSON.stringify(mockAIResult));
      } catch(e) {}
      
      navigate('/scan/confirm', { replace: true });
    }, 5000);
    
    return () => { clearInterval(msgInterval); clearTimeout(finishTimeout); };
  }, [navigate, rawImage]);
  
  return (
    <div className="flex h-full flex-col bg-black overflow-hidden relative">
      {/* CSS Animation for Scanner Line */}
      <style>{`
        @keyframes scanMove {
          0% { top: 0%; opacity: 0.3; }
          50% { top: 100%; opacity: 1; }
          100% { top: 0%; opacity: 0.3; }
        }
        .animate-scan {
          animation: scanMove 1.5s ease-in-out infinite;
        }
      `}</style>
      
      <div className="absolute left-0 right-0 top-0 z-10 flex h-[60px] items-center p-[16px] safe-area-top">
        <button 
          onClick={() => navigate('/')}
          className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black/60 backdrop-blur-[10px] text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center -mt-[20px]">
        
        {/* Photo Display */}
        <div className="relative h-[300px] w-[300px] overflow-hidden rounded-[28px] border border-white/10">
          <img src={rawImage} alt="Scanning" className="h-full w-full object-cover" />
          
          {/* Scanner Line Overlay */}
          <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent shadow-[0_0_20px_#FF6B35] animate-scan" />
          
          {/* Corner Brackets */}
          <div className="absolute left-[10px] top-[10px] h-[24px] w-[24px] border-l-[3px] border-t-[3px] border-white/50" />
          <div className="absolute right-[10px] top-[10px] h-[24px] w-[24px] border-r-[3px] border-t-[3px] border-white/50" />
          <div className="absolute bottom-[10px] left-[10px] h-[24px] w-[24px] border-b-[3px] border-l-[3px] border-white/50" />
          <div className="absolute bottom-[10px] right-[10px] h-[24px] w-[24px] border-b-[3px] border-r-[3px] border-white/50" />
        </div>

        {/* 3 Dots Loader */}
        <div className="mt-[40px] flex gap-[8px]">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="h-[10px] w-[10px] rounded-full bg-white"
            />
          ))}
        </div>

        {/* Rotating Messages */}
        <div className="mt-[20px] h-[24px] text-[16px] font-medium text-white">
          <AnimatePresence mode="wait">
            <motion.span
              key={msgIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="block text-center"
            >
              {msgs[msgIdx]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-[60px] left-0 right-0 mx-auto w-[80%] max-w-[320px] safe-area-bottom">
        <div className="h-[4px] w-full overflow-hidden rounded-[2px] bg-white/15">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 5, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-white to-[#FF6B35]"
          />
        </div>
      </div>
    </div>
  );
}
