import { supabase } from './supabase';
import { Profile } from '../types/database';

export const profileService = {
  
  // Get current user's profile
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },
  
  // Update profile fields
  async updateProfile(
    userId: string, 
    updates: Partial<Profile>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },
  
  // Calculate and save calorie goals
  async calculateAndSaveGoals(
    userId: string,
    data: {
      gender: 'male' | 'female' | 'other' | null;
      age: number | null;
      height_cm: number | null;
      current_weight_kg: number | null;
      goal_weight_kg: number | null;
      activity_level: string | null;
    }
  ): Promise<{ success: boolean; goals?: any; error?: string }> {
    try {
      if (!data.gender || !data.age || !data.height_cm || !data.current_weight_kg || !data.goal_weight_kg || !data.activity_level) {
        throw new Error("Missing data for calculation");
      }
      
      // Calculate BMR using Mifflin-St Jeor
      let bmr: number;
      if (data.gender === 'male') {
        bmr = (10 * data.current_weight_kg) + 
              (6.25 * data.height_cm) - 
              (5 * data.age) + 5;
      } else {
        bmr = (10 * data.current_weight_kg) + 
              (6.25 * data.height_cm) - 
              (5 * data.age) - 161;
      }
      
      // Activity multipliers
      const multipliers: Record<string, number> = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725
      };
      
      const tdee = bmr * (multipliers[data.activity_level] || 1.55);
      
      // Adjust based on goal
      let dailyCalories: number;
      if (data.goal_weight_kg < data.current_weight_kg) {
        dailyCalories = Math.round(tdee - 500); // Lose weight
      } else if (data.goal_weight_kg > data.current_weight_kg) {
        dailyCalories = Math.round(tdee + 500); // Gain weight
      } else {
        dailyCalories = Math.round(tdee); // Maintain
      }
      
      // Ensure dailyCalories does not drop below safe minimums
      if (data.gender === 'female' && dailyCalories < 1200) dailyCalories = 1200;
      if (data.gender === 'male' && dailyCalories < 1500) dailyCalories = 1500;
      
      // Calculate macros (30P/40C/30F default)
      const proteinGoal = Math.round((dailyCalories * 0.30) / 4);
      const carbsGoal = Math.round((dailyCalories * 0.40) / 4);
      const fatsGoal = Math.round((dailyCalories * 0.30) / 9);
      
      const goals = {
        daily_calorie_goal: dailyCalories,
        protein_goal_g: proteinGoal,
        carbs_goal_g: carbsGoal,
        fats_goal_g: fatsGoal,
      };
      
      // Save everything to profile
      const updates = {
        ...goals,
        onboarding_completed: true,
        onboarding_step: 8,
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) throw error;
      
      return { success: true, goals };
    } catch (error: any) {
      console.error('Error saving goals:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },
  
  // Check if onboarding is complete
  async isOnboardingComplete(userId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();
      
      return data?.onboarding_completed || false;
    } catch (error) {
      return false;
    }
  }
};
