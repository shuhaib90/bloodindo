"use client";

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Share2, Plus, Edit, Trash2, Heart, Award, Compass, Search, ExternalLink, Globe, Phone, Clock, FileText, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { db, DonationCamp } from '../../lib/db';
import { useTranslation } from '../../components/LanguageContext';
import confetti from 'canvas-confetti';

export default function CampsPage() {
  const { t } = useTranslation();
  const [camps, setCamps] = useState<DonationCamp[]>([]);
  const [profile, setProfile] = useState<any>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCamp, setEditingCamp] = useState<DonationCamp | null>(null);

  // Form fields
  const [campName, setCampName] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [venueName, setVenueName] = useState("");
  const [stateName, setStateName] = useState("Kerala");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [category, setCategory] = useState<DonationCamp['category']>("Blood Donation Camp");
  const [coverImage, setCoverImage] = useState("");

  // Saved / Registered status inside client memory
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
    
    // Load saved and registered events
    const saved = localStorage.getItem('bloodindo_saved_camps');
    if (saved) setSavedEventIds(JSON.parse(saved));

    const registered = localStorage.getItem('bloodindo_registered_camps');
    if (registered) setRegisteredEventIds(JSON.parse(registered));
  }, []);

  const loadData = () => {
    setCamps(db.getCamps());
    setProfile(db.getUserProfile());
  };

  const handleSaveEvent = (id: string) => {
    let updated = [...savedEventIds];
    if (updated.includes(id)) {
      updated = updated.filter(item => item !== id);
    } else {
      updated.push(id);
    }
    setSavedEventIds(updated);
    localStorage.setItem('bloodindo_saved_camps', JSON.stringify(updated));
  };

  const handleRegisterEvent = (id: string) => {
    if (registeredEventIds.includes(id)) return;
    
    const updated = [...registeredEventIds, id];
    setRegisteredEventIds(updated);
    localStorage.setItem('bloodindo_registered_camps', JSON.stringify(updated));

    // Throw beautiful confetti celebration!
    confetti({
      particleCount: 120,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#ff003c', '#ffffff', '#00ff6c']
    });

    alert("Success! You have registered for this donation event. We will send you updates and details shortly.");
  };

  const handleShareEvent = (camp: DonationCamp) => {
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/camps?id=${camp.id}` 
      : `https://bloodundo.in/camps?id=${camp.id}`;
    navigator.clipboard.writeText(url);
    alert(`Success! Event link copied to clipboard: ${url}`);
  };

  const handleAddToCalendar = (camp: DonationCamp) => {
    // Generate clean .ics dynamic calendar download file!
    const title = encodeURIComponent(camp.campName);
    const desc = encodeURIComponent(camp.description);
    const dateStr = camp.eventDate.replace(/-/g, '');
    const start = `${dateStr}T${camp.startTime.replace(/:/g, '')}00`;
    const end = `${dateStr}T${camp.endTime.replace(/:/g, '')}00`;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
CLASS:PUBLIC
DESCRIPTION:${camp.description}
DTSTART:${start}
DTEND:${end}
LOCATION:${camp.venueName}\\, ${camp.city}\\, ${camp.district}
SUMMARY:${camp.campName}
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${camp.campName.toLowerCase().replace(/\s+/g, '_')}_reminder.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openForm = (camp: DonationCamp | null = null) => {
    if (camp) {
      setEditingCamp(camp);
      setCampName(camp.campName);
      setOrganizerName(camp.organizerName);
      setDescription(camp.description);
      setEventDate(camp.eventDate);
      setStartTime(camp.startTime);
      setEndTime(camp.endTime);
      setVenueName(camp.venueName);
      setStateName(camp.state);
      setDistrict(camp.district);
      setCity(camp.city);
      setArea(camp.area);
      setMapsUrl(camp.mapsUrl);
      setContactNumber(camp.contactNumber);
      setRegistrationLink(camp.registrationLink || "");
      setCategory(camp.category);
      setCoverImage(camp.coverImage || "");
    } else {
      setEditingCamp(null);
      setCampName("");
      setOrganizerName(profile?.name || "");
      setDescription("");
      setEventDate("");
      setStartTime("09:00");
      setEndTime("17:00");
      setVenueName("");
      setStateName("Kerala");
      setDistrict(profile?.district || "");
      setCity(profile?.city || "");
      setArea(profile?.area || "");
      setMapsUrl("");
      setContactNumber(profile?.phone || "");
      setRegistrationLink("");
      setCategory("Blood Donation Camp");
      setCoverImage("");
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName || !organizerName || !eventDate || !venueName || !city || !district || !stateName || !contactNumber) {
      alert("Please complete all required fields.");
      return;
    }

    const defaultImages: Record<DonationCamp['category'], string> = {
      'Blood Donation Camp': 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=600',
      'Awareness Program': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
      'Medical Camp': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
      'Hospital Drive': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
      'NGO Event': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600',
      'Emergency Donation Drive': 'https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&q=80&w=600'
    };

    const finalCover = coverImage || defaultImages[category];

    const campPayload = {
      campName,
      organizerName,
      description,
      eventDate,
      startTime,
      endTime,
      venueName,
      state: stateName,
      district,
      city,
      area,
      mapsUrl: mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(venueName + ', ' + city)}`,
      contactNumber,
      registrationLink: registrationLink || undefined,
      category,
      coverImage: finalCover,
      organizerLogo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=100',
      createdBy: profile?.phone || 'admin'
    };

    if (editingCamp) {
      db.updateCamp(editingCamp.id, campPayload);
      alert("Success! Donation camp details updated.");
    } else {
      db.createCamp(campPayload);
      alert("Success! Your blood donation camp is now live and alerts have been sent to local matching donors!");
    }

    setIsFormOpen(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this blood donation camp?")) {
      db.deleteCamp(id);
      loadData();
    }
  };

  const handleMarkCompleted = (id: string) => {
    if (confirm("Would you like to mark this blood donation event as successfully completed?")) {
      db.updateCamp(id, { isCompleted: true });
      loadData();
    }
  };

  // Filter camps based on search queries
  const filteredCamps = camps.filter(camp => {
    // Completed camps should disappear from public listings
    if (camp.isCompleted) return false;

    const textStr = (camp.campName + ' ' + camp.description + ' ' + camp.venueName + ' ' + camp.organizerName).toLowerCase();
    const queryMatch = textStr.includes(searchQuery.toLowerCase());
    
    const catMatch = selectedCategory === "All" || camp.category === selectedCategory;
    const distMatch = selectedDistrict === "All" || camp.district.toLowerCase() === selectedDistrict.toLowerCase();
    const cityMatch = selectedCity === "All" || camp.city.toLowerCase() === selectedCity.toLowerCase();

    return queryMatch && catMatch && distMatch && cityMatch;
  });

  // Extract filter list values dynamically
  const districtOptions = Array.from(new Set(camps.map(c => c.district)));
  const cityOptions = Array.from(new Set(camps.map(c => c.city)));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col gap-6 relative text-white">
      {/* Background neon blur */}
      <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-brand-red-neon/5 blur-[100px] pointer-events-none"></div>
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider font-sans flex items-center gap-2">
            <Compass className="h-6 w-6 text-brand-red-neon animate-pulse" /> Camps & Events Hub
          </h1>
          <p className="text-xs text-gray-400 mt-1.5">Discover nearby blood donation camps, NGO awareness drives, and schedule reminders instantly.</p>
        </div>

        {profile?.isLoggedIn && (
          <button
            onClick={() => openForm(null)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon px-5 py-3 text-xs font-bold text-white shadow-md shadow-brand-red-neon/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" /> Submit Donation Camp
          </button>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-brand-charcoal/40 border border-white/5">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-brand-black border border-white/10 text-xs text-white focus:outline-none focus:border-brand-red-neon"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg bg-brand-black border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-red-neon"
        >
          <option value="All">All Categories</option>
          <option value="Blood Donation Camp">Blood Donation Camp</option>
          <option value="Awareness Program">Awareness Program</option>
          <option value="Medical Camp">Medical Camp</option>
          <option value="Hospital Drive">Hospital Drive</option>
          <option value="NGO Event">NGO Event</option>
          <option value="Emergency Donation Drive">Emergency Donation Drive</option>
        </select>

        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="rounded-lg bg-brand-black border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-red-neon"
        >
          <option value="All">All Districts</option>
          {districtOptions.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="rounded-lg bg-brand-black border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-red-neon"
        >
          <option value="All">All Cities</option>
          {cityOptions.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Events display grid */}
      {filteredCamps.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-brand-charcoal/20 border border-white/5 rounded-2xl">
          <Calendar className="h-10 w-10 text-zinc-500 mb-2.5" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Camps Scheduled</h3>
          <p className="text-xs text-zinc-400 mt-1">There are no upcoming blood donation camps or awareness events listed for this selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {filteredCamps.map((camp) => {
            const isCreator = profile?.phone === camp.createdBy || camp.createdBy === 'admin';
            
            return (
              <div 
                key={camp.id}
                className={`glass-panel bg-brand-charcoal/40 border rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all hover:scale-[1.01] ${
                  camp.isCompleted 
                    ? 'border-white/5 opacity-60' 
                    : 'border-white/5 hover:border-brand-red-neon/30 hover:shadow-[0_0_20px_rgba(255,0,60,0.08)]'
                }`}
              >
                {/* Banner image */}
                <div className="relative h-44 w-full bg-brand-black">
                  <img 
                    src={camp.coverImage} 
                    alt={camp.campName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-transparent to-transparent"></div>
                  
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 bg-brand-red-neon/20 border border-brand-red-neon/40 text-brand-red-glow text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md">
                    {camp.category}
                  </span>

                  {/* Completed tag */}
                  {camp.isCompleted && (
                    <span className="absolute top-3 right-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md">
                      Completed
                    </span>
                  )}
                </div>

                {/* Content block */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-white leading-tight truncate">{camp.campName}</h3>
                    
                    {/* Organizer detail */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <User className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Organizer: <span className="text-white font-bold">{camp.organizerName}</span></span>
                    </div>

                    {/* Date & Time details */}
                    <div className="flex items-center gap-4 text-[11px] text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-brand-red-neon" />
                        <span>{camp.eventDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{camp.startTime} - {camp.endTime}</span>
                      </div>
                    </div>

                    {/* Venue Details */}
                    <div className="flex items-start gap-1.5 text-xs text-zinc-400">
                      <MapPin className="h-3.5 w-3.5 text-brand-red-neon shrink-0 mt-0.5" />
                      <div className="text-left">
                        <p className="text-white font-bold leading-none">{camp.venueName}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{camp.area}, {camp.city}, {camp.district}</p>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 pt-1">{camp.description}</p>
                  </div>

                  {/* Action row */}
                  <div className="space-y-3 pt-2">
                    <div className="flex gap-2">
                      {/* Register Button */}
                      <button
                        onClick={() => handleRegisterEvent(camp.id)}
                        disabled={camp.isCompleted || registeredEventIds.includes(camp.id)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
                          registeredEventIds.includes(camp.id)
                            ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 cursor-default'
                            : camp.isCompleted
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-brand-red to-brand-red-neon text-white shadow-brand-red-neon/15 active:scale-95'
                        }`}
                      >
                        {registeredEventIds.includes(camp.id) ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Registered
                          </>
                        ) : (
                          <>
                            <Heart className="h-3.5 w-3.5" /> Register Drive
                          </>
                        )}
                      </button>

                      {/* Map Direction Link */}
                      <a
                        href={camp.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-zinc-900 border border-white/5 hover:border-white/20 text-zinc-300 hover:text-white transition-all flex items-center justify-center active:scale-95"
                        title="View Directions"
                      >
                        <Compass className="h-4 w-4" />
                      </a>
                    </div>

                    {/* Secondary Tool row */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <div className="flex gap-2">
                        {/* Save Toggle */}
                        <button
                          onClick={() => handleSaveEvent(camp.id)}
                          className={`text-xs flex items-center gap-1 font-bold ${
                            savedEventIds.includes(camp.id) ? 'text-brand-red-glow' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${savedEventIds.includes(camp.id) ? 'fill-brand-red-neon' : ''}`} />
                          {savedEventIds.includes(camp.id) ? 'Saved' : 'Save'}
                        </button>
                        
                        {/* Add to Calendar ICS */}
                        <button
                          onClick={() => handleAddToCalendar(camp)}
                          className="text-xs flex items-center gap-1 text-zinc-500 hover:text-zinc-300 font-bold ml-2.5"
                        >
                          <Clock className="h-3.5 w-3.5" /> Calendar
                        </button>
                      </div>

                      {/* Share link */}
                      <button
                        onClick={() => handleShareEvent(camp)}
                        className="text-xs flex items-center gap-1 text-zinc-500 hover:text-zinc-300 font-bold"
                      >
                        <Share2 className="h-3.5 w-3.5" /> Invite
                      </button>
                    </div>

                    {/* Organizer Controls */}
                    {isCreator && !camp.isCompleted && (
                      <div className="flex gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => openForm(camp)}
                          className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase rounded-lg border border-white/5 flex items-center justify-center gap-1"
                        >
                          <Edit className="h-3 w-3" /> Edit
                        </button>
                        
                        <button
                          onClick={() => handleMarkCompleted(camp.id)}
                          className="flex-1 py-1.5 bg-emerald-950/20 hover:bg-emerald-900/20 text-emerald-400 text-[10px] font-bold uppercase rounded-lg border border-emerald-500/10 flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Complete
                        </button>

                        <button
                          onClick={() => handleDelete(camp.id)}
                          className="py-1.5 px-2 bg-red-950/20 hover:bg-red-900/20 text-red-400 rounded-lg border border-red-500/10 flex items-center justify-center active:scale-95"
                          title="Delete Camp"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBMISSION MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-brand-charcoal rounded-2xl border border-white/10 p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-brand-red-neon animate-pulse" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                  {editingCamp ? "Edit Donation Camp" : "Register Donation Camp"}
                </h2>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Camp Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Attingal Blood Donation Drive"
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Organizer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Attingal Youth Club"
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Camp Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                >
                  <option value="Blood Donation Camp">Blood Donation Camp</option>
                  <option value="Awareness Program">Awareness Program</option>
                  <option value="Medical Camp">Medical Camp</option>
                  <option value="Hospital Drive">Hospital Drive</option>
                  <option value="NGO Event">NGO Event</option>
                  <option value="Emergency Donation Drive">Emergency Donation Drive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Event Description *</label>
                <textarea
                  required
                  placeholder="Tell potential donors about the camp, requirements, rewards, or specific details."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Date *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">End Time *</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Venue Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Town Hall Hall A"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Area *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chirayinkeezhu Rd"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Attingal"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thiruvananthapuram"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kerala"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Contact Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Maps URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="e.g. https://maps.google.com/..."
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Registration Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="e.g. https://organizer.com/form"
                    value={registrationLink}
                    onChange={(e) => setRegistrationLink(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Cover Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="e.g. https://images.unsplash.com/..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-brand-red to-brand-red-neon text-white font-bold rounded-xl text-xs shadow-md shadow-brand-red-neon/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {editingCamp ? "Save Changes" : "Dispatch Event Listing"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
