"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Flame, ShieldAlert, Heart, Activity, MapPin, ChevronRight, Users, Send } from "lucide-react";
import { db, BloodGroup, UrgencyLevel } from "../lib/db";
import { useTranslation } from "../components/LanguageContext";

export default function Home() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ active: 0, donors: 0, saved: 432 });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [patientName, setPatientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O-");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalLocation, setHospitalLocation] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [urgencyLevel, setUrgencyLevel] = useState("Critical");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadStatsAndAlerts = () => {
      const requests = db.getRequests();
      const active = requests.filter(r => r.status === "Active").length;
      const donors = db.getDonors().filter(d => d.available).length;
      
      setStats({
        active,
        donors,
        saved: 450 + (requests.filter(r => r.status === "Fulfilled").length * 2)
      });

      setAlerts(db.getSystemAlerts().slice(0, 5));
    };

    loadStatsAndAlerts();
    const interval = setInterval(loadStatsAndAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !hospitalName || !hospitalLocation || !contactDetails) {
      alert("Please fill in all required fields.");
      return;
    }

    db.createRequest({
      patientName,
      bloodGroup: bloodGroup as BloodGroup,
      hospitalName,
      hospitalLocation,
      contactDetails,
      unitsNeeded,
      urgencyLevel: urgencyLevel as UrgencyLevel,
      notes: notes || `Urgent requirement for ${bloodGroup} blood at ${hospitalName}.`,
      countdownMinutes: urgencyLevel === "Critical" ? 45 : urgencyLevel === "Rare Blood" ? 90 : 120
    });

    setPatientName("");
    setHospitalName("");
    setHospitalLocation("");
    setContactDetails("");
    setNotes("");
    
    setIsDrawerOpen(false);
    window.location.href = "/feed";
  };

  return (
    <div className="relative min-h-screen bg-brand-black overflow-hidden flex flex-col justify-center items-center px-4 py-12">
      <div className="absolute -left-1/4 -top-1/4 h-[80vw] w-[80vw] rounded-full bg-brand-red-neon/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute -right-1/4 -bottom-1/4 h-[80vw] w-[80vw] rounded-full bg-brand-red-neon/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-5xl z-10 flex flex-col items-center text-center">
        <div className="w-full max-w-2xl mb-8 glass-panel bg-brand-red-dark/10 border border-brand-red-neon/20 rounded-full px-5 py-2.5 flex items-center gap-3 overflow-hidden shadow-[0_0_15px_rgba(255,0,60,0.05)]">
          <span className="flex h-2 w-2 shrink-0 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red-neon opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red-neon"></span>
          </span>
          
          <div className="flex-1 text-xs font-bold text-brand-red-glow uppercase tracking-wider overflow-hidden whitespace-nowrap text-ellipsis text-left">
            <span className="text-gray-400 font-medium lowercase italic mr-2">latest alert:</span>
            {alerts[0]?.message || "Initializing secure emergency matching gateways..."}
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4 uppercase font-sans">
          Securing Lives<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red-neon via-brand-red to-brand-red-glow">In Real-Time</span>
        </h1>
        
        <p className="max-w-xl text-sm sm:text-base text-gray-400 mb-12 font-medium leading-relaxed">
          {t("hero_subtitle")}
        </p>

        <div className="relative mb-16 flex items-center justify-center">
          <div className="absolute h-80 w-80 rounded-full border border-brand-red-neon/10 animate-ping opacity-25"></div>
          <div className="absolute h-64 w-64 rounded-full border border-brand-red-neon/15 animate-pulse opacity-40"></div>
          <div className="absolute h-48 w-48 rounded-full bg-brand-red-dark/10 border border-brand-red-neon/20 shadow-[0_0_50px_rgba(255,0,60,0.1)]"></div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full bg-gradient-to-br from-brand-red via-brand-red-deep to-brand-red-dark border border-brand-red-neon/50 text-white shadow-2xl shadow-brand-red-neon/40 hover:scale-105 active:scale-95 transition-all duration-300 group"
          >
            <Activity className="h-10 w-10 text-white animate-pulse mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black tracking-widest uppercase leading-none">TRIGGER</span>
            <span className="text-[9px] font-bold text-brand-red-glow tracking-widest uppercase mt-1 leading-none">BROADCAST</span>
            <span className="absolute -inset-0.5 rounded-full bg-brand-red-neon/30 blur opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>
        </div>

        <div className="w-full grid grid-cols-3 gap-3 sm:gap-6 mb-12">
          <div className="glass-panel bg-brand-charcoal/40 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col items-center">
            <ShieldAlert className="h-6 w-6 text-brand-red-neon mb-2" />
            <span className="text-2xl sm:text-4xl font-black text-white">{stats.active}</span>
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mt-1 tracking-wider">{t("hero_active_alerts")}</span>
          </div>
          
          <div className="glass-panel bg-brand-charcoal/40 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col items-center">
            <Users className="h-6 w-6 text-brand-red-glow mb-2" />
            <span className="text-2xl sm:text-4xl font-black text-white">{stats.donors}</span>
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mt-1 tracking-wider">Donors Active</span>
          </div>

          <div className="glass-panel bg-brand-charcoal/40 border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col items-center">
            <Heart className="h-6 w-6 text-emerald-400 mb-2" />
            <span className="text-2xl sm:text-4xl font-black text-emerald-400">{stats.saved}</span>
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mt-1 tracking-wider">{t("hero_lives_saved")}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
          <Link
            href="/feed"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 text-sm font-bold active:scale-95 transition-all"
          >
            Open Emergency Feed <ChevronRight className="h-4 w-4" />
          </Link>
          
          <Link
            href="/donors"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon hover:shadow-[0_0_15px_rgba(255,0,60,0.25)] text-white py-4 text-sm font-bold active:scale-95 transition-all"
          >
            Locate Nearby Donors
          </Link>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-brand-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="flex-1" onClick={() => setIsDrawerOpen(false)}></div>
          
          <div className="w-full max-w-md bg-brand-charcoal border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl h-screen overflow-y-auto animate-slideLeft">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Flame className="h-6 w-6 text-brand-red-neon" />
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider">New Emergency Alert</h2>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karan Malhotra"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Blood Group Required *</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                    >
                      <option value="O-">O- (Universal)</option>
                      <option value="O+">O+</option>
                      <option value="A-">A-</option>
                      <option value="A+">A+</option>
                      <option value="B-">B-</option>
                      <option value="B+">B+</option>
                      <option value="AB-">AB-</option>
                      <option value="AB+">AB+</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Emergency Level *</label>
                    <select
                      value={urgencyLevel}
                      onChange={(e) => setUrgencyLevel(e.target.value)}
                      className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                    >
                      <option value="Critical">Critical (45m)</option>
                      <option value="ICU">ICU Bed (60m)</option>
                      <option value="Rare Blood">Rare Blood (90m)</option>
                      <option value="Surgery">Surgery (2h)</option>
                      <option value="Urgent">Urgent (4h)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Hospital Center *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apollo Hospitals"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Hospital Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bannerghatta Road, Bengaluru"
                    value={hospitalLocation}
                    onChange={(e) => setHospitalLocation(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Contact Details *</label>
                    <input
                      type="text"
                      required
                      placeholder="Phone or Attendant"
                      value={contactDetails}
                      onChange={(e) => setContactDetails(e.target.value)}
                      className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Units Required *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={10}
                      value={unitsNeeded}
                      onChange={(e) => setUnitsNeeded(parseInt(e.target.value) || 1)}
                      className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Attendant Notes</label>
                  <textarea
                    placeholder="e.g. Severe blood loss in road accident. ICU Bed 4. Urgent requirement."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon py-3 text-sm font-bold text-white hover:shadow-[0_0_15px_rgba(255,0,60,0.3)]"
                >
                  <Send className="h-4 w-4" /> Dispatch Emergency Broadcast
                </button>
              </form>
            </div>
            
            <p className="text-[10px] text-gray-500 mt-6 leading-normal">
              WARNING: False dispatches are strictly monitored. Activating this broadcast dispatches automated text logs, telegram channels alerts, and phone synthesized dispatches.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}