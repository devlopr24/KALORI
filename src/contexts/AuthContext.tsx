import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ data?: any, error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Get initial session
  useEffect(() => {
    let mounted = true;

    // Safety timeout
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn("[AuthContext] 5s Safety timeout triggered - forcing loading to false");
        setLoading(false);
      }
    }, 5000);

    const initAuth = async () => {
      try {
        console.log("[AuthContext] initAuth starting...");
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[AuthContext] initAuth session error:", error);
        }
        
        console.log("[AuthContext] Session retrieved:", !!session);
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }

        if (session?.user && mounted) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error("[AuthContext] initAuth catch error:", err);
      } finally {
        if (mounted) {
          console.log("[AuthContext] initAuth complete, clearing loading");
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    initAuth();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        console.log("[AuthContext] onAuthStateChange event:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("[AuthContext] Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("[AuthContext] Supabase profile fetch error:", error);
      }
      
      if (data) {
        console.log("[AuthContext] Profile fetched successfully");
        setProfile(data as Profile);
        localStorage.setItem('user_profile_cache', JSON.stringify(data));
      } else {
        console.log("[AuthContext] No profile data found");
      }
    } catch (error) {
      console.error('[AuthContext] Error fetching profile:', error);
      const cached = localStorage.getItem('user_profile_cache');
      if (cached) {
        console.log("[AuthContext] Using cached profile");
        setProfile(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, session, profile, loading, 
        signUp, signIn, signOut, resetPassword, refreshProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
