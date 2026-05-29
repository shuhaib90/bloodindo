'use client';

import { motion } from 'framer-motion';
import { Activity, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-800/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-neutral-900 rounded-3xl flex items-center justify-center shadow-2xl border border-neutral-800/50">
              <Activity className="w-10 h-10 text-red-500/50" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center border-4 border-neutral-950 shadow-lg">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Hospital Hub</h1>
        
        <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/50 rounded-2xl p-6 mb-8 inline-block">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Coming Soon</h2>
          <p className="text-neutral-400 max-w-sm mx-auto leading-relaxed">
            We are currently developing a dedicated portal for medical facilities. This feature is temporarily locked and will be available in a future update.
          </p>
        </div>

        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-6 py-3 rounded-xl font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Home
        </Link>
      </motion.div>
    </div>
  );
}
