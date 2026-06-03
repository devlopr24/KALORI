import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';

export interface WeightEntry {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_date: string;
  notes?: string | null;
  mood?: 'great' | 'good' | 'okay' | 'bad' | null;
  created_at: string;
}

export const weightService = {
  async getWeightHistory(userId: string, days?: number) {
    // Fetch latest entries
    const fromDate = days
      ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null;

    let query = supabase
      .from('weight_history')
      .select('*')
      .eq('user_id', userId)
      .order('logged_date', { ascending: true });

    if (fromDate) query = query.gte('logged_date', fromDate);

    const { data, error } = await query;

    if (error) throw error;
    return data as WeightEntry[];
  },

  async upsertWeightEntry(userId: string, entry: {
    weight_kg: number;
    logged_date: string;
    notes?: string | null;
    mood?: 'great' | 'good' | 'okay' | 'bad' | null;
  }) {
    // weight_history has UNIQUE(user_id, logged_date)
    const { data, error } = await supabase
      .from('weight_history')
      .upsert([{
        user_id: userId,
        weight_kg: entry.weight_kg,
        logged_date: entry.logged_date,
        notes: entry.notes ?? null,
        mood: entry.mood ?? null
      }], { onConflict: 'user_id,logged_date' })
      .select()
      .single();

    if (error) throw error;

    // Update current_weight_kg in profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ current_weight_kg: entry.weight_kg })
      .eq('id', userId);

    if (profileError) throw profileError;

    return data as WeightEntry;
  },

  async deleteWeightEntry(userId: string, entryId: string) {
    const { error } = await supabase
      .from('weight_history')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
