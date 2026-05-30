"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, Flame, Plus, Filter, MessageSquare, Phone, Activity, Send } from "lucide-react";
import { db, BloodGroup, UrgencyLevel } from "../../lib/db";
import { useTranslation } from "../../components/LanguageContext";
import EmergencyCard from "../../components/EmergencyCard";
import PosterGenerator from "../../components/PosterGenerator";

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getProximityScore(req: any, userProfile: any): number {
  if (!userProfile) return 0;
  
  // 1. If GPS coordinates match, calculate a highly-accurate distance score
  if (userProfile.latitude && userProfile.longitude && req.latitude && req.longitude) {
    const dist = getDistance(userProfile.latitude, userProfile.longitude, req.latitude, req.longitude);
    return Math.max(0, 10000 - dist * 10);
  }
  
  // 2. Textual matching fallbacks
  let score = 0;
  const targetText = `${req.hospitalName || ''} ${req.hospitalLocation || ''} ${req.notes || ''}`.toLowerCase();
  
  const userCity = (userProfile.city || '').toLowerCase();
  const userDistrict = (userProfile.district || '').toLowerCase();
  const userState = (userProfile.state || '').toLowerCase();

  if (userCity && targetText.includes(userCity)) {
    score += 5000;
  }
  if (userDistrict && targetText.includes(userDistrict)) {
    score += 2000;
  }
  if (userState && targetText.includes(userState)) {
    score += 500;
  }
  
  return score;
}

function getAlertProximityScore(alert: any, userProfile: any): number {
  if (!userProfile) return 0;
  let score = 0;
  const textStr = (alert.message || '').toLowerCase();
  
  const userCity = (userProfile.city || '').toLowerCase();
  const userDistrict = (userProfile.district || '').toLowerCase();
  const userState = (userProfile.state || '').toLowerCase();
  
  if (userCity && textStr.includes(userCity)) {
    score += 5000;
  }
  if (userDistrict && textStr.includes(userDistrict)) {
    score += 2000;
  }
  if (userState && textStr.includes(userState)) {
    score += 500;
  }
  
  return score;
}

function FeedContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<any[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [myCreatedIds, setMyCreatedIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Tabs
  const [activeTab, setActiveTab] = useState("all"); // "all" | "my"
  
  // Filters
  const [selectedBlood, setSelectedBlood] = useState("All");
  const [selectedUrgency, setSelectedUrgency] = useState("All");
  
  // Poster Generator state
  const [activeRequestForPoster, setActiveRequestForPoster] = useState(null);
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  
  // Rapid Request Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O-");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalLocation, setHospitalLocation] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  const [unitsNeeded, setUnitsNeeded] = useState(2);
  const [urgencyLevel, setUrgencyLevel] = useState("Critical");
  const [notes, setNotes] = useState("");

  // Edit Request Form states
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState("");
  const [editPatientName, setEditPatientName] = useState("");
  const [editBloodGroup, setEditBloodGroup] = useState<BloodGroup>("O-");
  const [editHospitalName, setEditHospitalName] = useState("");
  const [editHospitalLocation, setEditHospitalLocation] = useState("");
  const [editContactDetails, setEditContactDetails] = useState("");
  const [editUnitsNeeded, setEditUnitsNeeded] = useState(2);
  const [editUnitsFulfilled, setEditUnitsFulfilled] = useState(0);
  const [editUrgencyLevel, setEditUrgencyLevel] = useState<UrgencyLevel>("Critical");
  const [editNotes, setEditNotes] = useState("");



  const loadData = () => {
    setRequests(db.getRequests());
    setSystemAlerts(db.getSystemAlerts().slice(0, 10));
    setUserProfile(db.getUserProfile());
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem('my_created_requests');
        setMyCreatedIds(stored ? JSON.parse(stored) : []);
      } catch (e) {}
    }
  };

  useEffect(() => {
    loadData();
    if (searchParams.get("trigger") === "true") {
      setIsFormOpen(true);
    }
    
    window.addEventListener('telegram-status-updated', loadData);
    const interval = setInterval(loadData, 3000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('telegram-status-updated', loadData);
    };
  }, [searchParams]);

  // Pre-fill contact details from profile on load
  useEffect(() => {
    if (userProfile && userProfile.phone && !contactDetails) {
      setContactDetails(userProfile.phone);
    }
  }, []);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !hospitalName || !hospitalLocation || !contactDetails) {
      alert("Please fill in all fields.");
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
      notes: notes || ("Severe blood emergency for " + bloodGroup + " at " + hospitalName + "."),
      countdownMinutes: urgencyLevel === "Critical" ? 45 : urgencyLevel === "Rare Blood" ? 90 : 120,
      latitude: userProfile?.latitude || undefined,
      longitude: userProfile?.longitude || undefined
    });

    setPatientName("");
    setHospitalName("");
    setHospitalLocation("");
    setNotes("");
    setIsFormOpen(false);
    loadData();
  };

  const handleOpenEdit = (req: any) => {
    setEditingRequestId(req.id);
    setEditPatientName(req.patientName);
    setEditBloodGroup(req.bloodGroup);
    setEditHospitalName(req.hospitalName);
    setEditHospitalLocation(req.hospitalLocation || "");
    setEditContactDetails(req.contactDetails || "");
    setEditUnitsNeeded(req.unitsNeeded);
    setEditUnitsFulfilled(req.unitsFulfilled || 0);
    setEditUrgencyLevel(req.urgencyLevel);
    setEditNotes(req.notes || "");
    setIsEditFormOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPatientName || !editHospitalName || !editHospitalLocation || !editContactDetails) {
      alert("Please fill in all fields.");
      return;
    }

    const result = await db.updateRequest(editingRequestId, {
      patientName: editPatientName,
      bloodGroup: editBloodGroup,
      hospitalName: editHospitalName,
      hospitalLocation: editHospitalLocation,
      contactDetails: editContactDetails,
      unitsNeeded: editUnitsNeeded,
      unitsFulfilled: editUnitsFulfilled,
      urgencyLevel: editUrgencyLevel,
      notes: editNotes || ("Severe blood emergency for " + editBloodGroup + " at " + editHospitalName + ".")
    });

    if (result.success) {
      setIsEditFormOpen(false);
      loadData();
    } else {
      alert(result.message);
    }
  };

  const handleDeleteRequest = async (req: any) => {
    if (confirm("Are you sure you want to delete patient " + req.patientName + "'s blood request? This will permanently remove it from the public feed.")) {
      const result = await db.deleteRequest(req.id);
      if (result.success) {
        loadData();
      } else {
        alert(result.message);
      }
    }
  };

  const handleOpenPoster = (req: any) => {
    setActiveRequestForPoster(req);
    setIsPosterOpen(true);
  };

  const handleMarkFulfilled = async (req: any) => {
    if (confirm("Are you sure you want to mark patient " + req.patientName + "'s blood request as successfully received?")) {
      const result = await db.markRequestAsFulfilled(req.id);
      if (result.success) {
        loadData();
      } else {
        alert(result.message);
      }
    }
  };

  const normalizePhone = (p?: string): string => {
    return (p || '').replace(/\D/g, '').slice(-10);
  };

  const filteredRequests = requests.filter((req: any) => {
    const bloodMatch = selectedBlood === "All" || req.bloodGroup === selectedBlood;
    const urgencyMatch = selectedUrgency === "All" || req.urgencyLevel === selectedUrgency;
    
    // Normalize phone numbers to make comparison robust against country codes/spaces
    const tabMatch = activeTab === "all" || myCreatedIds.includes(req.id) || (
      req.contactDetails && userProfile && userProfile.phone && 
      normalizePhone(req.contactDetails) === normalizePhone(userProfile.phone)
    );
    return bloodMatch && urgencyMatch && tabMatch;
  }).sort((a: any, b: any) => {
    const scoreA = getProximityScore(a, userProfile);
    const scoreB = getProximityScore(b, userProfile);
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Descending (highest score first)
    }
    
    // Fallback: sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const myRequestsCount = requests.filter((r: any) => 
    myCreatedIds.includes(r.id) || (
      r.contactDetails && userProfile && userProfile.phone && 
      normalizePhone(r.contactDetails) === normalizePhone(userProfile.phone)
    )
  ).length;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "request": return <Flame className="h-3.5 w-3.5 text-brand-red-neon animate-pulse" />;
      case "telegram": return <MessageSquare className="h-3.5 w-3.5 text-sky-400" />;
      case "voice_call": return <Phone className="h-3.5 w-3.5 text-emerald-400" />;
      default: return <Activity className="h-3.5 w-3.5 text-brand-red-glow" />;
    }
  };

  const tabClass = (isActive: boolean) =>
    "flex-1 sm:flex-initial text-center px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 " +
    (isActive
      ? "bg-brand-red-neon/15 text-brand-red-glow border border-brand-red-neon/30 shadow-[0_0_15px_rgba(255,0,60,0.15)]"
      : "text-gray-400 hover:text-white");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col md:flex-row gap-6 relative">
      <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-brand-red-neon/5 blur-[100px] pointer-events-none"></div>
      
      {/* Main Feed Container */}
      <div className="flex-1 min-w-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider font-sans flex items-center gap-2">
              <Flame className="h-6 w-6 text-brand-red-neon animate-pulse" /> {t("feed_title")}
            </h1>
            <p className="text-xs text-gray-400 mt-1.5">{t("feed_subtitle")}</p>
          </div>
          
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon px-5 py-3 text-xs font-bold text-white shadow-md shadow-brand-red-neon/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" /> Create Request Card
          </button>
        </div>

        {/* Sliding Tabs: All Broadcasts | My Requests */}
        <div className="flex p-1 rounded-xl bg-brand-black/60 border border-white/5 mb-6 w-full sm:w-fit gap-1">
          <button
            onClick={() => setActiveTab("all")}
            className={tabClass(activeTab === "all")}
          >
            All Broadcasts
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={tabClass(activeTab === "my")}
          >
            {"My Requests (" + myRequestsCount + ")"}
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl bg-brand-charcoal/40 border border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5 text-brand-red-neon" /> Filter Feed:
          </div>
          
          <select
            value={selectedBlood}
            onChange={(e) => setSelectedBlood(e.target.value)}
            className="rounded-lg bg-brand-black border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-red-neon"
          >
            <option value="All">All Blood Groups</option>
            <option value="O-">O- (Universal)</option>
            <option value="O+">O+</option>
            <option value="A-">A-</option>
            <option value="A+">A+</option>
            <option value="B-">B-</option>
            <option value="B+">B+</option>
            <option value="AB-">AB-</option>
            <option value="AB+">AB+</option>
          </select>

          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="rounded-lg bg-brand-black border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-red-neon"
          >
            <option value="All">All Urgency Standards</option>
            <option value="Critical">Critical</option>
            <option value="ICU">ICU Bed</option>
            <option value="Rare Blood">Rare Blood</option>
            <option value="Surgery">Surgery</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        {/* System Broadcasts */}
        {systemAlerts.length > 0 && activeTab === "all" && (
          <div className="mb-8 space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-red-neon" /> Local Broadcasts
            </h3>
            <div className="space-y-2">
              {[...systemAlerts].sort((a, b) => {
                const scoreA = getAlertProximityScore(a, userProfile);
                const scoreB = getAlertProximityScore(b, userProfile);
                if (scoreA !== scoreB) return scoreB - scoreA;
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
              }).slice(0, 5).map((alert, idx) => (
                <div key={alert.id || idx} className="p-3 rounded-xl bg-brand-charcoal/80 border border-brand-red-neon/30 flex gap-3 shadow-[0_0_15px_rgba(255,0,60,0.1)]">
                  <ShieldAlert className="h-5 w-5 text-brand-red-neon shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-brand-red-neon uppercase tracking-wider mb-0.5">{alert.type}</p>
                    <p className="text-sm text-gray-200 font-medium leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requests Feed Cards Grid */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-brand-charcoal/20 border border-dashed border-white/5 p-6">
            <ShieldAlert className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-400">No Match Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {activeTab === "my" 
                ? "You have not dispatched any active emergency requests yet." 
                : "There are currently no active emergency cards matching these filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredRequests.map((req: any) => (
              <EmergencyCard
                key={req.id}
                request={req}
                onUpdate={loadData}
                onOpenPoster={handleOpenPoster}
                onMarkFulfilled={handleMarkFulfilled}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </div>

      {/* Poster Studio Overlay */}
      <PosterGenerator
        isOpen={isPosterOpen}
        request={activeRequestForPoster}
        onClose={() => setIsPosterOpen(false)}
      />

      {/* Create Request Popup modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-brand-charcoal rounded-2xl border border-white/10 p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-brand-red-neon" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">{t("feed_new_alert")}</h2>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
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
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Blood Group *</label>
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
                  placeholder="e.g. Apollo Hospital"
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
                  placeholder="e.g. Cunningham Road, Bengaluru"
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
                  placeholder="Include any specific room numbers or patient details..."
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
                <Plus className="h-4 w-4" /> Dispatch Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Request Form Modal Popup */}
      {isEditFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-brand-charcoal rounded-2xl border border-brand-red-neon/30 p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-brand-red-neon" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Edit Emergency Request</h2>
              </div>
              <button
                onClick={() => setIsEditFormOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karan Malhotra"
                  value={editPatientName}
                  onChange={(e) => setEditPatientName(e.target.value)}
                  className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Blood Group *</label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value as BloodGroup)}
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
                    value={editUrgencyLevel}
                    onChange={(e) => setEditUrgencyLevel(e.target.value as UrgencyLevel)}
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
                  placeholder="e.g. Apollo Hospital"
                  value={editHospitalName}
                  onChange={(e) => setEditHospitalName(e.target.value)}
                  className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Hospital Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cunningham Road, Bengaluru"
                  value={editHospitalLocation}
                  onChange={(e) => setEditHospitalLocation(e.target.value)}
                  className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Contact Details *</label>
                  <input
                    type="text"
                    required
                    placeholder="Phone or Attendant"
                    value={editContactDetails}
                    onChange={(e) => setEditContactDetails(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Units Required</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={editUnitsNeeded}
                    onChange={(e) => setEditUnitsNeeded(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>
              </div>

              <div className="bg-brand-black/40 border border-white/5 p-3 rounded-xl space-y-3">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fulfillment Adjuster</span>
                
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-gray-300">Units Received</span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditUnitsFulfilled(prev => Math.max(0, prev - 1))}
                      className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-all text-xs"
                    >
                      -
                    </button>
                    <span className="text-sm font-extrabold text-white w-6 text-center">{editUnitsFulfilled}</span>
                    <button
                      type="button"
                      onClick={() => setEditUnitsFulfilled(prev => Math.min(editUnitsNeeded, prev + 1))}
                      className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-all text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 italic">
                  Status: {editUnitsFulfilled >= editUnitsNeeded ? 'Will mark as FULFILLED and auto-protect privacy' : 'Active emergency request'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Attendant Notes</label>
                <textarea
                  placeholder="Include any specific room numbers or patient details..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon py-3 text-sm font-bold text-white hover:shadow-[0_0_15px_rgba(255,0,60,0.3)]"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Feed() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading feed dynamics...</div>}>
      <FeedContent />
    </Suspense>
  );
}

