"use client";

import { useState, useEffect } from 'react';
import { Shield, MapPin, Radio, Users, Check, Phone, Navigation } from 'lucide-react';
import { Donor, db, BloodGroup } from '../lib/db';

interface RadarScannerProps {
  selectedBloodGroup: BloodGroup | '';
  donors: Donor[];
  onDonorSelect?: (donor: Donor) => void;
  userLat?: number;
  userLng?: number;
}

export default function RadarScanner({ selectedBloodGroup, donors, onDonorSelect, userLat, userLng }: RadarScannerProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);

  useEffect(() => {
    if (!selectedBloodGroup) {
      setFilteredDonors(donors.filter(d => d.available));
      return;
    }
    const compatible = donors.filter(d => 
      d.available && db.isCompatible(d.bloodGroup, selectedBloodGroup)
    );
    setFilteredDonors(compatible);
  }, [selectedBloodGroup, donors]);

  useEffect(() => {
    setIsScanning(true);
    const timer = setTimeout(() => {
      setIsScanning(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [selectedBloodGroup]);

  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel bg-brand-charcoal/80 border border-white/5 p-6 flex flex-col items-center">
      <span className="absolute -left-16 -bottom-16 h-32 w-32 rounded-full bg-brand-red-neon/5 blur-3xl"></span>

      <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Radio className={"h-5 w-5 " + (isScanning ? 'text-brand-red-neon animate-pulse' : 'text-brand-red-glow')} />
          <h2 className="text-lg font-bold text-white font-sans">Nearby Donor Radar</h2>
        </div>
        
        <span className="text-xs font-semibold text-gray-400 bg-brand-black/60 border border-white/5 rounded-full px-3 py-1 text-center">
          {isScanning ? 'Scanning airspace...' : filteredDonors.length + ' Donors Found'}
        </span>
      </div>
      
      {userLat && userLng && (
        <div className="w-full text-[10px] text-emerald-400 font-mono mb-4 flex items-center justify-center gap-1.5 bg-emerald-950/20 py-1.5 rounded-lg border border-emerald-500/20">
          <Navigation className="h-3 w-3" /> Radar Base: {userLat.toFixed(4)}, {userLng.toFixed(4)}
        </div>
      )}

      {/* Interactive Radar Screen visual */}
      <div className="relative w-full aspect-square max-w-[280px] rounded-full bg-brand-black/80 border-2 border-brand-red-neon/30 overflow-hidden shadow-[0_0_30px_rgba(255,0,60,0.1)] mx-auto flex items-center justify-center">
        {/* Radar grids */}
        <div className="absolute inset-0 border-[0.5px] border-brand-red-neon/10 rounded-full scale-75"></div>
        <div className="absolute inset-0 border-[0.5px] border-brand-red-neon/10 rounded-full scale-50"></div>
        <div className="absolute inset-0 border-[0.5px] border-brand-red-neon/10 rounded-full scale-25"></div>
        <div className="absolute h-full w-[0.5px] bg-brand-red-neon/10"></div>
        <div className="absolute w-full h-[0.5px] bg-brand-red-neon/10"></div>

        {/* Center dot (You) */}
        <div className="absolute h-3 w-3 rounded-full bg-white z-20 shadow-[0_0_10px_white]"></div>

        {/* Scanning Sweep */}
        {isScanning && (
          <div className="absolute inset-0 origin-center animate-[spin_2s_linear_infinite] z-10 pointer-events-none">
            <div className="w-[50%] h-[50%] bg-gradient-to-tr from-transparent via-brand-red-neon/20 to-brand-red-neon/80 origin-bottom-right rounded-tl-full blur-[1px]"></div>
          </div>
        )}

        {/* Blips */}
        {!isScanning && filteredDonors.map((donor, idx) => {
          // Normalize distance and angle for the UI radar circle
          const distScale = Math.min(Math.max(donor.distance / 15, 0.1), 0.95);
          const angle = (idx * 137.5) % 360; 
          
          const x = 50 + (distScale * 50 * Math.cos(angle * Math.PI / 180));
          const y = 50 + (distScale * 50 * Math.sin(angle * Math.PI / 180));

          return (
            <div 
              key={donor.id}
              onClick={() => onDonorSelect?.(donor)}
              className="absolute group cursor-pointer z-20 hover:z-30"
              style={{ left: x + '%', top: y + '%', transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-brand-red-neon/40 rounded-full blur animate-ping"></div>
                <div className="relative h-3 w-3 rounded-full bg-brand-red-neon border border-white shadow-[0_0_10px_rgba(255,0,60,1)]"></div>
              </div>
              
              <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-brand-charcoal border border-white/10 px-2 py-1 rounded text-[10px] text-white z-50 pointer-events-none shadow-xl">
                <span className="font-bold">{donor.name}</span> <span className="text-brand-red-glow">({donor.bloodGroup})</span>
                <br />
                <span className="text-gray-400">{donor.distance.toFixed(1)} km away</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full mt-6 grid grid-cols-2 gap-3 text-center">
        <div className="bg-brand-black/40 rounded-xl p-3 border border-white/5">
          <Shield className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">Network</div>
          <div className="text-xs font-bold text-white">SECURE</div>
        </div>
        <div className="bg-brand-black/40 rounded-xl p-3 border border-white/5">
          <Users className="h-4 w-4 text-sky-400 mx-auto mb-1" />
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">Active</div>
          <div className="text-xs font-bold text-white">{filteredDonors.length} Verified</div>
        </div>
      </div>
    </div>
  );
}
