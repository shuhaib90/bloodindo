"use client";

import { useState, useEffect } from 'react';
import { ShieldAlert, Clock, MapPin, Share2, Heart, CheckCircle2, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BloodRequest, db } from '../lib/db';

interface EmergencyCardProps {
  request: BloodRequest;
  onUpdate?: () => void;
  onOpenPoster?: (req: BloodRequest) => void;
  onMarkFulfilled?: (req: BloodRequest) => void;
  allowFulfillOverride?: boolean;
  onEdit?: (req: BloodRequest) => void;
  onDelete?: (req: BloodRequest) => void;
}

export default function EmergencyCard({ request, onUpdate, onOpenPoster, onMarkFulfilled, allowFulfillOverride, onEdit, onDelete }: EmergencyCardProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isVolunteered, setIsVolunteered] = useState(false);
  const [loading, setLoading] = useState(false);

  const userProfile = db.getUserProfile();
  const isCreator = request.contactDetails === userProfile.phone || allowFulfillOverride;

  // Countdown timer logic
  useEffect(() => {
    const calculateTime = () => {
      const createdTime = new Date(request.createdAt).getTime();
      const expiresTime = createdTime + (request.countdownMinutes || 45) * 60 * 1000;
      const difference = expiresTime - Date.now();

      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      setTimeLeft(minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0') + ' Left');
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [request]);

  const handleVolunteer = async () => {
    if (isVolunteered) return;
    setLoading(true);
    
    setTimeout(() => {
      const userProfile = db.getUserProfile();
      const result = db.volunteerToDonate(request.id, userProfile.name, userProfile.bloodGroup || 'O-');
      
      setLoading(false);
      if (result.success) {
        setIsVolunteered(true);
        
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ff003c', '#ff3366', '#800000', '#ffffff']
        });
        
        if (onUpdate) onUpdate();
      } else {
        alert(result.message);
      }
    }, 1200);
  };

  const getUrgencyStyles = (level: string) => {
    switch (level) {
      case 'Critical':
        return {
          glow: 'shadow-[0_0_20px_rgba(255,0,60,0.25)] border-brand-red-neon/40',
          badge: 'bg-brand-red-neon/20 text-brand-red-glow border-brand-red-neon/30 animate-pulse',
          indicator: 'bg-brand-red-neon'
        };
      case 'ICU':
        return {
          glow: 'shadow-[0_0_15px_rgba(255,51,102,0.15)] border-brand-red/30',
          badge: 'bg-red-950/40 text-red-400 border-red-900/40',
          indicator: 'bg-red-500'
        };
      case 'Surgery':
        return {
          glow: 'shadow-[0_0_15px_rgba(255,51,102,0.15)] border-purple-500/25',
          badge: 'bg-purple-950/40 text-purple-400 border-purple-900/40',
          indicator: 'bg-purple-500'
        };
      case 'Rare Blood':
        return {
          glow: 'shadow-[0_0_20px_rgba(168,85,247,0.25)] border-purple-500/40',
          badge: 'bg-purple-950/40 text-purple-300 border-purple-500/30 animate-pulse',
          indicator: 'bg-purple-500'
        };
      default:
        return {
          glow: 'shadow-[0_0_15px_rgba(197,8,34,0.15)] border-brand-red-deep/20',
          badge: 'bg-brand-charcoal border-white/5 text-gray-300',
          indicator: 'bg-brand-red'
        };
    }
  };

  const styles = getUrgencyStyles(request.urgencyLevel);
  const percentageFilled = (request.unitsFulfilled / request.unitsNeeded) * 100;

  const cardGlowClass = "relative overflow-hidden rounded-2xl glass-panel bg-brand-charcoal/70 border p-5 transition-all duration-300 hover:translate-y-[-4px] hover:bg-brand-charcoal/90 " + styles.glow;

  const volunteerBtnClass = isVolunteered
    ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 cursor-default'
    : request.status !== 'Active'
    ? 'bg-brand-black/40 text-gray-500 border border-white/5 cursor-not-allowed'
    : 'bg-gradient-to-r from-brand-red to-brand-red-neon hover:shadow-[0_0_15px_rgba(255,0,60,0.3)] hover:scale-[1.02]';

  return (
    <div className={cardGlowClass}>
      <span className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-brand-red-neon/5 blur-3xl"></span>
      
      {/* Top Meta info */}
      <div className="flex items-center justify-between mb-4">
        <span className={"flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wider " + styles.badge}>
          <ShieldAlert className="h-3.5 w-3.5" />
          {request.urgencyLevel}
        </span>
        
        {request.status === 'Active' ? (
          <div className="flex items-center gap-1.5 rounded-full bg-brand-black/50 border border-white/5 px-2.5 py-1 text-xs font-semibold text-brand-red-glow">
            <Clock className="h-3.5 w-3.5 text-brand-red-neon animate-spin" />
            <span>{timeLeft}</span>
          </div>
        ) : (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 rounded-full px-3 py-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> FULFILLED
          </span>
        )}
      </div>

      {/* Main Stats Block */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-brand-red-dark via-brand-red-deep to-brand-red border border-brand-red-neon/30 text-white shadow-md shadow-brand-red-neon/15">
          <span className="text-2xl font-black tracking-tight">{request.bloodGroup}</span>
          <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75">Group</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate font-sans">
            {request.status === 'Active' ? request.patientName : "Blood Indo Donor Saved One Life! ❤️"}
          </h3>
          
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <MapPin className="h-3 w-3 text-brand-red-neon shrink-0" />
            <span className="truncate">
              {request.status === 'Active' ? request.hospitalName : "Details redacted for donor & patient privacy"}
            </span>
          </div>

          <div className="text-[10px] text-gray-500 mt-0.5 truncate pl-4">
            {request.status === 'Active' ? request.hospitalLocation : ""}
          </div>

          {/* Visible Phone Number */}
          {request.status === 'Active' && (
            <div className="flex items-center gap-1.5 text-xs mt-2 bg-brand-red-neon/5 rounded-lg px-2.5 py-1 border border-brand-red-neon/10 w-fit">
              <Phone className="h-3 w-3 text-brand-red-neon shrink-0 animate-pulse" />
              <span className="font-semibold text-gray-300">{"Contact: " + request.contactDetails}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <p className="text-xs text-gray-300 bg-brand-black/40 border border-white/5 rounded-xl p-3 mb-4 leading-relaxed italic">
        &ldquo;{request.status === 'Active' ? request.notes : "Thank you to our amazing lifesavers! Patient and donor privacy has been secured."}&rdquo;
      </p>

      {/* Fulfilled Progress Bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-1.5">
          <span>Donation Status</span>
          <span className="text-white">{request.unitsFulfilled} / {request.unitsNeeded} Units Saved</span>
        </div>
        <div className="h-2 w-full rounded-full bg-brand-black/60 overflow-hidden border border-white/5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-brand-red to-brand-red-neon shadow-[0_0_8px_rgba(255,0,60,0.5)] transition-all duration-700" 
            style={{ width: percentageFilled + '%' }}
          ></div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        

        {onMarkFulfilled && request.status === 'Active' && isCreator && (
          <button
            onClick={() => onMarkFulfilled(request)}
            className="flex h-11 px-3 items-center justify-center gap-1.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40 hover:text-white transition-all active:scale-95 text-xs font-bold shrink-0"
            title="Mark as Fulfill / Received"
          >
            <CheckCircle2 className="h-4 w-4" /> Received
          </button>
        )}

        {isCreator && (
          <>
            <button
              onClick={() => onEdit && onEdit(request)}
              className="flex h-11 px-3 items-center justify-center gap-1.5 rounded-xl bg-brand-charcoal border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 text-xs font-bold shrink-0"
              title="Edit Request"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(request)}
              className="flex h-11 px-3 items-center justify-center gap-1.5 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-950/40 hover:text-white transition-all active:scale-95 text-xs font-bold shrink-0"
              title="Delete Request"
            >
              Delete
            </button>
          </>
        )}

        {onOpenPoster && (
          <button
            onClick={() => onOpenPoster(request)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 shrink-0"
            title="Create Share Poster"
          >
            <Share2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
