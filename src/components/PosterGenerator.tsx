"use client";

import { useState } from 'react';
import { X, Instagram, MessageSquare, Download, Share2, Award, ShieldAlert, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { BloodRequest } from '../lib/db';

interface PosterGeneratorProps {
  request: BloodRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PosterGenerator({ request, isOpen, onClose }: PosterGeneratorProps) {
  const [format, setFormat] = useState<'instagram' | 'whatsapp'>('instagram');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !request) return null;

  const handleDownload = () => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#ff003c', '#ffffff']
    });
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#ff003c', '#ffffff']
    });

    alert(`Success! Blood Indo generated high-res ${format === 'instagram' ? 'Instagram Story (9:16)' : 'WhatsApp Card (1:1)'} poster for Patient ${request.patientName}. Saved to your device!`);
  };

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/feed?id=${request.id}` : `https://bloodindo.org/feed?id=${request.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrValue = typeof window !== 'undefined' ? `${window.location.origin}/feed?id=${request.id}` : `https://bloodindo.org/feed?id=${request.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/90 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-brand-charcoal/95 p-6 shadow-2xl flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none">
          <X className="h-6 w-6" />
        </button>

        <div className="flex-1 flex flex-col justify-between py-2">
          <div>
            <span className="flex items-center gap-1.5 text-brand-red-glow text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="h-4 w-4" /> Social Poster Studio
            </span>
            <h2 className="text-xl font-bold text-white mb-1">Generate Share Poster</h2>
            <p className="text-xs text-gray-400 mb-6">Create stunning, premium visual graphics to share on social feeds and recruit matching donors instantly.</p>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-gray-400">Select Poster Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormat('instagram')}
                  className={`flex items-center justify-center gap-2 rounded-xl p-3 border text-xs font-bold transition-all ${
                    format === 'instagram'
                      ? 'bg-brand-red-neon/10 border-brand-red-neon text-brand-red-glow shadow-[0_0_15px_rgba(255,0,60,0.1)]'
                      : 'bg-brand-black/40 border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Instagram className="h-4 w-4" /> Instagram Story (9:16)
                </button>
                
                <button
                  onClick={() => setFormat('whatsapp')}
                  className={`flex items-center justify-center gap-2 rounded-xl p-3 border text-xs font-bold transition-all ${
                    format === 'whatsapp'
                      ? 'bg-brand-red-neon/10 border-brand-red-neon text-brand-red-glow shadow-[0_0_15px_rgba(255,0,60,0.1)]'
                      : 'bg-brand-black/40 border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" /> WhatsApp Card (1:1)
                </button>
              </div>
            </div>
            
            <div className="rounded-xl bg-brand-black/40 border border-white/5 p-4 space-y-2.5 text-xs text-gray-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-bold text-gray-400">Patient Profile</span>
                <span className="text-white">{request.patientName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-bold text-gray-400">Required Group</span>
                <span className="text-brand-red-glow font-black">{request.bloodGroup}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-bold text-gray-400">Hospital Center</span>
                <span className="text-white truncate max-w-[200px]">{request.hospitalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-400">Urgency Standard</span>
                <span className="text-amber-400 font-bold">{request.urgencyLevel}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-gray-300 py-3 text-xs font-bold active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" /> Link Copied
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" /> Copy Access Link
                </>
              )}
            </button>
            
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon hover:shadow-[0_0_15px_rgba(255,0,60,0.25)] text-white py-3 text-xs font-bold active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" /> Save Graphic
            </button>
          </div>
        </div>

        {/* Right Side: Poster Canvas */}
        <div className="flex-1 flex items-center justify-center bg-brand-black/40 rounded-xl p-4 border border-white/5 min-h-[350px]">
          {format === 'instagram' ? (
            <div className="relative w-64 h-[440px] rounded-2xl bg-brand-black border border-brand-red-neon/30 flex flex-col justify-between p-5 overflow-hidden shadow-2xl shadow-brand-red-neon/15">
              <span className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-brand-red-neon/10 blur-2xl"></span>
              <span className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-brand-red-neon/10 blur-2xl"></span>
              
              <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-white">
                  BLOOD<span className="text-brand-red-neon">INDO</span>
                </span>
                
                <span className="flex items-center gap-1 rounded-full bg-brand-red-neon/25 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-brand-red-glow border border-brand-red-neon/30 animate-pulse">
                  <ShieldAlert className="h-2.5 w-2.5" /> {request.urgencyLevel}
                </span>
              </div>

              <div className="relative z-10 my-4 flex-1 flex flex-col justify-center items-center text-center">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1">EMERGENCY REQUEST</span>
                <h3 className="text-xs font-medium text-gray-400 mb-1">Patient {request.patientName} needs</h3>
                
                <div className="relative my-3 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-red-dark via-brand-red-deep to-brand-red border border-brand-red-neon/40 shadow-xl shadow-brand-red-neon/25">
                  <span className="text-5xl font-black text-white tracking-tighter">{request.bloodGroup}</span>
                </div>
                
                <div className="text-base font-bold text-white mt-1 leading-snug">{request.unitsNeeded} Units Required</div>
                <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 justify-center">
                  <span className="inline-block h-1.5 w-1.5 bg-brand-red-neon rounded-full"></span>
                  {request.hospitalName}
                </div>
              </div>

              <div className="relative z-10 border-t border-white/10 pt-3 flex items-center gap-3">
                <div className="bg-white p-1 rounded-lg shrink-0 shadow-md">
                  <QRCodeSVG value={qrValue} size={48} level="M" />
                </div>
                <div className="text-left min-w-0">
                  <h4 className="text-[9px] font-bold text-white uppercase tracking-wider leading-none">Scan to Donate</h4>
                  <p className="text-[8px] text-gray-500 mt-1 leading-normal">Help connect donors directly. Accept request on Blood Indo app.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-72 h-72 rounded-2xl bg-brand-black border border-brand-red-neon/30 flex flex-col justify-between p-5 overflow-hidden shadow-2xl shadow-brand-red-neon/15">
              <span className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-red-neon/10 blur-2xl"></span>
              
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">
                    BLOOD<span className="text-brand-red-neon">INDO</span>
                  </span>
                  <h3 className="text-xs font-bold text-gray-400 mt-1.5 leading-none">Emergency Blood Request</h3>
                  <h4 className="text-base font-black text-white mt-1 leading-none">{request.patientName}</h4>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-red-dark via-brand-red-deep to-brand-red border border-brand-red-neon/40 text-white shadow-lg shadow-brand-red-neon/20">
                  <span className="text-2xl font-black">{request.bloodGroup}</span>
                </div>
              </div>

              <div className="relative z-10 my-2 rounded-lg bg-brand-charcoal border border-white/5 p-2.5 flex items-center justify-between gap-2">
                <div className="text-left min-w-0">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-brand-red-glow">{request.urgencyLevel} LEVEL</span>
                  <div className="text-[10px] text-white font-bold truncate mt-0.5">{request.hospitalName}</div>
                  <div className="text-[9px] text-gray-500 truncate">{request.unitsNeeded} Units needed instantly</div>
                </div>

                <div className="bg-white p-1 rounded-md shrink-0">
                  <QRCodeSVG value={qrValue} size={36} level="M" />
                </div>
              </div>

              <div className="relative z-10 text-center text-[8px] text-gray-600 border-t border-white/5 pt-2 font-medium uppercase tracking-widest">
                Scan QR or click shared link to volunteer
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
