"use client";

import { useState, useEffect } from 'react';
import { Building2, Flame, Plus, ShieldAlert, Activity, CheckCircle2, Volume2, BarChart3 } from "lucide-react";
import { db, BloodRequest, BloodGroup, UrgencyLevel } from "../../lib/db";
import { useTranslation } from "../../components/LanguageContext";

export default function HospitalPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [inventory, setInventory] = useState({
    'O-': 2,
    'O+': 8,
    'A-': 1,
    'A+': 12,
    'B-': 3,
    'B+': 15,
    'AB-': 0,
    'AB+': 10
  });

  // Form state
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('Critical');
  const [notes, setNotes] = useState('');

  const loadData = () => {
    setRequests(db.getRequests());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName) {
      alert("Please enter patient name.");
      return;
    }

    db.createRequest({
      patientName,
      bloodGroup,
      hospitalName: 'Apollo Hospitals',
      hospitalLocation: 'Bannerghatta Road, Bengaluru',
      contactDetails: '+91 11223 33445',
      unitsNeeded,
      urgencyLevel,
      notes: notes || `Scheduled ${urgencyLevel} blood dispatch for ${patientName}.`,
      countdownMinutes: urgencyLevel === 'Critical' ? 45 : urgencyLevel === 'Rare Blood' ? 90 : 120
    });

    setPatientName('');
    setNotes('');
    loadData();
    alert("Emergency broadcast dispatched! Automated calls and logs are active.");
  };

  const handleRestock = (group: BloodGroup) => {
    setInventory(prev => ({
      ...prev,
      [group]: prev[group] + 5
    }));
    db.addSystemAlert({
      type: 'volunteer',
      message: `INVENTORY UPDATE: Apollo Hospitals restocked 5 units of ${group} blood.`
    });
  };

  const handleMarkReceived = (id: string, name: string) => {
    if (confirm("Are you sure you want to mark patient " + name + "'s blood request as successfully received?")) {
      const result = db.markRequestAsFulfilled(id);
      if (result.success) {
        loadData();
      } else {
        alert(result.message);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col gap-6 relative">
      <div className="absolute -right-32 top-32 h-96 w-96 rounded-full bg-brand-red-neon/5 blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider font-sans flex items-center gap-2">
            <Building2 className="h-6 w-6 text-brand-red-neon" /> Hospital Consultant Panel
          </h1>
          <p className="text-xs text-gray-400 mt-1.5">Manage instant blood dispatches, active patient wards, and interactive blood bank inventories.</p>
        </div>

        <div className="flex items-center gap-3 glass-panel bg-brand-charcoal/40 px-4 py-2.5 rounded-xl border border-white/5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-white uppercase tracking-wider">Apollo Hospitals (LIVE)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Dispatcher & Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-panel bg-brand-charcoal/40 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
              <Flame className="h-5 w-5 text-brand-red-neon" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Rapid Emergency Dispatcher</h3>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                      className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                    >
                      <option value="O-">O-</option>
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
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Units</label>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Emergency Level *</label>
                  <select
                    value={urgencyLevel}
                    onChange={(e) => setUrgencyLevel(e.target.value as UrgencyLevel)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  >
                    <option value="Critical">Critical (45m)</option>
                    <option value="ICU">ICU Bed (60m)</option>
                    <option value="Rare Blood">Rare Blood (90m)</option>
                    <option value="Surgery">Surgery (2h)</option>
                    <option value="Urgent">Urgent (4h)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Additional Attendant Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 204 Intensive Care"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon py-3.5 text-xs font-bold text-white hover:shadow-[0_0_15px_rgba(255,0,60,0.3)]"
              >
                <Plus className="h-4 w-4" /> Dispatch Emergency Broadcast
              </button>
            </form>
          </div>

          {/* Active Hospital Requests */}
          <div className="glass-panel bg-brand-charcoal/40 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
              <Activity className="h-5 w-5 text-brand-red-neon" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Hospital Dispatches</h3>
            </div>

            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 rounded-xl bg-brand-black/40 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-brand-red-dark/30 border border-brand-red-neon/30 flex items-center justify-center font-bold text-sm text-brand-red-glow">
                      {req.bloodGroup}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{req.patientName}</h4>
                      <p className="text-[10px] text-gray-500">
                        required {req.unitsNeeded} units • {req.urgencyLevel}
                      </p>
                    </div>
                  </div>

                  <div>
                    {req.status === 'Active' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMarkReceived(req.id, req.patientName)}
                          className="text-[9px] font-bold text-emerald-400 hover:text-white bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-2.5 py-1 transition-all"
                        >
                          Mark Received
                        </button>
                        <span className="text-[10px] font-bold text-brand-red-glow bg-brand-red-dark/20 border border-brand-red-neon/20 px-2.5 py-1 rounded-full animate-pulse">
                          BROADCAST ACTIVE
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        FULFILLED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: inventory */}
        <div className="w-full z-10">
          <div className="glass-panel bg-brand-charcoal/40 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
              <BarChart3 className="h-5 w-5 text-brand-red-neon" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">BloodBank Inventory</h3>
            </div>

            <div className="space-y-4.5">
              {Object.entries(inventory).map(([group, units]) => {
                const isLow = units <= 3;
                const percentage = Math.min(100, (units / 20) * 100);
                return (
                  <div key={group} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={isLow ? 'text-brand-red-glow' : 'text-gray-400'}>
                        {group} {isLow && '(ALERT LOW)'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-white">{units} units</span>
                        <button
                          onClick={() => handleRestock(group as BloodGroup)}
                          className="text-[9px] text-sky-400 hover:underline"
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-brand-black/60 overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full ${
                          isLow
                            ? 'bg-gradient-to-r from-brand-red to-brand-red-neon shadow-[0_0_6px_rgba(255,0,60,0.4)]'
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
