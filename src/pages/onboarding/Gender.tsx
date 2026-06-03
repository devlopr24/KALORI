import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/lib/profileService';
import toast from 'react-hot-toast';

export function Gender() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.gender) {
      setSelected(profile.gender as string);
    }
  }, [profile]);

  const handleContinue = async () => {
    if (!selected || !user) return;
    
    setLoading(true);
    const result = await profileService.updateProfile(user.id, { 
      gender: selected as any,
      onboarding_step: 2 
    });
    setLoading(false);
    
    if (result.success) {
      navigate('/onboarding/age');
    } else {
      toast.error('Failed to save. Try again.');
    }
  };
  
  const options = [
    { id: 'male', label: 'Male', emoji: '👨' },
    { id: 'female', label: 'Female', emoji: '👩' },
    { id: 'other', label: 'Other', emoji: '🧑' },
  ];

  return (
    <OnboardingLayout
      progress={1}
      title="What's your gender?"
      subtitle="This helps us calculate your calorie needs accurately"
      onContinue={handleContinue}
      isContinueDisabled={!selected}
      isLoading={loading}
    >
      <div className="flex w-full flex-col gap-[12px]">
        {options.map((opt) => (
          <div
            key={opt.id}
            onClick={() => !loading && setSelected(opt.id)}
            className={`flex cursor-pointer items-center justify-start gap-4 rounded-[20px] border-[2px] p-[24px] transition-colors ${
              selected === opt.id 
                ? 'border-button-black bg-brand-secondary' 
                : 'border-border-light bg-brand-primary hover:border-text-tertiary'
            } ${loading ? 'pointer-events-none opacity-80' : ''}`}
          >
            <span className="text-[48px] leading-none">{opt.emoji}</span>
            <span className="text-[20px] font-bold text-text-primary">{opt.label}</span>
          </div>
        ))}
      </div>
    </OnboardingLayout>
  );
}
