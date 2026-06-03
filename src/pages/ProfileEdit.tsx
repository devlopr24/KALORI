import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProfileEdit() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [heightValue, setHeightValue] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightValue, setWeightValue] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [gender, setGender] = useState('Male');
  const [activity, setActivity] = useState('Moderate');

  useEffect(() => {
    const getSetting = (key: string, def: any) => {
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : def;
      } catch {
        return def;
      }
    };
    
    setName(getSetting('user_name', 'KALORI User'));
    setEmail(getSetting('user_email', ''));
    setAge(getSetting('user_age', '25'));
    setHeightValue(getSetting('user_height', '175'));
    setHeightUnit(getSetting('height_unit', 'cm'));
    setWeightValue(getSetting('current_weight_kg', '70'));
    setWeightUnit(getSetting('weight_unit', 'kg'));
    setGender(getSetting('user_gender', 'Male'));
    setActivity(getSetting('activity_level', 'Moderate'));
  }, []);

  const handleSave = () => {
    const setSetting = (key: string, value: any) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    };

    setSetting('user_name', name);
    setSetting('user_email', email);
    setSetting('user_age', age);
    setSetting('user_height', heightValue);
    setSetting('height_unit', heightUnit);
    setSetting('current_weight_kg', parseFloat(weightValue) || 70);
    setSetting('weight_unit', weightUnit);
    setSetting('user_gender', gender);
    setSetting('activity_level', activity);

    navigate(-1);
  };

  return (
    <div className="flex h-screen flex-col bg-[#FAFAFA]">
      <div className="flex items-center justify-between bg-white px-4 py-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="rounded-full bg-[#F5F5F7] p-2">
          <ArrowLeft size={20} className="text-[#1A1A1A]" />
        </button>
        <h1 className="text-[17px] font-bold text-[#1A1A1A]">Edit Profile</h1>
        <div className="w-[36px]" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#8E8E93]">FULL NAME</label>
            <input 
              value={name} onChange={e => setName(e.target.value)}
              className="rounded-xl border border-[#F0F0F0] bg-white p-4 text-[16px] font-semibold focus:border-[#1A1A1A] outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#8E8E93]">EMAIL ADDRESS</label>
            <input 
              value={email} onChange={e => setEmail(e.target.value)} type="email"
              className="rounded-xl border border-[#F0F0F0] bg-white p-4 text-[16px] font-semibold focus:border-[#1A1A1A] outline-none transition-colors"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <label className="text-[13px] font-bold text-[#8E8E93]">AGE</label>
              <input 
                value={age} onChange={e => setAge(e.target.value)} type="number"
                className="rounded-xl border border-[#F0F0F0] bg-white p-4 text-[16px] font-semibold focus:border-[#1A1A1A] outline-none transition-colors"
              />
            </div>
            
            <div className="flex flex-1 flex-col gap-2">
              <label className="text-[13px] font-bold text-[#8E8E93]">GENDER</label>
              <select 
                value={gender} onChange={e => setGender(e.target.value)}
                className="rounded-xl border border-[#F0F0F0] bg-white p-4 text-[16px] font-semibold focus:border-[#1A1A1A] outline-none transition-colors"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-[#8E8E93]">HEIGHT</label>
              <div className="flex rounded-full bg-[#F5F5F7] p-1">
                <button onClick={() => setHeightUnit('cm')} className={`rounded-full px-3 py-1 text-[12px] font-bold ${heightUnit === 'cm' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#8E8E93]'}`}>cm</button>
                <button onClick={() => setHeightUnit('ft')} className={`rounded-full px-3 py-1 text-[12px] font-bold ${heightUnit === 'ft' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#8E8E93]'}`}>ft</button>
              </div>
            </div>
            <input 
              value={heightValue} onChange={e => setHeightValue(e.target.value)} type="number"
              className="rounded-xl border border-[#F0F0F0] bg-white p-4 text-[16px] font-semibold focus:border-[#1A1A1A] outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-[#8E8E93]">CURRENT WEIGHT</label>
              <div className="flex rounded-full bg-[#F5F5F7] p-1">
                <button onClick={() => setWeightUnit('kg')} className={`rounded-full px-3 py-1 text-[12px] font-bold ${weightUnit === 'kg' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#8E8E93]'}`}>kg</button>
                <button onClick={() => setWeightUnit('lbs')} className={`rounded-full px-3 py-1 text-[12px] font-bold ${weightUnit === 'lbs' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#8E8E93]'}`}>lbs</button>
              </div>
            </div>
            <input 
              value={weightValue} onChange={e => setWeightValue(e.target.value)} type="number"
              className="rounded-xl border border-[#F0F0F0] bg-white p-4 text-[16px] font-semibold focus:border-[#1A1A1A] outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#8E8E93]">ACTIVITY LEVEL</label>
            <select 
              value={activity} onChange={e => setActivity(e.target.value)}
              className="rounded-xl border border-[#F0F0F0] bg-white p-4 text-[16px] font-semibold focus:border-[#1A1A1A] outline-none transition-colors"
            >
              <option value="Sedentary">Sedentary (Little or no exercise)</option>
              <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
              <option value="Moderate">Moderate (3-5 days/week)</option>
              <option value="Very Active">Very Active (6-7 days/week)</option>
            </select>
          </div>

          <div className="h-10" />
        </motion.div>
      </div>

      <div className="border-t border-[#F0F0F0] bg-white p-4 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <button 
          onClick={handleSave}
          className="w-full rounded-full bg-[#1A1A1A] py-4 text-[16px] font-bold text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:opacity-90 transition-opacity"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
