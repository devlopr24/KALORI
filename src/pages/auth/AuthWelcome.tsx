import React from 'react';
import { useNavigate } from 'react-router-dom';

export function AuthWelcome() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] p-6 pb-20 pt-safe text-center">
      <div className="flex flex-1 flex-col items-center justify-center w-full">
        <div className="mb-6 flex h-[100px] w-[100px] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] shadow-[0_12px_24px_rgba(255,107,53,0.3)]">
          <span className="text-[48px]">🍛</span>
        </div>
        <h1 className="mb-3 text-[36px] font-black tracking-tight text-[#1A1A1A]">
          KALORI
        </h1>
        <p className="max-w-[280px] text-[16px] font-medium leading-relaxed text-[#8E8E93]">
          Track every Indian dish with AI-powered precision.
        </p>
      </div>

      <div className="w-full max-w-[340px] space-y-4">
        <button
          onClick={() => navigate('/auth/signup')}
          className="flex w-full items-center justify-center rounded-[16px] bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-[18px] text-[16px] font-extrabold text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] outline-none transition-transform active:scale-[0.98]"
        >
          Create Account
        </button>
        <button
          onClick={() => navigate('/auth/signin')}
          className="flex w-full items-center justify-center rounded-[16px] bg-white p-[18px] text-[16px] font-bold text-[#1A1A1A] border-[2px] border-[#F0F0F0] shadow-sm outline-none transition-transform active:scale-[0.98]"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
