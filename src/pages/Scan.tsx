import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Zap, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { premiumGateService } from '@/lib/premiumGateService';

export function Scan() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [flash, setFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    const checkGate = async () => {
      if (!user) return;
      try {
        const isPrem = premiumGateService.isPremium(profile);
        if (!isPrem) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          const r = await premiumGateService.getRemainingFreeScans(user.id, 3);
          clearTimeout(timeoutId);
          if (!controller.signal.aborted && r <= 0) {
            navigate('/paywall?source=scan_limit', { replace: true });
          }
        }
      } catch (e) {
        // fail-open
      }
    };
    checkGate();
  }, [user, profile, navigate]);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media devices API not available");
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      }).catch(() => navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      })); // Fallback without ideal constraints

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
      setShowFallback(false);
    } catch (err) {
      console.error("Camera access error:", err);
      setHasPermission(false);
      setShowFallback(true);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    setTimeout(() => {
      const video = videoRef.current!;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        
        try {
          sessionStorage.setItem('captured_image', base64);
        } catch(e) {
          console.warn('Failed to save to session storage', e);
        }
        
        // Stop stream
        if (videoRef.current?.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
        
        navigate('/scan/processing', { replace: true });
      }
      setIsCapturing(false);
    }, 80);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          try {
            sessionStorage.setItem('captured_image', event.target.result as string);
          } catch(err) {
            console.warn(err);
          }
          if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
          }
          navigate('/scan/processing', { replace: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (hasPermission === null && !showFallback) {
    return <div className="h-full w-full bg-black"></div>;
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black object-cover">
      {/* File fallback input */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={handleFileUpload}
        className="hidden" 
      />

      {showFallback ? (
        <div className="flex h-full flex-col items-center justify-center p-[16px] text-center text-white">
          <div className="mb-[16px] text-[80px]">📷</div>
          <h2 className="text-[22px] font-bold text-white">Camera Access Needed</h2>
          <p className="mt-[4px] mb-[32px] text-[14px] text-[#8E8E93]">Allow camera access or upload a photo to continue.</p>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-[300px] rounded-full bg-white py-[16px] text-[16px] font-bold text-black shadow-md transition-transform active:scale-95"
          >
            Upload Photo
          </button>
          
          <button 
            onClick={startCamera}
            className="mt-[12px] w-full max-w-[300px] rounded-full border border-white/20 bg-transparent py-[16px] text-[16px] font-bold text-white transition-transform active:scale-95"
          >
            Try Camera Again
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="mt-[24px] text-[15px] font-medium text-white/50 underline"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Flash animation */}
          {isCapturing && (
            <div className="absolute inset-0 z-50 bg-white" />
          )}

          {/* Top Bar */}
          <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between p-[16px] safe-area-top">
            <button 
              onClick={() => navigate('/')}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black/60 backdrop-blur-[10px]"
            >
              <X className="text-white" size={20} />
            </button>
            <div className="text-[14px] font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
               🍽️ KALORI
            </div>
            <button 
              onClick={() => alert("📸 Center your food in the frame for best AI recognition")}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black/60 backdrop-blur-[10px]"
            >
              <HelpCircle className="text-white" size={18} />
            </button>
          </div>

          {/* Center Frame */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-[280px] w-[280px]">
              {/* Corner Brackets */}
              <div className="absolute left-0 top-0 h-[32px] w-[32px] border-l-[3px] border-t-[3px] border-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
              <div className="absolute right-0 top-0 h-[32px] w-[32px] border-r-[3px] border-t-[3px] border-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
              <div className="absolute bottom-0 left-0 h-[32px] w-[32px] border-b-[3px] border-l-[3px] border-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
              <div className="absolute bottom-0 right-0 h-[32px] w-[32px] border-b-[3px] border-r-[3px] border-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
              
              <div className="absolute -bottom-[44px] left-0 right-0 text-center">
                <span className="rounded-full bg-black/60 px-[16px] py-[8px] text-[13px] font-medium text-white backdrop-blur-[10px]">
                  Center your food in the frame
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col bg-gradient-to-t from-black/80 to-transparent p-[20px] pb-[32px] pt-[40px] safe-area-bottom">
            
            {/* Tabs */}
            <div className="no-scrollbar mb-[24px] flex gap-[8px] overflow-x-auto px-2">
              <div className="shrink-0 rounded-full bg-white px-[18px] py-[10px] text-[13px] font-semibold text-[#1A1A1A] transition-all">📸 Scan Food</div>
              <div onClick={() => alert('Coming soon')} className="shrink-0 cursor-pointer rounded-full bg-white/15 px-[18px] py-[10px] text-[13px] font-semibold text-white transition-all">📊 Barcode</div>
              <div onClick={() => alert('Coming soon')} className="shrink-0 cursor-pointer rounded-full bg-white/15 px-[18px] py-[10px] text-[13px] font-semibold text-white transition-all">🏷️ Label</div>
              <div onClick={() => alert('Coming soon')} className="shrink-0 cursor-pointer rounded-full bg-white/15 px-[18px] py-[10px] text-[13px] font-semibold text-white transition-all">📁 Library</div>
            </div>
            
            {/* Action Row */}
            <div className="flex items-center justify-around px-[10px]">
              <button 
                onClick={() => setFlash(!flash)}
                className={`flex h-[48px] w-[48px] items-center justify-center rounded-full backdrop-blur-[10px] transition-colors ${flash ? 'bg-white text-black' : 'bg-white/15 text-white'}`}
              >
                <Zap size={22} fill={flash ? '#FACC15' : 'transparent'} color={flash ? '#FACC15' : 'white'} />
              </button>
              
              <motion.button 
                whileTap={{ scale: 0.92 }}
                onClick={handleCapture}
                className="flex h-[80px] w-[80px] items-center justify-center rounded-full border-[4px] border-white/40 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-transform ease-out"
              >
                <div className="h-[64px] w-[64px] rounded-full bg-white animate-pulse" />
              </motion.button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-white/15 text-white transition-transform active:scale-95"
              >
                <ImageIcon size={22} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
