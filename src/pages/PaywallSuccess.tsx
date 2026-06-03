import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function PaywallSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Basic confetti effect simulation setup or logic
    setShowConfetti(true);
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000); // Stop confetti after 5 seconds
    
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    const source = searchParams.get('source');
    if (source === 'scan_limit') {
      navigate('/scan', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FAFAFA] p-6 text-center">
      
      {/* Confetti container could go here if using a library, but CSS works too */}
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-6 flex h-[120px] w-[120px] items-center justify-center rounded-full bg-gradient-to-br from-[#4CAF50] to-[#66BB6A] shadow-[0_12px_32px_rgba(76,175,80,0.3)]"
      >
        <span className="text-[64px] text-white">✓</span>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-2 text-[28px] font-black text-[#1A1A1A]"
      >
        Welcome to Premium! 🎉
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8 text-[16px] text-[#8E8E93]"
      >
        You now have unlimited access to all features
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-[340px] overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-5 text-[#1A1A1A] shadow-lg"
      >
        <h3 className="mb-4 text-left text-[16px] font-extrabold">What's Unlocked</h3>
        <div className="flex flex-col gap-3 text-left">
          <div className="flex items-center gap-2 font-bold"><span className="text-[#1A1A1A]">✓</span> Unlimited Scans</div>
          <div className="flex items-center gap-2 font-bold"><span className="text-[#1A1A1A]">✓</span> Full Indian Food Database</div>
          <div className="flex items-center gap-2 font-bold"><span className="text-[#1A1A1A]">✓</span> Detailed Macro Tracking</div>
          <div className="flex items-center gap-2 font-bold"><span className="text-[#1A1A1A]">✓</span> Advanced Reports</div>
        </div>
      </motion.div>

      <motion.button 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        onClick={handleContinue}
        className="border-none outline-none mt-8 w-full max-w-[340px] rounded-[16px] bg-[#1A1A1A] py-[18px] text-[16px] font-bold text-white shadow-xl transition-transform active:scale-[0.98]"
      >
        Start Using Premium
      </motion.button>
    </div>
  );
}
