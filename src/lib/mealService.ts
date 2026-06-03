import { supabase } from '@/lib/supabase';
import { Meal } from '@/types/database';

export const mealService = {
  async getTodayMeals(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .eq('meal_date', today)
      .order('logged_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getMealById(userId: string, mealId: string) {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('id', mealId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getAllMeals(userId: string) {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async addMeal(userId: string, meal: Partial<Meal>) {
    const { data, error } = await supabase
      .from('meals')
      .insert([{ ...meal, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;

    // Update streak - calling DB function
    // Assuming the function update_user_streak exists on Supabase as per instructions
    const { error: rpcError } = await supabase.rpc('update_user_streak', {
      p_user_id: userId
    });
    
    if (rpcError) {
      console.warn("Failed to update user streak via RPC:", rpcError);
    }

    return data;
  },

  async updateMeal(userId: string, mealId: string, updates: Partial<Meal>) {
    const { data, error } = await supabase
      .from('meals')
      .update(updates)
      .eq('id', mealId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMeal(userId: string, mealId: string) {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async duplicateMeal(userId: string, meal: any) {
    const newMeal = {
      ...meal,
      id: undefined,
      user_id: undefined,
      created_at: undefined,
      logged_at: new Date().toISOString(),
      meal_date: new Date().toISOString().split('T')[0],
    };

    return this.addMeal(userId, newMeal);
  }
};
