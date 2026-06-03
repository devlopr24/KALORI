import { supabase } from '@/lib/supabase';

const todayISO = () => new Date().toISOString().split('T')[0];

export const premiumGateService = {
  isPremium(profile: any) {
    if (!profile) return false;
    if (!profile.is_premium) return false;

    // if no expiry => treat as premium (e.g., lifetime)
    if (!profile.premium_expires_at) return true;

    return new Date(profile.premium_expires_at).getTime() > Date.now();
  },

  async getTodayScanCount(userId: string) {
    const date = todayISO();
    const { count, error } = await supabase
      .from('scan_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('scan_date', date)
      .eq('was_successful', true);

    if (error) throw error;
    return count || 0;
  },

  async getRemainingFreeScans(userId: string, dailyLimit = 3) {
    const used = await this.getTodayScanCount(userId);
    return Math.max(dailyLimit - used, 0);
  },

  async recordSuccessfulScan(userId: string, payload: {
    identified_name?: string | null;
    identified_food_id?: string | null;
    ai_provider?: string;
    ai_model?: string | null;
    ai_confidence?: number | null;
    ai_response?: any;
    image_url?: string | null;
    processing_time_ms?: number | null;
    api_cost_inr?: number | null;
  }) {
    const date = todayISO();

    const { error } = await supabase
      .from('scan_history')
      .insert([{
        user_id: userId,
        scan_date: date,
        ai_provider: payload.ai_provider || 'fallback',
        ai_model: payload.ai_model || null,
        ai_response: payload.ai_response || null,
        ai_confidence: payload.ai_confidence || null,
        identified_food_id: payload.identified_food_id || null,
        identified_name: payload.identified_name || null,
        was_successful: true,
        image_url: payload.image_url || null,
        processing_time_ms: payload.processing_time_ms || null,
        api_cost_inr: payload.api_cost_inr || null
      }]);

    if (error) throw error;
  }
};
