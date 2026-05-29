'use client';

import EligibilityTracker from '@/components/profile/EligibilityTracker';
import { User, Award, Droplet, MapPin } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="relative">
            <div className="w-32 h-32 bg-neutral-900 rounded-full border-4 border-neutral-800 flex items-center justify-center shadow-xl">
              <User className="w-16 h-16 text-neutral-500" />
            </div>
            <div className="absolute bottom-0 right-0 bg-red-600 text-white font-black px-3 py-1 rounded-full border-2 border-neutral-950 shadow-lg">
              O+
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
            <h1 className="text-3xl font-bold text-white">Alex Sterling</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-neutral-400 mt-2">
              <MapPin className="w-4 h-4" />
              <span>Jakarta, Indonesia</span>
            </div>
            
            <div className="flex gap-4 mt-6 justify-center md:justify-start">
              <div className="bg-neutral-900/50 border border-neutral-800 px-4 py-2 rounded-xl flex items-center gap-3">
                <Droplet className="w-5 h-5 text-red-500" />
                <div className="text-left">
                  <p className="text-xs text-neutral-500 font-medium">Donations</p>
                  <p className="text-white font-bold">4 Times</p>
                </div>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800 px-4 py-2 rounded-xl flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                  <p className="text-xs text-neutral-500 font-medium">Lives Saved</p>
                  <p className="text-white font-bold">~12 Lives</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Tracker Section */}
        <div className="pt-8 border-t border-neutral-800/50">
          <h2 className="text-xl font-bold text-white mb-6">Donation Eligibility</h2>
          <EligibilityTracker />
        </div>

      </div>
    </div>
  );
}
