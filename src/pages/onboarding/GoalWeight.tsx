import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingLayout } from '@/components/OnboardingLayout';
import { HorizontalPicker } from '@/components/HorizontalPicker';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/lib/profileService';
import toast from 'react-hot-toast';

export function GoalWeight() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const currentWeightKg = profile?.current_weight_kg || 70;
  
  const [goalWeightKg, setGoalWeightKg] = useState<number>(currentWeightKg);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.goal_weight_kg) {
      setGoalWeightKg(profile.goal_weight_kg);
    } else if (profile?.current_weight_kg) {
      setGoalWeightKg(profile.current_weight_kg);
    }
  }, [profile]);

  const diff = goalWeightKg - currentWeightKg;
  let subtitle = "Let's maintain your healthy weight";
  let diffDisplay = "Maintain weight";
  let diffColor = "text-text-secondary";

  if (diff < -0.1) {
    subtitle = "Let's create your weight loss journey";
    diffDisplay = `Lose ${Math.abs(diff).toFixed(1)} kg`;
    diffColor = "text-protein-red";
  } else if (diff > 0.1) {
    subtitle = "Let's build muscle and gain healthy weight";
    diffDisplay = `Gain ${diff.toFixed(1)} kg`;
    diffColor = "text-success-green";
  }

  const handleContinue = async () => {
    if (!user) return;
    setLoading(true);
    const result = await profileService.updateProfile(user.id, { 
      goal_weight_kg: goalWeightKg,
      onboarding_step: 6 
    });
    setLoading(false);

    if (result.success) {
      navigate('/onboarding/activity');
    } else {
      toast.error('Failed to save. Try again.');
    }
  };

  return (
    <OnboardingLayout
      progress={5}
      title="What's your goal weight?"
      subtitle={subtitle}
      onContinue={handleContinue}
      isLoading={loading}
    >
      <div className="mb-[32px] text-center">
        <span className="text-[14px] font-medium text-text-secondary">
          Current: {currentWeightKg} kg
        </span>
      </div>

      <div className={`flex w-full justify-center ${loading ? 'pointer-events-none opacity-80' : ''}`}>
        <HorizontalPicker 
          min={30} 
          max={200} 
          step={0.5}
          value={goalWeightKg} 
          onChange={setGoalWeightKg} 
          unit="kg" 
        />
      </div>

      <div className={`mt-8 text-[16px] font-bold ${diffColor}`}>
        {diffDisplay}
      </div>
    </OnboardingLayout>
  );
}
