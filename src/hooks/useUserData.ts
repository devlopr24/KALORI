import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Meal {
  id: string;
  name: string;
  name_hindi?: string;
  time: string;
  date?: string;
  meal_type?: string;
  servings?: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  emoji: string;
  image_url: string | null;
  portion?: string;
  extras?: string[];
  confidence?: number;
  ingredients?: { name: string, portion: string, calories: number }[];
  category?: string;
}

export interface UserData {
  daily_calorie_goal: number;
  protein_goal_g: number;
  carbs_goal_g: number;
  fats_goal_g: number;
  current_streak: number;
  meals_today: Meal[];
}

const SAMPLE_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Masala Dosa',
    time: '8:30 AM',
    calories: 350,
    protein: 8,
    carbs: 58,
    fats: 15,
    emoji: '🥞',
    image_url: null
  },
  {
    id: '2',
    name: 'Chicken Biryani',
    time: '1:15 PM',
    calories: 720,
    protein: 35,
    carbs: 85,
    fats: 28,
    emoji: '🍛',
    image_url: null
  },
  {
    id: '3',
    name: 'Masala Chai',
    time: '4:30 PM',
    calories: 60,
    protein: 2,
    carbs: 8,
    fats: 2,
    emoji: '☕',
    image_url: null
  }
];

export function useUserData() {
  const { profile } = useAuth();
  const [data, setData] = useState<UserData | null>(null);

  useEffect(() => {
    let meals: Meal[] = [];
    const savedMeals = localStorage.getItem('meals_today');
    if (savedMeals && savedMeals !== '[]') {
      try {
        meals = JSON.parse(savedMeals);
      } catch (e) {
        meals = SAMPLE_MEALS;
      }
    } else if (savedMeals === '[]') {
      meals = [];
    } else {
      meals = SAMPLE_MEALS;
      localStorage.setItem('meals_today', JSON.stringify(meals));
    }

    const current_streak = Number(localStorage.getItem('current_streak')) || 15;

    setData({
      daily_calorie_goal: profile?.daily_calorie_goal || 2547,
      protein_goal_g: profile?.protein_goal_g || 191,
      carbs_goal_g: profile?.carbs_goal_g || 255,
      fats_goal_g: profile?.fats_goal_g || 85,
      current_streak,
      meals_today: meals
    });
  }, [profile]);

  return data;
}
