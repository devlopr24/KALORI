import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { settingsService } from '@/lib/settingsService';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export function ProfileEdit() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [heightValue, setHeightValue] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightValue, setWeightValue] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [activity, setActivity] = useState('Moderate');

  useEffect(() => {
    if (user && profile) {
      const dbToGenderUI: Record<string, string> = { 'male': 'Male', 'female': 'Female', 'other': 'Other' };
      const dbToActivityUI: Record<string, string> = { 'sedentary': 'Sedentary', 'lightly_active': 'Light', 'moderately_active': 'Moderate', 'very_active': 'Active' };

      setName(user.user_metadata?.full_name || 'KALORI User');
      setGender(dbToGenderUI[profile.gender || 'male'] || 'Male');
      setAge(profile.age?.toString() || '25');
      setHeightValue(profile.height_cm?.toString() || '175');
      setHeightUnit((profile.height_unit as any) || 'cm');
      setWeightValue(profile.current_weight_kg?.toString() || '70');
      setWeightUnit((profile.weight_unit as any) || 'kg');
      setActivity(dbToActivityUI[profile.activity_level || 'moderately_active'] || 'Moderate');
      setLoading(false);
    } else if (user === null) {
      navigate('/auth/welcome');
    }
  }, [user, profile, navigate]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const parsedAge = parseInt(age);
      if (isNaN(parsedAge) || parsedAge <= 0) {
        toast.error("Please enter a valid age");
        return;
      }
      const parsedHeight = parseFloat(heightValue);
      if (isNaN(parsedHeight) || parsedHeight <= 0) {
        toast.error("Please enter a valid height");
        return;
      }
      const parsedWeight = parseFloat(weightValue);
      if (isNaN(parsedWeight) || parsedWeight <= 0) {
        toast.error("Please enter a valid weight");
        return;
      }

      const genderUIToDb: Record<string, "male" | "female" | "other"> = {
        'Male': 'male', 'Female': 'female', 'Other': 'other'
      };
      
      const activityUIToDb: Record<string, "sedentary" | "lightly_active" | "moderately_active" | "very_active"> = {
        'Sedentary': 'sedentary', 'Light': 'lightly_active', 'Moderate': 'moderately_active', 
        'Active': 'very_active', 'Very Active': 'very_active'
      };
      
      await settingsService.updateProfile(user.id, {
          age: parsedAge,
          height_cm: parsedHeight,
          current_weight_kg: parsedWeight,
          gender: genderUIToDb[gender] || 'other',
          activity_level: activityUIToDb[activity] || 'moderately_active',
          height_unit: heightUnit,
          weight_unit: weightUnit
      });
        
      if (name.trim() !== user.user_metadata?.full_name) {
        const { error: authError } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
        if (authError) throw authError;
      }
      
      await refreshProfile();
      toast.success("Profile saved!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-[#FAFAFA]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#F0F0F0] border-t-[#1A1A1A]"></div>
        </div>
     );
  }

  const InputGroup = ({ label, value, onChange, placeholder, type = "text", right }: any) => (
    <div className="mb-4">
      <label className="mb-1.5 block text-[13px] font-bold text-[#1A1A1A]">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-[14px] border border-[#F0F0F0] bg-white p-3.5 text-[15px] font-medium text-[#1A1A1A] outline-none transition-colors focus:border-[#1A1A1A]"
        />
        {right && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {right}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full flex-col bg-[#FAFAFA] pt-safe">
      <div className="sticky top-0 z-20 flex items-center justify-center bg-white/80 px-4 py-3 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F7] transition-colors active:bg-[#E5E5EA]"
        >
          <ArrowLeft size={20} className="text-[#1A1A1A]" />
        </button>
        <h1 className="text-[16px] font-bold tracking-tight text-[#1A1A1A]">Edit Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-sm">
          <InputGroup 
            label="Full Name" 
            value={name} 
            onChange={(e: any) => setName(e.target.value)} 
          />
          <InputGroup 
            label="Email" 
            value={user?.email || ''} 
            onChange={() => {}} 
            disabled
          />

          <div className="mb-4">
             <label className="mb-1.5 block text-[13px] font-bold text-[#1A1A1A]">Gender</label>
             <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map(g => (
                   <button 
                     key={g}
                     onClick={() => setGender(g)}
                     className={`flex-1 rounded-xl py-3 text-[14px] font-bold transition-all ${gender === g ? 'bg-[#1A1A1A] text-white border-transparent' : 'bg-white text-[#1A1A1A] border border-[#F0F0F0]'}`}
                   >{g}</button>
                ))}
             </div>
          </div>

          <div className="flex gap-4">
             <div className="flex-1">
                <InputGroup 
                  type="number"
                  label="Age" 
                  value={age} 
                  onChange={(e: any) => setAge(e.target.value)} 
                />
             </div>
             <div className="flex-1">
                <InputGroup 
                  type="number"
                  label="Height" 
                  value={heightValue} 
                  onChange={(e: any) => setHeightValue(e.target.value)} 
                  right={<span className="text-[13px] font-bold text-[#8E8E93]">{heightUnit}</span>}
                />
             </div>
             <div className="flex-1">
                <InputGroup 
                  type="number"
                  label="Weight" 
                  value={weightValue} 
                  onChange={(e: any) => setWeightValue(e.target.value)} 
                  right={<span className="text-[13px] font-bold text-[#8E8E93]">{weightUnit}</span>}
                />
             </div>
          </div>

          <div className="mb-6">
             <label className="mb-1.5 block text-[13px] font-bold text-[#1A1A1A]">Activity Level</label>
             <div className="flex flex-col gap-2">
                {['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'].map(lvl => (
                   <button 
                     key={lvl}
                     onClick={() => setActivity(lvl)}
                     className={`w-full rounded-xl py-3 px-4 text-left text-[14px] font-bold transition-all ${activity === lvl ? 'bg-[#1A1A1A] text-white border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.1)]' : 'bg-white text-[#1A1A1A] border border-[#F0F0F0]'}`}
                   >{lvl}</button>
                ))}
             </div>
          </div>
        </motion.div>
      </div>

      <div className="border-t border-[#F0F0F0] bg-white p-4 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <button 
          disabled={saving}
          onClick={handleSave}
          className="w-full rounded-full bg-[#1A1A1A] py-4 text-[16px] font-bold text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
