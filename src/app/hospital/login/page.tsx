'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, KeyRound, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';

export default function HospitalLogin() {
  const [hospitalId, setHospitalId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/hospital';
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-900/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center shadow-lg border border-neutral-800/50">
              <Activity className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Hospital Portal</h1>
          <p className="text-neutral-400">Secure access for medical facilities</p>
        </div>

        <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/50 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 ml-1">Hospital ID / Reg No.</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 className="w-5 h-5 text-neutral-500" />
                </div>
                <input 
                  type="text" 
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  placeholder="Enter registration number"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 ml-1">Secure Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="w-5 h-5 text-neutral-500" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white rounded-2xl py-3.5 font-medium flex items-center justify-center gap-2 transition-colors group"
            >
              Access Hub
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-800/50 text-center">
            <p className="text-neutral-400 text-sm">
              Not registered as a partner facility? <br/>
              <Link href="/hospital/register" className="text-red-400 hover:text-red-300 font-medium inline-block mt-2">
                Apply for Hospital Access
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
