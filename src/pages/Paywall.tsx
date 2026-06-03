import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { settingsService } from '@/lib/settingsService';

export function Paywall() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source');
  
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { user, refreshProfile } = useAuth();

  const calculateExpiry = (plan: string) => {
    const date = new Date();
    if (plan === 'yearly') date.setFullYear(date.getFullYear() + 1);
    else if (plan === 'monthly') date.setMonth(date.getMonth() + 1);
    else if (plan === 'lifetime') date.setFullYear(date.getFullYear() + 100);
    return date.toISOString();
  };

  const handleSubscribe = async () => {
    if (!user) return;
    setIsProcessing(true);
    
    // Simulate payment
    setTimeout(async () => {
      try {
        await settingsService.updateProfile(user.id, {
           is_premium: true,
           premium_plan: selectedPlan as 'yearly' | 'monthly' | 'lifetime',
           premium_expires_at: calculateExpiry(selectedPlan)
        });
        await refreshProfile();
        setIsProcessing(false);
        navigate(`/paywall/success${source ? `?source=${source}` : ''}`);
      } catch (e) {
        setIsProcessing(false);
      }
    }, 3000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleClose = () => {
    // Show subtle toast or just go back
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const getPlanPriceText = () => {
    if (selectedPlan === 'yearly') return '₹999/year';
    if (selectedPlan === 'monthly') return '₹249/month';
    return '₹2,499';
  };

  const getPlanNameText = () => {
    if (selectedPlan === 'yearly') return 'Yearly Premium';
    if (selectedPlan === 'monthly') return 'Monthly Premium';
    return 'Lifetime Premium';
  };

  const getButtonText = () => {
    if (selectedPlan === 'yearly') return 'Start 7-Day Free Trial';
    if (selectedPlan === 'monthly') return 'Subscribe Now';
    return 'Get Lifetime Access';
  };

  const FeatureRow = ({ icon, bg, title, subtitle }: { icon: React.ReactNode, bg: string, title: string, subtitle: string }) => (
    <div className="flex flex-row items-center gap-[14px] border-b border-[#F5F5F7] pb-4 last:border-0 last:pb-0">
      <div className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[12px] ${bg} shadow-sm`}>
        {icon}
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-[15px] font-bold text-[#1A1A1A]">{title}</span>
        <span className="mt-[2px] text-[13px] text-[#8E8E93] leading-snug">{subtitle}</span>
      </div>
      <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-gradient-to-br from-[#4CAF50] to-[#66BB6A] shadow-[0_2px_6px_rgba(76,175,80,0.3)]">
        <span className="text-[16px] text-white">✓</span>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#FFF8F3] via-[#FFFFFF] to-[#F8F8FA] pb-[160px] pt-safe">
      
      {/* 1. HERO SECTION WITH CLOSE */}
      <div className="relative p-4">
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 outline-none transition-transform active:scale-95"
        >
          <span className="text-[20px] leading-none text-[#1A1A1A]">×</span>
        </button>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        {/* 2. PREMIUM ICON / HERO */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="px-5 pb-5 pt-[40px] text-center"
        >
          <div className="mx-auto flex h-[80px] w-[80px] items-center justify-center rounded-[24px] bg-gradient-to-br from-[#FFD700] to-[#FFA500] shadow-[0_8px_24px_rgba(255,165,0,0.3)] motion-safe:animate-[float_3s_ease-in-out_infinite]">
            <span className="text-[40px]">👑</span>
          </div>
        </motion.div>

        {/* 3. HEADLINE + SUBHEADLINE */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="px-4 py-5 text-center"
        >
          <h1 className="mt-4 text-[32px] font-black leading-[1.2] tracking-tight text-[#1A1A1A]">
            Unlock KALORI <span className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">Premium</span>
          </h1>
          <p className="mx-auto mt-3 max-w-[320px] text-[16px] font-medium text-[#8E8E93]">
            Track every Indian dish with AI-powered precision
          </p>
        </motion.div>

        {/* 4. SOCIAL PROOF BANNER */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mx-4 my-4 flex items-center justify-around rounded-[18px] border border-[#F0F0F0] bg-white px-5 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        >
          <div className="flex flex-col items-center gap-[2px]">
            <span className="text-[16px] font-extrabold text-[#1A1A1A]">👥 50K+</span>
            <span className="text-[10px] font-semibold tracking-wider text-[#8E8E93] uppercase">Active Users</span>
          </div>
          <div className="h-[30px] w-px bg-[#F0F0F0]" />
          <div className="flex flex-col items-center gap-[2px]">
            <span className="text-[16px] font-extrabold text-[#1A1A1A]">⭐ 4.9</span>
            <span className="text-[10px] font-semibold tracking-wider text-[#8E8E93] uppercase">App Rating</span>
          </div>
          <div className="h-[30px] w-px bg-[#F0F0F0]" />
          <div className="flex flex-col items-center gap-[2px]">
            <span className="text-[16px] font-extrabold text-[#1A1A1A]">🍛 700+</span>
            <span className="text-[10px] font-semibold tracking-wider text-[#8E8E93] uppercase">Indian Dishes</span>
          </div>
        </motion.div>

        {/* 5. FEATURES COMPARISON */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mx-4 mb-4 mt-6"
        >
          <h2 className="mb-4 text-center text-[20px] font-extrabold text-[#1A1A1A]">What You'll Get</h2>
          <div className="flex flex-col gap-4 rounded-[22px] border border-[#F0F0F0] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <FeatureRow 
              icon={<span className="text-[24px]">📸</span>} bg="bg-gradient-to-br from-[#FF6B35] to-[#FF8E53]"
              title="Unlimited Food Scans" subtitle="No daily limit - scan as much as you want"
            />
            <FeatureRow 
              icon={<span className="text-[24px]">🍛</span>} bg="bg-gradient-to-br from-[#4CAF50] to-[#66BB6A]"
              title="Indian Food Intelligence" subtitle="700+ Indian dishes accurately tracked"
            />
            <FeatureRow 
              icon={<span className="text-[24px]">📊</span>} bg="bg-gradient-to-br from-[#4A90E2] to-[#6BA8E5]"
              title="Complete Macro Tracking" subtitle="Protein, Carbs, Fats with ingredient breakdown"
            />
            <FeatureRow 
              icon={<span className="text-[24px]">📈</span>} bg="bg-gradient-to-br from-[#9C27B0] to-[#BA68C8]"
              title="Advanced Progress Reports" subtitle="Weekly insights & personalized recommendations"
            />
            <FeatureRow 
              icon={<span className="text-[24px]">🎯</span>} bg="bg-gradient-to-br from-[#FF6B6B] to-[#FF8787]"
              title="Custom Goals & Plans" subtitle="Personalized meal plans for your goals"
            />
            <FeatureRow 
              icon={<span className="text-[24px]">✨</span>} bg="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A]"
              title="Ad-Free Experience" subtitle="Premium experience without distractions"
            />
          </div>
        </motion.div>

        {/* 6. PRICING CARDS */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mx-4 mb-4 mt-8"
        >
          <h2 className="mb-1 text-center text-[22px] font-extrabold text-[#1A1A1A]">Choose Your Plan</h2>
          <p className="mb-4 text-center text-[13px] font-medium text-[#8E8E93]">Cancel anytime, no questions asked</p>
          
          <div className="flex flex-col gap-3">
            
            {/* YEARLY CARD */}
            <div 
              onClick={() => setSelectedPlan('yearly')}
              className={`relative cursor-pointer rounded-[22px] p-[24px_20px] transition-all duration-300 ${
                selectedPlan === 'yearly' 
                  ? 'scale-[1.02] border-[2.5px] border-[#FFD700] bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] shadow-[0_8px_24px_rgba(0,0,0,0.15)] text-white' 
                  : 'border-[2px] border-[#F0F0F0] bg-white text-[#1A1A1A] hover:bg-gray-50'
              }`}
            >
              <div className="absolute -top-[12px] left-[20px] rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] px-3 py-1.5 text-[11px] font-extrabold tracking-[0.5px] text-[#1A1A1A] shadow-[0_4px_12px_rgba(255,165,0,0.4)]">
                ⭐ BEST VALUE - SAVE 75%
              </div>

              <div className="flex flex-row items-start justify-between">
                <div className="flex flex-1 flex-col">
                  <div>
                    <span className="text-[18px] font-bold">Yearly Premium</span>
                    <div className={`mt-0.5 text-[12px] ${selectedPlan === 'yearly' ? 'text-[#8E8E93]' : 'text-[#8E8E93]'}`}>Billed annually</div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-[36px] font-black leading-none">₹999</span>
                    <span className={`text-[14px] font-medium ${selectedPlan === 'yearly' ? 'text-[#8E8E93]' : 'text-[#8E8E93]'}`}>/year</span>
                  </div>
                  <div className="mt-1 text-[13px] font-bold text-[#4CAF50]">
                    Just ₹83/month
                  </div>
                </div>
                <div className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border-[3px] transition-colors ${
                  selectedPlan === 'yearly' ? 'border-[#FFD700] bg-[#FFD700] shadow-[0_0_0_6px_rgba(255,215,0,0.2)]' : 'border-[#C7C7CC] bg-white'
                }`}>
                  {selectedPlan === 'yearly' && <div className="h-[12px] w-[12px] rounded-full bg-[#1A1A1A]" />}
                </div>
              </div>

              {selectedPlan === 'yearly' && (
                <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3">
                  <span className="text-[14px]">🎁</span>
                  <span className="text-[12px] font-bold text-[#FFD700]">7-day free trial included</span>
                </div>
              )}
            </div>

            {/* MONTHLY CARD */}
            <div 
              onClick={() => setSelectedPlan('monthly')}
              className={`cursor-pointer rounded-[22px] p-[20px] transition-all duration-300 ${
                selectedPlan === 'monthly'
                  ? 'border-[2.5px] border-[#1A1A1A] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
                  : 'border-[2px] border-[#F0F0F0] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
              }`}
            >
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-1 flex-col">
                  <div>
                    <span className={`text-[16px] font-bold ${selectedPlan === 'monthly' ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]'}`}>Monthly Premium</span>
                    <div className="mt-0.5 text-[12px] text-[#8E8E93]">Billed monthly</div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`text-[28px] font-black leading-none ${selectedPlan === 'monthly' ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]'}`}>₹249</span>
                    <span className="text-[13px] font-medium text-[#8E8E93]">/month</span>
                  </div>
                </div>
                <div className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border-[2px] transition-colors ${
                  selectedPlan === 'monthly' ? 'border-[#1A1A1A] bg-[#1A1A1A]' : 'border-[#C7C7CC] bg-white'
                }`}>
                  {selectedPlan === 'monthly' && <div className="h-[12px] w-[12px] rounded-full bg-white" />}
                </div>
              </div>
            </div>

            {/* LIFETIME CARD */}
            <div 
              onClick={() => setSelectedPlan('lifetime')}
              className={`relative cursor-pointer rounded-[22px] p-[20px] transition-all duration-300 ${
                selectedPlan === 'lifetime'
                  ? 'border-[2.5px] border-[#1A1A1A] bg-gradient-to-br from-[#F8F8FA] to-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
                  : 'border-[2px] border-[#F0F0F0] bg-gradient-to-br from-[#F8F8FA] to-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
              }`}
            >
              <div className="absolute -top-[10px] right-[16px] rounded-full bg-[#FF6B6B] px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white">
                🔥 LIMITED OFFER
              </div>
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-1 flex-col">
                  <div>
                    <span className={`text-[16px] font-bold ${selectedPlan === 'lifetime' ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]'}`}>Lifetime Premium</span>
                    <div className="mt-0.5 text-[12px] text-[#8E8E93]">One-time payment</div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`text-[28px] font-black leading-none ${selectedPlan === 'lifetime' ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]'}`}>₹2,499</span>
                  </div>
                  <div className="mt-1 text-[13px] font-bold text-[#8E8E93]">Forever access</div>
                </div>
                <div className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border-[2px] transition-colors ${
                  selectedPlan === 'lifetime' ? 'border-[#1A1A1A] bg-[#1A1A1A]' : 'border-[#C7C7CC] bg-white'
                }`}>
                  {selectedPlan === 'lifetime' && <div className="h-[12px] w-[12px] rounded-full bg-white" />}
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* 7. PROMO CODE */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          onClick={() => setShowPromoModal(true)}
          className="mx-4 my-4 flex cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#C7C7CC] bg-[#FAFAFA] p-3 transition-colors active:bg-gray-100"
        >
          <span className="text-[16px]">🎫</span>
          <span className="text-[13px] font-bold text-[#1A1A1A]">Have a promo code?</span>
        </motion.div>

        {/* 8. TESTIMONIALS */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="my-6"
        >
          <h2 className="mb-3 text-center text-[18px] font-extrabold text-[#1A1A1A]">Loved by Indians</h2>
          <div className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 pt-1 no-scrollbar">
            
            <div className="flex min-w-[280px] shrink-0 snap-center flex-col gap-2.5 rounded-[18px] border border-[#F0F0F0] bg-white p-[18px] shadow-sm">
              <div className="text-[16px] text-[#FFD700]">⭐⭐⭐⭐⭐</div>
              <p className="text-[14px] font-medium italic leading-[1.5] text-[#1A1A1A]">"Finally an app that knows what dal makhani really has! Best app for tracking Indian food."</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFA500] text-[14px] font-bold text-white">P</div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#1A1A1A]">Priya S.</span>
                  <span className="text-[11px] font-medium text-[#8E8E93]">Mumbai</span>
                </div>
              </div>
            </div>

            <div className="flex min-w-[280px] shrink-0 snap-center flex-col gap-2.5 rounded-[18px] border border-[#F0F0F0] bg-white p-[18px] shadow-sm">
              <div className="text-[16px] text-[#FFD700]">⭐⭐⭐⭐⭐</div>
              <p className="text-[14px] font-medium italic leading-[1.5] text-[#1A1A1A]">"Lost 8 kg in 3 months using KALORI. The Indian food database is incredible!"</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#4A90E2] to-[#6BA8E5] text-[14px] font-bold text-white">R</div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#1A1A1A]">Rahul K.</span>
                  <span className="text-[11px] font-medium text-[#8E8E93]">Delhi</span>
                </div>
              </div>
            </div>

            <div className="flex min-w-[280px] shrink-0 snap-center flex-col gap-2.5 rounded-[18px] border border-[#F0F0F0] bg-white p-[18px] shadow-sm">
              <div className="text-[16px] text-[#FFD700]">⭐⭐⭐⭐⭐</div>
              <p className="text-[14px] font-medium italic leading-[1.5] text-[#1A1A1A]">"Worth every rupee. Premium is a game changer for my fitness journey."</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#9C27B0] to-[#BA68C8] text-[14px] font-bold text-white">A</div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#1A1A1A]">Anita M.</span>
                  <span className="text-[11px] font-medium text-[#8E8E93]">Bangalore</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* 9. FAQ SECTION */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mx-4 my-6"
        >
          <h2 className="mb-3 text-[18px] font-extrabold text-[#1A1A1A]">Common Questions</h2>
          <div className="flex flex-col gap-2">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes! Cancel your subscription anytime from settings. No questions asked, no hidden fees.' },
              { q: 'Is there a free trial?', a: 'Yes! Yearly plan includes a 7-day free trial. Try all premium features risk-free.' },
              { q: 'What happens to my data if I cancel?', a: 'Your data stays safe! Even if you downgrade, you keep access to your historical data.' },
              { q: 'Do you support Indian regional cuisines?', a: 'Absolutely! Our database has 700+ Indian dishes including regional specialties from across India.' }
            ].map((faq, i) => (
              <div key={i} className="rounded-[14px] border border-[#F0F0F0] bg-white p-4">
                <div 
                  className="flex cursor-pointer items-center justify-between"
                  onClick={() => toggleFaq(i)}
                >
                  <span className="text-[14px] font-bold text-[#1A1A1A]">{faq.q}</span>
                  <span className={`text-[12px] text-[#8E8E93] transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </div>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 border-t border-[#F5F5F7] pt-3 text-[13px] leading-[1.5] text-[#8E8E93]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 10. TRUST BADGES */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mx-4 my-5 grid grid-cols-3 gap-2.5 px-2"
        >
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-[14px] bg-[#FAFAFA] p-[14px_10px] text-center">
            <span className="text-[24px]">🔒</span>
            <span className="mt-0.5 text-[12px] font-bold text-[#1A1A1A]">Secure</span>
            <span className="text-[10px] font-medium text-[#8E8E93]">256-bit encryption</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-[14px] bg-[#FAFAFA] p-[14px_10px] text-center">
            <span className="text-[24px]">💳</span>
            <span className="mt-0.5 text-[12px] font-bold text-[#1A1A1A]">Easy Payment</span>
            <span className="text-[10px] font-medium text-[#8E8E93]">UPI / Cards / Wallets</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-[14px] bg-[#FAFAFA] p-[14px_10px] text-center">
            <span className="text-[24px]">✅</span>
            <span className="mt-0.5 text-[12px] font-bold text-[#1A1A1A]">Cancel Anytime</span>
            <span className="text-[10px] font-medium text-[#8E8E93]">No hidden fees</span>
          </div>
        </motion.div>

        {/* 12. FOOTER LINKS */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mb-8 flex flex-row items-center justify-center gap-4 p-4"
        >
          <span className="cursor-pointer text-[12px] font-semibold text-[#8E8E93] hover:text-[#1A1A1A]">Terms</span>
          <span className="cursor-pointer text-[12px] font-semibold text-[#8E8E93] hover:text-[#1A1A1A]">Privacy</span>
          <span className="cursor-pointer text-[12px] font-semibold text-[#8E8E93] hover:text-[#1A1A1A]">Refund Policy</span>
        </motion.div>
      </motion.div>

      {/* 11. FIXED BOTTOM CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-[430px] border-t border-[#F0F0F0] bg-white pb-safe pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        <div className="px-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wide text-[#8E8E93] uppercase">Selected Plan:</span>
              <span className="text-[14px] font-bold text-[#1A1A1A]">{getPlanNameText()}</span>
            </div>
            <span className="text-[16px] font-black text-[#1A1A1A]">{getPlanPriceText()}</span>
          </div>
          <button 
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-[18px] text-[16px] font-extrabold text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] outline-none transition-all duration-200 active:scale-[0.98] disabled:opacity-80 disabled:active:scale-100"
          >
            {selectedPlan === 'yearly' && <span className="text-[18px]">✨</span>}
            {getButtonText()}
            <span>→</span>
          </button>
          
          <div className="mt-3 flex items-center justify-center gap-3 pb-3">
            <span className="flex items-center gap-1 text-[11px] font-medium text-[#8E8E93]"><span className="text-[10px]">🔒</span> Secure</span>
            <span className="text-[10px] text-[#C7C7CC]">•</span>
            <span className="text-[11px] font-medium text-[#1A1A1A]">Cancel anytime</span>
            <span className="text-[10px] text-[#C7C7CC]">•</span>
            <span className="cursor-pointer text-[11px] font-bold text-[#4A90E2] underline decoration-[#4A90E2]/30 underline-offset-2">Restore purchase</span>
          </div>
        </div>
      </div>

      {/* PAYMENT PROCESSING OVERLAY */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 px-4 backdrop-blur-sm"
          >
            <div className="mb-6 h-[48px] w-[48px] animate-spin rounded-full border-[4px] border-white/20 border-t-white" />
            <motion.h3 
              animate={{ opacity: [0.5, 1, 0.5] }} 
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="text-center text-[18px] font-bold text-white"
            >
              Processing your payment...
            </motion.h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROMO CODE MODAL */}
      <AnimatePresence>
        {showPromoModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center px-0 pb-0">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPromoModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-[430px] rounded-t-[24px] bg-white p-6 pb-safe shadow-2xl"
            >
              <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-[#E5E5EA]" />
              <h3 className="text-center text-[20px] font-black text-[#1A1A1A]">Enter Promo Code</h3>
              <p className="mt-1 text-center text-[14px] font-medium text-[#8E8E93]">Save more on your subscription</p>
              
              <div className="mt-6">
                <input 
                  type="text" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="w-full rounded-[14px] border-[2px] border-[#F0F0F0] bg-[#FAFAFA] p-4 text-center text-[16px] font-semibold uppercase tracking-widest text-[#1A1A1A] outline-none placeholder:text-[#C7C7CC] focus:border-[#1A1A1A] focus:bg-white transition-colors"
                />
              </div>
              
              <button 
                onClick={() => {
                  // Fake promo logic
                  alert("Invalid promo code");
                  setPromoCode('');
                }}
                className="mt-4 w-full rounded-[14px] bg-[#1A1A1A] p-4 text-[16px] font-bold text-white outline-none active:scale-[0.98] transition-transform"
              >
                Apply Code
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}} />
    </div>
  );
}
