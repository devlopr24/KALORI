import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { HorizontalPicker } from '@/components/HorizontalPicker';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/lib/profileService';
import toast from 'react-hot-toast';

export function Height() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [unit, setUnit] = useState<'cm' | 'ft'>('cm');
  const [loading, setLoading] = useState(false);
  
  const [heightCm, setHeightCm] = useState<number>(170);
  const [heightInches, setHeightInches] = useState<number>(Math.round(170 / 2.54));

  useEffect(() => {
    if (profile?.height_cm) {
      setHeightCm(profile.height_cm);
      setHeightInches(Math.round(profile.height_cm / 2.54));
    }
  }, [profile]);

  const handleCmChange = (val: number) => {
    setHeightCm(val);
    setHeightInches(Math.round(val / 2.54));
  };

  const handleInchesChange = (val: number) => {
    setHeightInches(val);
    setHeightCm(Math.round(val * 2.54));
  };

  const handleContinue = async () => {
    if (!user) return;
    setLoading(true);
    const result = await profileService.updateProfile(user.id, { 
      height_cm: heightCm,
      onboarding_step: 4 
    });
    setLoading(false);

    if (result.success) {
      navigate('/onboarding/weight');
    } else {
      toast.error('Failed to save. Try again.');
    }
  };

  return (
    <OnboardingLayout
      progress={3}
      title="What's your height?"
      subtitle="We use this to calculate your BMI and daily calorie needs"
      onContinue={handleContinue}
      isLoading={loading}
    >
      <div className={`mb-[32px] flex rounded-full bg-brand-tertiary p-1 ${loading ? 'pointer-events-none opacity-80' : ''}`}>
        <div
          onClick={() => setUnit('cm')}
          className={`cursor-pointer rounded-full px-6 py-2 text-[15px] font-semibold transition-colors ${
            unit === 'cm' ? 'bg-button-black text-brand-primary' : 'text-text-secondary'
          }`}
        >
          cm
        </div>
        <div
          onClick={() => setUnit('ft')}
          className={`cursor-pointer rounded-full px-6 py-2 text-[15px] font-semibold transition-colors ${
            unit === 'ft' ? 'bg-button-black text-brand-primary' : 'text-text-secondary'
          }`}
        >
          ft/in
        </div>
      </div>

      <div className={`flex w-full justify-center ${loading ? 'pointer-events-none opacity-80' : ''}`}>
        {unit === 'cm' ? (
          <HorizontalPicker 
            min={100} 
            max={250} 
            value={heightCm} 
            onChange={handleCmChange} 
            unit="cm" 
          />
        ) : (
          <HorizontalPicker 
            min={36}
            max={96}
            value={heightInches} 
            onChange={handleInchesChange} 
            formatDisplay={(val) => {
              const f = Math.floor(val / 12);
              const i = val % 12;
              return `${f}'${i}"`;
            }}
          />
        )}
      </div>
    </OnboardingLayout>
  );
}
