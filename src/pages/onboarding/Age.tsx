import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { HorizontalPicker } from '@/components/HorizontalPicker';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/lib/profileService';
import toast from 'react-hot-toast';

export function Age() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [age, setAge] = useState<number>(25);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.age) {
      setAge(profile.age);
    }
  }, [profile]);

  const handleContinue = async () => {
    if (!user) return;
    setLoading(true);
    const result = await profileService.updateProfile(user.id, { 
      age: age,
      onboarding_step: 3 
    });
    setLoading(false);

    if (result.success) {
      navigate('/onboarding/height');
    } else {
      toast.error('Failed to save. Try again.');
    }
  };

  return (
    <OnboardingLayout
      progress={2}
      title="How old are you?"
      subtitle="Your age affects your daily calorie needs"
      onContinue={handleContinue}
      isLoading={loading}
    >
      <div className={`mt-8 flex w-full justify-center ${loading ? 'pointer-events-none opacity-80' : ''}`}>
        <HorizontalPicker 
          min={13} 
          max={100} 
          value={age} 
          onChange={setAge} 
          unit="years old" 
        />
      </div>
    </OnboardingLayout>
  );
}
