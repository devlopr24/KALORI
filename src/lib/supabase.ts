import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ymregukhqjhryhfkyxaq.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltcmVndWtocWpocnloZmt5eGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNTY3NDQsImV4cCI6MjA5NTkzMjc0NH0.MMLa31RjPqa9ohOUb-ZI1YObfPs1q2S4YggnF0Ubn-E";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});
