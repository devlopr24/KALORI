export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  gender: 'male' | 'female' | 'other' | null;
  age: number | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  goal_weight_kg: number | null;
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | null;
  daily_calorie_goal: number;
  protein_goal_g: number;
  carbs_goal_g: number;
  fats_goal_g: number;
  preferred_language: 'en' | 'hi';
  weight_unit: 'kg' | 'lbs';
  height_unit: 'cm' | 'ft';
  notifications_enabled: boolean;
  current_streak: number;
  longest_streak: number;
  last_scan_date: string | null;
  is_premium: boolean;
  premium_plan: 'monthly' | 'yearly' | 'lifetime' | null;
  premium_started_at: string | null;
  premium_expires_at: string | null;
  free_trial_used: boolean;
  onboarding_completed: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export interface Food {
  id: string;
  name_english: string;
  name_hindi: string | null;
  alternative_names: string[] | null;
  category: string;
  region: string | null;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_jain: boolean;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g: number;
  small_portion_g: number;
  medium_portion_g: number;
  large_portion_g: number;
  emoji: string | null;
  search_keywords: string[] | null;
  popularity_score: number;
}

export interface Meal {
  id: string;
  user_id: string;
  food_id: string | null;
  name: string;
  name_hindi: string | null;
  emoji: string | null;
  image_url: string | null;
  logged_at: string;
  meal_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'late_night' | null;
  portion_label: string | null;
  portion_grams: number | null;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  scan_method: string;
  ai_confidence: number | null;
  notes: string | null;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_date: string;
  notes: string | null;
  mood: 'great' | 'good' | 'okay' | 'bad' | null;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  calorie_goal: number;
  protein_goal: number;
  carbs_goal: number;
  fats_goal: number;
  meals_count: number;
  scans_count: number;
  goal_achieved: boolean;
}
