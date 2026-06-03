import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/lib/profileService';
import toast from 'react-hot-toast';

export function Activity() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.activity_level) {
      setSelected(profile.activity_level);
    }
  }, [profile]);

  const handleContinue = async () => {
    if (!selected || !user) return;
    
    setLoading(true);
    const result = await profileService.updateProfile(user.id, { 
      activity_level: selected,
      onboarding_step: 7 
    });
    setLoading(false);

    if (result.success) {
      navigate('/onboarding/calculating');
    } else {
      toast.error('Failed to save. Try again.');
    }
  };
  
  const options = [
    { id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise. Desk job.', emoji: '🪑' },
    { id: 'lightly_active', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week', emoji: '🚶' },
    { id: 'moderately_active', label: 'Moderately Active', desc: 'Exercise 3-5 days/week', emoji: '🏃' },
    { id: 'very_active', label: 'Very Active', desc: 'Intense exercise 6-7 days/week', emoji: '🏋️' },
  ];

  return (
    <OnboardingLayout
      progress={6}
      title="How active are you?"
      subtitle="Your activity level affects your daily calorie burn"
      onContinue={handleContinue}
      isContinueDisabled={!selected}
      isLoading={loading}
    >
      <div className="flex w-full flex-col gap-[12px]">
        {options.map((opt) => (
          <div
            key={opt.id}
            onClick={() => !loading && setSelected(opt.id)}
            className={`flex cursor-pointer items-center justify-start gap-4 rounded-[20px] border-[2px] p-[20px] transition-colors ${
              selected === opt.id 
                ? 'border-button-black bg-brand-secondary' 
                : 'border-border-light bg-brand-primary hover:border-text-tertiary'
            } ${loading ? 'pointer-events-none opacity-80' : ''}`}
          >
            <span className="shrink-0 text-[40px] leading-none">{opt.emoji}</span>
            <div className="flex flex-col">
              <span className="text-[17px] font-bold text-text-primary">{opt.label}</span>
              <span className="mt-1 text-[14px] leading-snug text-text-secondary">{opt.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </OnboardingLayout>
  );
}
