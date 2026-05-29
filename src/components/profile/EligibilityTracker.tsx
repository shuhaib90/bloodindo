'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Activity, CheckCircle, Clock } from 'lucide-react';

export default function EligibilityTracker() {
  // State for last donation date (null means no recent donation)
  const [lastDonationDate, setLastDonationDate] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);

  const REQUIRED_DAYS_BETWEEN_DONATIONS = 56;

  // Calculate days remaining whenever lastDonationDate changes
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
    // In a real app, this would hit an API endpoint to log the donation
    setLastDonationDate(new Date());
  };

  const isEligible = daysRemaining === 0;
  
  // Calculate progress percentage for the circular ring
  const progress = isEligible ? 100 : ((REQUIRED_DAYS_BETWEEN_DONATIONS - daysRemaining) / REQUIRED_DAYS_BETWEEN_DONATIONS) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-20 transition-colors duration-1000 ${isEligible ? 'bg-green-500' : 'bg-amber-500'}`} />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
        
        {/* Circular Progress Indicator */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            {/* Progress Track */}
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke={isEligible ? '#22c55e' : '#f59e0b'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isEligible ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                <CheckCircle className="w-10 h-10 text-green-500 mb-1" />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-amber-500">{daysRemaining}</span>
                <span className="text-xs text-neutral-400 font-medium">DAYS LEFT</span>
              </div>
            )}
          </div>
        </div>

        {/* Info & Actions */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            {isEligible ? (
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/30 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Eligible to Donate
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-500/30 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Recovery Period
              </span>
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">
            {isEligible ? "You can save a life today!" : "Rest and regenerate."}
          </h3>
          
          <p className="text-neutral-400 text-sm mb-6 max-w-md">
            {isEligible 
              ? "Your body has fully recovered from your last donation. You are medically cleared to donate whole blood again." 
              : `You recently donated blood. For your safety, please wait ${daysRemaining} more days before your next donation.`}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {isEligible ? (
              <button 
                onClick={handleDonateToday}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-red-900/20 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                I Donated Today
              </button>
            ) : (
              <button disabled className="bg-neutral-800 text-neutral-500 px-6 py-2.5 rounded-xl font-medium cursor-not-allowed border border-neutral-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Donated on {lastDonationDate?.toLocaleDateString()}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
