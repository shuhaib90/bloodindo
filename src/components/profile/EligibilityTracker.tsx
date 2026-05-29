'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Activity, CheckCircle2, Clock, Droplet } from 'lucide-react';

export default function EligibilityTracker() {
  const [lastDonationDate, setLastDonationDate] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);

  const REQUIRED_DAYS_BETWEEN_DONATIONS = 56;

  useEffect(() => {
    if (!lastDonationDate) {
      setDaysRemaining(0);
      return;
    }

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDonationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const remaining = REQUIRED_DAYS_BETWEEN_DONATIONS - diffDays;
    setDaysRemaining(remaining > 0 ? remaining : 0);
  }, [lastDonationDate]);

  const handleDonateToday = () => {
    setLastDonationDate(new Date());
  };

  const isEligible = daysRemaining === 0;
  
  const progress = isEligible ? 100 : ((REQUIRED_DAYS_BETWEEN_DONATIONS - daysRemaining) / REQUIRED_DAYS_BETWEEN_DONATIONS) * 100;
  const circumference = 2 * Math.PI * 36; // smaller radius = 36
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass-panel bg-brand-charcoal/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
      {/* Subtle Background Glow */}
      <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-20 transition-colors duration-700 ${isEligible ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      
      <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-5 relative z-10">
        <Droplet className={`h-5 w-5 ${isEligible ? 'text-emerald-500' : 'text-amber-500'}`} />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Donation Eligibility</h3>
        
        <div className="ml-auto">
          {isEligible ? (
             <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
               Ready
             </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/30 border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
               <Clock className="w-3 h-3" />
               Recovery
             </span>
          )}
        </div>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
        
        {/* Sleek Circular Progress */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="36"
              fill="transparent"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="6"
            />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              cx="50"
              cy="50"
              r="36"
              fill="transparent"
              stroke={isEligible ? '#10b981' : '#f59e0b'}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isEligible ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center text-emerald-500">
                <CheckCircle2 className="w-8 h-8" />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white leading-none">{daysRemaining}</span>
                <span className="text-[9px] text-gray-500 font-bold tracking-widest mt-1">DAYS LEFT</span>
              </div>
            )}
          </div>
        </div>

        {/* Info & Actions */}
        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-lg font-bold text-white mb-1.5 tracking-tight">
            {isEligible ? "You're clear to save lives!" : "Rest and Regenerate"}
          </h4>
          
          <p className="text-xs text-gray-400 mb-5 leading-relaxed">
            {isEligible 
              ? "Your body is fully recovered. You can safely donate whole blood today." 
              : `For your safety, please wait ${daysRemaining} days before your next donation.`}
          </p>

          <div className="flex items-center justify-center sm:justify-start">
            {isEligible ? (
              <button 
                onClick={handleDonateToday}
                className="rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-red-neon/20 hover:shadow-brand-red-neon/40 active:scale-95 transition-all flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Log Today's Donation
              </button>
            ) : (
              <div className="bg-brand-black/50 border border-white/5 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-medium text-gray-500">
                <Calendar className="w-4 h-4 text-gray-600" />
                Next clear date: <span className="text-white font-bold">{new Date(Date.now() + daysRemaining * 86400000).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
