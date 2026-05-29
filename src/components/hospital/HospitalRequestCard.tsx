'use client';

import { motion } from 'framer-motion';
import { Droplet, Clock, CheckCircle, AlertTriangle, PhoneCall, Zap } from 'lucide-react';

interface HospitalRequestCardProps {
  bloodType: string;
  unitsNeeded: number;
  urgency: 'Normal' | 'High' | 'Critical';
  status: 'Pending' | 'Fulfilled' | 'Cancelled';
  donorsResponding: number;
  timeAgo: string;
}

export default function HospitalRequestCard({
  bloodType,
  unitsNeeded,
  urgency,
  status,
  donorsResponding,
  timeAgo
}: HospitalRequestCardProps) {
  
  const isCritical = urgency === 'Critical';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-3xl border p-6 shadow-xl backdrop-blur-md transition-all ${
        isCritical 
          ? 'bg-neutral-900/80 border-red-900/50 shadow-red-900/20' 
          : 'bg-neutral-900/60 border-neutral-800/50 shadow-black/40'
      }`}
    >
      {/* Background Pulse for Critical */}
      {isCritical && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />
      )}

      <div className="relative z-10 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner ${
              isCritical ? 'bg-red-950 border-red-500/30' : 'bg-neutral-800 border-neutral-700'
            }`}>
              <span className={`text-2xl font-black ${isCritical ? 'text-red-500' : 'text-neutral-200'}`}>
                {bloodType}
              </span>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Need {unitsNeeded} Units</h3>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-xs text-neutral-400">{timeAgo}</span>
              </div>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
            isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {isCritical ? <Zap className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {urgency}
          </div>
        </div>

        {/* Responders Metric */}
        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Droplet className={`w-5 h-5 ${donorsResponding > 0 ? 'text-green-500' : 'text-neutral-500'}`} />
              {donorsResponding > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
              )}
            </div>
            <span className="text-sm text-neutral-300 font-medium">Donors En Route</span>
          </div>
          
          <span className={`text-2xl font-black ${donorsResponding > 0 ? 'text-green-400' : 'text-neutral-500'}`}>
            {donorsResponding}
          </span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button className="flex items-center justify-center gap-2 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-sm font-medium transition-colors border border-neutral-700">
            <CheckCircle className="w-4 h-4" />
            Mark Fulfilled
          </button>
          <button className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            isCritical 
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20' 
              : 'bg-white text-black hover:bg-neutral-200'
          }`}>
            <PhoneCall className="w-4 h-4" />
            Contact Donors
          </button>
        </div>

      </div>
    </motion.div>
  );
}
