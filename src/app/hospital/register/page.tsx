'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, KeyRound, ArrowRight, Activity, Phone, User, FileText } from 'lucide-react';
import Link from 'next/link';

export default function HospitalRegister() {
  const [formData, setFormData] = useState({
    hospitalName: '',
    regNumber: '',
    contactPerson: '',
    hotline: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate registration
    window.location.href = '/hospital/login';
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden py-12">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-900/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center shadow-lg border border-neutral-800/50">
              <Activity className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Partner Application</h1>
          <p className="text-neutral-400">Register your facility to request blood on Blood Indo</p>
        </div>

        <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/50 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 ml-1">Hospital Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 className="w-5 h-5 text-neutral-500" />
                </div>
                <input 
                  type="text" 
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  placeholder="e.g. City General Hospital"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 ml-1">Registration / License No.</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FileText className="w-5 h-5 text-neutral-500" />
                </div>
                <input 
                  type="text" 
                  name="regNumber"
                  value={formData.regNumber}
                  onChange={handleChange}
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  placeholder="Official license number"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 ml-1">Contact Person</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-neutral-500" />
                  </div>
                  <input 
                    type="text" 
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                    placeholder="Full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 ml-1">Emergency Hotline</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-neutral-500" />
                  </div>
                  <input 
                    type="tel" 
                    name="hotline"
                    value={formData.hotline}
                    onChange={handleChange}
                    className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                    placeholder="+1234567890"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 ml-1">Create Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="w-5 h-5 text-neutral-500" />
                </div>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Compliance Consent Checkbox */}
            <div className="flex items-start gap-3 mt-4 pt-1">
              <input
                type="checkbox"
                id="hospitalConsent"
                required
                className="mt-1 rounded bg-neutral-950 border-neutral-800 text-red-600 focus:ring-red-500/50 shrink-0 cursor-pointer h-4 w-4"
              />
              <label htmlFor="hospitalConsent" className="text-xs text-neutral-400 leading-normal select-none text-left">
                We confirm that the hospital registration details are accurate, and agree to the <Link href="/terms" target="_blank" className="text-red-400 hover:underline">Terms of Service</Link>, <Link href="/privacy" target="_blank" className="text-red-400 hover:underline">Privacy Policy</Link>, and <Link href="/disclaimer" target="_blank" className="text-red-400 hover:underline">Medical &amp; Emergency Disclaimers</Link>.
              </label>
            </div>

            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white rounded-2xl py-3.5 font-medium flex items-center justify-center gap-2 transition-colors group mt-4"
            >
              Submit Application
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-800/50 text-center">
            <p className="text-neutral-400 text-sm">
              Already have an account? <br/>
              <Link href="/hospital/login" className="text-red-400 hover:text-red-300 font-medium inline-block mt-2">
                Login to Hub
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
