import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';

export const settingsService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async exportUserData(userId: string) {
    const [profileRes, mealsRes, weightRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('meals').select('*').eq('user_id', userId).order('logged_at', { ascending: false }),
      supabase.from('weight_history').select('*').eq('user_id', userId).order('logged_date', { ascending: false })
    ]);

    if (profileRes.error) throw profileRes.error;
    if (mealsRes.error) throw mealsRes.error;
    if (weightRes.error) throw weightRes.error;

    return {
      exported_at: new Date().toISOString(),
      profile: profileRes.data,
      meals: mealsRes.data,
      weight_history: weightRes.data
    };
  },

  async resetUserData(userId: string) {
    // Keep it safe: delete meals + weight history.
    const deletions = await Promise.allSettled([
      supabase.from('meals').delete().eq('user_id', userId),
      supabase.from('weight_history').delete().eq('user_id', userId),
      supabase.from('scan_history').delete().eq('user_id', userId),
      supabase.from('achievements').delete().eq('user_id', userId),
      supabase.from('feedback').delete().eq('user_id', userId),
    ]);

    // Reset profile core fields
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: false,
        onboarding_step: 0,
        current_streak: 0,
        longest_streak: 0,
        last_scan_date: null
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    return deletions;
  }
};
