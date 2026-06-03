import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../lib/profileService';
import { toast } from 'react-hot-toast';

export function AuthSignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setError('');
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      // Need to get the auth user ID. It's fetched asynchronously in AuthContext, 
      // but signIn completes when supabase.auth.signInWithPassword finishes.
      // So let's get the session directly to be safe.
      const { data: { session } } = await import('../../lib/supabase').then(m => m.supabase.auth.getSession());
      if (session?.user) {
        const isComplete = await profileService.isOnboardingComplete(session.user.id);
        setLoading(false);
        if (isComplete) {
          navigate('/', { replace: true });
        } else {
          // You could determine the step here and navigate to it, or go to welcome and let welcome do it
          navigate('/onboarding/welcome', { replace: true });
        }
      } else {
        setLoading(false);
        navigate('/', { replace: true });
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] pt-safe px-6 pb-6">
      <div className="flex h-14 items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-[#F0F0F0] text-[#1A1A1A] active:scale-95 transition-transform"
        >
          <span className="text-[20px]">←</span>
        </button>
      </div>

      <div className="mt-6 flex-1">
        <h1 className="text-[32px] font-black text-[#1A1A1A]">Welcome back</h1>
        <p className="mt-2 text-[15px] text-[#8E8E93]">Sign in to continue tracking.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-[12px] bg-[#FF6B6B]/10 p-3 text-[13px] font-medium text-[#FF6B6B]">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-[#1A1A1A]">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-[14px] border-[2px] border-[#F0F0F0] bg-white p-4 text-[16px] font-semibold text-[#1A1A1A] outline-none placeholder:text-[#C7C7CC] placeholder:font-medium focus:border-[#1A1A1A] transition-colors"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-[#1A1A1A]">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-[14px] border-[2px] border-[#F0F0F0] bg-white p-4 text-[16px] font-bold tracking-widest text-[#1A1A1A] outline-none placeholder:text-[#C7C7CC] placeholder:font-medium placeholder:tracking-normal focus:border-[#1A1A1A] transition-colors"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <span className="cursor-pointer text-[13px] font-bold text-[#4A90E2]">Forgot password?</span>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="flex w-full items-center justify-center rounded-[16px] bg-[#1A1A1A] p-[18px] text-[16px] font-extrabold text-white shadow-lg outline-none transition-transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-white/20 border-t-white" />
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-center pb-4 text-[14px]">
        <span className="text-[#8E8E93]">Don't have an account? </span>
        <button onClick={() => navigate('/auth/signup')} className="ml-1 font-bold text-[#1A1A1A]">Sign Up</button>
      </div>
    </div>
  );
}
