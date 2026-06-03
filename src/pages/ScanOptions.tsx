import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { premiumGateService } from '@/lib/premiumGateService';

export function ScanOptions() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsOpen(true));
  }, []);

  useEffect(() => {
    const loadRemaining = async () => {
      if (!user) return;
      try {
        setChecking(true);
        // Safety timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const isPrem = premiumGateService.isPremium(profile);
        if (isPrem) {
          clearTimeout(timeoutId);
          setRemaining(null); 
          return;
        }

        const r = await premiumGateService.getRemainingFreeScans(user.id, 3);
        clearTimeout(timeoutId);
        if (!controller.signal.aborted) {
          setRemaining(r);
        }
      } catch (e) {
        setRemaining(3); // fail-open
      } finally {
        setChecking(false);
      }
    };
    loadRemaining();
  }, [user, profile]);

  const closeAndNavigate = (path: string) => {
    setIsOpen(false);
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  const closeSheet = () => {
    setIsOpen(false);
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  const handleScanClick = () => {
    if (checking) return; // wait till loaded

    if (remaining !== null && remaining <= 0) {
      closeAndNavigate('/paywall?source=scan_limit');
    } else {
      closeAndNavigate('/scan');
    }
  };

  const options = [
    {
      id: 'scan',
      title: 'Scan Food with AI',
      desc: remaining === null ? 'Unlimited scans' : `Free scans remaining: ${remaining}/3`,
      icon: '📸',
      iconBg: '#FF6B35',
      cardBg: '#FFF8F3',
      border: '#FFE5DB',
      isAiCamera: true
    },
    {
      id: 'voice',
      title: 'Voice Note',
      desc: "Say 'two rotis and dal' - AI logs it",
      icon: '🎤',
      iconBg: '#4A90E2',
      cardBg: '#F0F8FF',
      border: '#E5F1FF',
      path: '#',
    },
    {
      id: 'search',
      title: 'Search Food',
      desc: 'Find from 700+ Indian dishes',
      icon: '🔍',
      iconBg: '#4CAF50',
      cardBg: '#F0FFF4',
      border: '#E5FFE5',
      path: '#',
    },
    {
      id: 'history',
      title: 'From History',
      desc: 'Re-add a meal from this week',
      icon: '📋',
      iconBg: '#FFA500',
      cardBg: '#FFF8F0',
      border: '#FFE8CC',
      path: '/history',
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-[4px]"
            onClick={closeSheet}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-51 mx-auto w-full max-w-[430px] rounded-t-[28px] bg-white px-[20px] pb-[32px] pt-[24px]"
          >
            <div className="mx-auto mb-[20px] h-[5px] w-[40px] rounded-[3px] bg-[#C7C7CC]" />

            <div className="mb-[24px]">
              <h2 className="text-[22px] font-extrabold text-[#1A1A1A]">Log Your Meal</h2>
              <p className="mt-[4px] text-[14px] font-medium text-[#8E8E93]">How would you like to track this meal?</p>
            </div>

            <div className="flex flex-col gap-[12px]">
              {options.map((opt) => (
                <motion.div
                  key={opt.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (opt.isAiCamera) {
                      handleScanClick();
                    } else if (opt.path === '#') {
                      alert('Coming Soon!');
                    } else if (opt.path) {
                      closeAndNavigate(opt.path);
                    }
                  }}
                  className={`flex cursor-pointer items-center gap-[14px] rounded-[20px] p-[18px] ${opt.isAiCamera && checking ? 'opacity-70' : ''}`}
                  style={{ backgroundColor: opt.cardBg, border: `1px solid ${opt.border}` }}
                >
                  <div
                    className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[16px] text-[28px]"
                    style={{ backgroundColor: opt.iconBg }}
                  >
                    {opt.icon}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <span className="text-[16px] font-bold text-[#1A1A1A]">
                      {opt.title} {opt.isAiCamera && checking && <span className="ml-1 text-[11px] font-normal opacity-50">(Checking...)</span>}
                    </span>
                    <span className={`mt-[2px] text-[13px] font-medium ${opt.isAiCamera && remaining !== null && remaining <= 0 ? 'text-[#FF6B6B] font-bold' : 'text-[#8E8E93]'}`}>
                      {opt.desc}
                    </span>
                  </div>

                  <ChevronRight color="#C7C7CC" size={20} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
