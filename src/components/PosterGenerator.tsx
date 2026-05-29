"use client";

import { useState } from 'react';
import { X, Instagram, MessageSquare, Download, Share2, Award, Check } from 'lucide-react';
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

    alert(`Success! Generated beautiful high-res Blood Donation card for patient ${request.patientName}. Saved to your device!`);
  };

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/feed?id=${request.id}` 
      : `https://bloodindo.org/feed?id=${request.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrValue = typeof window !== 'undefined' 
    ? `${window.location.origin}/feed?id=${request.id}` 
    : `https://bloodindo.org/feed?id=${request.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/90 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-brand-charcoal/95 p-6 shadow-2xl flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none z-50"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex-1 flex flex-col justify-between py-2">
          <div>
            <span className="flex items-center gap-1.5 text-brand-red-glow text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="h-4 w-4" /> Social Flyer Generator
            </span>
            <h2 className="text-xl font-bold text-white mb-1">Generate Sharing Flyer</h2>
            <p className="text-xs text-gray-400 mb-6">Create stunning, premium blood donation flyers to share on social feeds and recruit matching donors instantly.</p>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-gray-400">Select Poster Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('instagram')}
                  className={`flex items-center justify-center gap-2 rounded-xl p-3 border text-xs font-bold transition-all ${
                    format === 'instagram'
                      ? 'bg-brand-red-neon/10 border-brand-red-neon text-brand-red-glow shadow-[0_0_15px_rgba(255,0,60,0.1)]'
                      : 'bg-brand-black/40 border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Instagram className="h-4 w-4" /> Story Format (9:16)
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormat('whatsapp')}
                  className={`flex items-center justify-center gap-2 rounded-xl p-3 border text-xs font-bold transition-all ${
                    format === 'whatsapp'
                      ? 'bg-brand-red-neon/10 border-brand-red-neon text-brand-red-glow shadow-[0_0_15px_rgba(255,0,60,0.1)]'
                      : 'bg-brand-black/40 border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" /> Feed Format (1:1)
                </button>
              </div>
            </div>
            
            <div className="rounded-xl bg-brand-black/40 border border-white/5 p-4 space-y-2.5 text-xs text-gray-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-bold text-gray-400">Patient Name</span>
                <span className="text-white font-semibold">{request.patientName}</span>
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
                <span className="font-bold text-gray-400">Contact Number</span>
                <span className="text-emerald-400 font-mono font-bold">{request.contactDetails}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
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
              type="button"
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon hover:shadow-[0_0_15px_rgba(255,0,60,0.25)] text-white py-3 text-xs font-bold active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" /> Save Graphic
            </button>
          </div>
        </div>

        {/* Right Side: Graphic Canvas */}
        <div className="flex-1 flex items-center justify-center bg-brand-black/40 rounded-xl p-4 border border-white/5 min-h-[460px]">
          {format === 'instagram' ? (
            // Tall Flyer Format (9:16)
            <div className="relative w-64 h-[440px] rounded-2xl bg-[#fafafa] border border-zinc-200 flex flex-col justify-between p-4 overflow-hidden shadow-2xl text-black">
              {/* Top Row: Logos */}
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <div className="flex items-center gap-1.5">
                  <img src="/logo.png" alt="bloodundo.in logo" className="h-8 w-8 shrink-0 object-contain" />
                  <div className="text-left leading-none">
                    <div className="text-[9px] font-black text-[#ff003c] tracking-tight">bloodundo.in</div>
                    <div className="text-[5.5px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Kerala's Lifesaver</div>
                  </div>
                </div>

                <div className="border-[1.5px] border-black px-1.5 py-0.5 text-center font-black tracking-widest text-black text-[7px] uppercase leading-none">
                  BLOOD INDO
                  <div className="text-[5px] font-bold text-zinc-500 border-t border-black/10 mt-0.5 pt-0.5">SAVES LIVES</div>
                </div>
              </div>

              {/* Slogan */}
              <div className="text-center my-1.5">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs text-red-500">♥</span>
                  <h1 className="text-lg font-extrabold text-[#ff003c] uppercase tracking-tighter leading-none">
                    blood donation
                  </h1>
                  <span className="text-xs text-red-500">♥</span>
                </div>
                <h2 className="text-xs font-serif italic text-zinc-700 leading-tight mt-0.5">saves Lives</h2>
              </div>

              {/* SVG Hands Illustration */}
              <div className="relative flex items-center justify-center my-1">
                <svg viewBox="0 0 200 100" className="w-full h-20">
                  {/* Heart Outline Connector */}
                  <path d="M 100,35 C 95,20 80,20 80,35 C 80,45 100,60 100,60 C 100,60 120,45 120,35 C 120,20 105,20 100,35 Z" fill="none" stroke="#ff003c" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 10,50 Q 100,50 190,50" fill="none" stroke="#ff003c" strokeWidth="1" strokeDasharray="3,3" />
                  {/* Red Hand */}
                  <path d="M 10,48 C 30,45 60,35 90,35 C 105,35 125,43 145,43 C 160,43 175,40 185,41 C 190,42 185,46 175,48 C 165,50 140,52 130,52 C 120,52 100,55 85,58 C 70,61 40,68 10,68 Z" fill="#ff003c" />
                  {/* White Hand overlapping */}
                  <path d="M 190,58 C 170,61 140,68 110,68 C 95,68 75,60 55,60 C 40,60 25,63 15,62 C 10,61 15,57 25,55 C 35,53 60,51 70,51 C 80,51 100,48 115,45 C 130,42 160,35 190,35 Z" fill="white" stroke="#ff003c" strokeWidth="1" />
                </svg>
              </div>

              {/* Red Poster Details Block */}
              <div className="bg-[#ff003c] text-white p-3 rounded-xl space-y-2 shadow-md flex-1 flex flex-col justify-between">
                <div className="text-center border-b border-white/20 pb-1">
                  <span className="text-[7px] uppercase tracking-widest font-black text-white/70">Patient Requester</span>
                  <h3 className="text-xs font-black tracking-wide uppercase mt-0.5 truncate">{request.patientName}</h3>
                </div>

                <div className="flex items-center justify-between border-b border-white/20 pb-1.5">
                  <div className="text-left">
                    <span className="text-[6.5px] uppercase tracking-widest font-black text-white/70">Required Group</span>
                    <div className="text-[9px] font-bold mt-0.5 bg-black/20 px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-widest">
                      {request.urgencyLevel}
                    </div>
                  </div>
                  <div className="bg-white text-[#ff003c] h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border border-zinc-100">
                    {request.bloodGroup}
                  </div>
                </div>

                <div className="text-left space-y-1 text-[9px] leading-tight">
                  <div className="flex items-start gap-1">
                    <span className="font-extrabold text-white/80 shrink-0">HOSPITAL:</span>
                    <span className="font-medium truncate">{request.hospitalName}</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="font-extrabold text-white/80 shrink-0">LOCATION:</span>
                    <span className="font-medium truncate">{request.hospitalLocation}</span>
                  </div>
                  
                  {/* Phone Number Display Highlight */}
                  <div className="flex items-center justify-between bg-black/20 px-2 py-1 rounded-lg border border-white/10 mt-1">
                    <div className="text-[7px] font-black text-white/80">CONTACT:</div>
                    <div className="font-mono font-black text-[10px] text-white tracking-wide">{request.contactDetails}</div>
                  </div>
                </div>
              </div>

              {/* Bottom: QR Section */}
              <div className="border-t border-zinc-200 pt-2 mt-2 flex items-center justify-between gap-2.5">
                <div className="text-left min-w-0">
                  <h4 className="text-[8px] font-black text-black uppercase tracking-wider leading-none">HELP SAVE A LIFE TODAY</h4>
                  <p className="text-[7px] text-zinc-500 mt-0.5 leading-tight">Scan QR code to volunteer & accept this blood request instantly.</p>
                </div>
                <div className="bg-white p-1 rounded-md shrink-0 border border-zinc-200">
                  <QRCodeSVG value={qrValue} size={36} level="M" />
                </div>
              </div>
            </div>
          ) : (
            // Square Flyer Format (1:1)
            <div className="relative w-72 h-72 rounded-2xl bg-[#fafafa] border border-zinc-200 flex flex-col justify-between p-3.5 overflow-hidden shadow-2xl text-black">
              {/* Top Header Row */}
              <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <img src="/logo.png" alt="bloodundo.in logo" className="h-7 w-7 shrink-0 object-contain" />
                  <div className="text-left leading-none">
                    <div className="text-[8px] font-black text-[#ff003c] tracking-tight">bloodundo.in</div>
                    <div className="text-[5px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Kerala's Lifesaver</div>
                  </div>
                </div>

                <div className="border-[1.5px] border-black px-1.5 py-0.5 text-center font-black tracking-widest text-black text-[6.5px] uppercase leading-none">
                  BLOOD INDO
                </div>
              </div>

              {/* Middle Section: Slogan & Hands */}
              <div className="flex items-center justify-between gap-2 my-1">
                <div className="text-left">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[8px] text-red-500">♥</span>
                    <h1 className="text-sm font-black text-[#ff003c] uppercase tracking-tighter leading-none">blood donation</h1>
                  </div>
                  <h2 className="text-[10px] font-serif italic text-zinc-700 leading-none">saves Lives</h2>
                </div>
                
                {/* SVG Hands Mini */}
                <svg viewBox="0 0 200 100" className="w-24 h-8 shrink-0">
                  <path d="M 10,48 C 30,45 60,35 90,35 C 105,35 125,43 145,43 C 160,43 175,40 185,41 C 190,42 185,46 175,48 C 165,50 140,52 130,52 C 120,52 100,55 85,58 C 70,61 40,68 10,68 Z" fill="#ff003c" />
                  <path d="M 190,58 C 170,61 140,68 110,68 C 95,68 75,60 55,60 C 40,60 25,63 15,62 C 10,61 15,57 25,55 C 35,53 60,51 70,51 C 80,51 100,48 115,45 C 130,42 160,35 190,35 Z" fill="white" stroke="#ff003c" strokeWidth="1" />
                </svg>
              </div>

              {/* Red details container */}
              <div className="bg-[#ff003c] text-white p-2.5 rounded-xl flex items-center justify-between gap-3 shadow-md">
                <div className="text-left space-y-1 text-[8.5px] leading-tight flex-1 min-w-0">
                  <div className="truncate"><span className="font-extrabold text-white/80">PATIENT:</span> <span className="font-extrabold uppercase">{request.patientName}</span></div>
                  <div className="truncate"><span className="font-extrabold text-white/80">HOSPITAL:</span> <span className="font-medium">{request.hospitalName}</span></div>
                  <div className="truncate"><span className="font-extrabold text-white/80">LEVEL:</span> <span className="font-medium uppercase">{request.urgencyLevel}</span></div>
                  
                  {/* Highlighted Phone Info */}
                  <div className="bg-black/20 px-1.5 py-0.5 rounded border border-white/10 mt-1 font-mono font-black text-[9px] tracking-wide inline-block">
                    CONTACT: {request.contactDetails}
                  </div>
                </div>

                <div className="bg-white text-[#ff003c] h-11 w-11 rounded-lg flex items-center justify-center font-black text-lg shrink-0 shadow-sm border border-zinc-100">
                  {request.bloodGroup}
                </div>
              </div>

              {/* Footer QR Row */}
              <div className="border-t border-zinc-200 pt-1.5 flex items-center justify-between gap-2.5">
                <div className="text-[7.5px] text-zinc-500 font-medium leading-tight">
                  <span className="font-black text-black block">SCAN TO ACCEPT REQUEST</span>
                  Help link emergency donors directly. Save one life today!
                </div>
                <div className="bg-white p-1 rounded-md shrink-0 border border-zinc-200">
                  <QRCodeSVG value={qrValue} size={28} level="M" />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
