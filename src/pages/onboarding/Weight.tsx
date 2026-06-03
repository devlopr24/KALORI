import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { HorizontalPicker } from '@/components/HorizontalPicker';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/lib/profileService';
import toast from 'react-hot-toast';

export function Weight() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [loading, setLoading] = useState(false);
  
  const [weightKg, setWeightKg] = useState<number>(70);
  const [weightLbs, setWeightLbs] = useState<number>(Math.round(70 * 2.20462));

  useEffect(() => {
    if (profile?.current_weight_kg) {
      setWeightKg(profile.current_weight_kg);
      setWeightLbs(Math.round(profile.current_weight_kg * 2.20462));
    }
  }, [profile]);

  const handleKgChange = (val: number) => {
    setWeightKg(val);
    setWeightLbs(Math.round(val * 2.20462));
  };

  const handleLbsChange = (val: number) => {
    setWeightLbs(val);
    setWeightKg(Math.round(val / 2.20462 * 2) / 2);
  };

  const handleContinue = async () => {
    if (!user) return;
    setLoading(true);
    const result = await profileService.updateProfile(user.id, { 
      current_weight_kg: weightKg,
      onboarding_step: 5 
    });
    setLoading(false);

    if (result.success) {
      navigate('/onboarding/goal-weight');
    } else {
      toast.error('Failed to save. Try again.');
    }
  };

  return (
    <OnboardingLayout
      progress={4}
      title="What's your current weight?"
      subtitle="Be honest - this helps us create your perfect plan"
      onContinue={handleContinue}
      isLoading={loading}
    >
      <div className={`mb-[32px] flex rounded-full bg-brand-tertiary p-1 ${loading ? 'pointer-events-none opacity-80' : ''}`}>
        <div
          onClick={() => setUnit('kg')}
          className={`cursor-pointer rounded-full px-6 py-2 text-[15px] font-semibold transition-colors ${
            unit === 'kg' ? 'bg-button-black text-brand-primary' : 'text-text-secondary'
          }`}
        >
          kg
        </div>
        <div
          onClick={() => setUnit('lbs')}
          className={`cursor-pointer rounded-full px-6 py-2 text-[15px] font-semibold transition-colors ${
            unit === 'lbs' ? 'bg-button-black text-brand-primary' : 'text-text-secondary'
          }`}
        >
          lbs
        </div>
      </div>

      <div className={`flex w-full justify-center ${loading ? 'pointer-events-none opacity-80' : ''}`}>
        {unit === 'kg' ? (
          <HorizontalPicker 
            min={30} 
            max={200} 
            step={0.5}
            value={weightKg} 
            onChange={handleKgChange} 
            unit="kg" 
          />
        ) : (
          <HorizontalPicker 
            min={66}
            max={440}
            value={weightLbs} 
            onChange={handleLbsChange} 
            unit="lbs"
          />
        )}
      </div>
    </OnboardingLayout>
  );
}
