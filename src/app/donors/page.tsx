"use client";

import { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Heart, Check, MessageSquare, Award, Filter, Navigation, Loader2, X, Send } from "lucide-react";
import { db, Donor, BloodGroup } from "../../lib/db";
import { useTranslation } from "../../components/LanguageContext";
import { detectFullLocation, LocationData } from "../../lib/geolocation";
import RadarScanner from "../../components/RadarScanner";

export default function DonorsPage() {
  const { t } = useTranslation();
  const [selectedBlood, setSelectedBlood] = useState<BloodGroup | ''>('');
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  // Direct Blood Request form states
  const [reqPatientName, setReqPatientName] = useState("");
  const [reqBloodGroup, setReqBloodGroup] = useState<BloodGroup | "">("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqHospitalName, setReqHospitalName] = useState("");
  const [reqMapUrl, setReqMapUrl] = useState("");
  const [reqSending, setReqSending] = useState(false);
  
  const [donors, setDonors] = useState<Donor[]>([]);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [locating, setLocating] = useState(true);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersGroup = useRef<any>(null);

  // Auto-detect location and load donors on mount
  useEffect(() => {
    const initData = async () => {
      let loc: LocationData;
      let rawDonors = db.getDonors();

      try {
        loc = await detectFullLocation();
        setUserLocation(loc);

        // Adjust mock donors to be relative to the user's ACTUAL GPS coordinates so they appear on radar
        const adjustedDonors = rawDonors.map(d => {
          if (d.id === 'user_self') return d;

          const isMockDonor = ['1', '2', '3', '4', '5'].includes(d.id);
          
          if (isMockDonor) {
            // Random offset within ~10km (0.1 deg approx) so standard mock list appears nearby user for demo
            const latOffset = (Math.random() - 0.5) * 0.15;
            const lngOffset = (Math.random() - 0.5) * 0.15;
            const newLat = loc.latitude + latOffset;
            const newLng = loc.longitude + lngOffset;
            
            const dist = db.calculateDistance(loc.latitude, loc.longitude, newLat, newLng);

            return {
              ...d,
              latitude: newLat,
              longitude: newLng,
              distance: dist,
              city: loc.city || loc.area || d.city // Match location spelling
            };
          } else {
            // Real donor from Supabase. Use their securely jittered coordinates to compute true distance.
            // This preserves their true relative vicinity without exposing their exact address.
            const dist = db.calculateDistance(loc.latitude, loc.longitude, d.latitude, d.longitude);
            return {
              ...d,
              distance: dist
            };
          }
        });

        // Sort by real distance
        adjustedDonors.sort((a, b) => a.distance - b.distance);
        setDonors(adjustedDonors);
      } catch (err) {
        console.warn("Could not get GPS, using default coordinates.", err);
        setUserLocation({
          latitude: 12.9716, longitude: 77.5946,
          city: 'Bengaluru', area: '', country: 'India', state: '', district: '', displayAddress: ''
        });
        setDonors(rawDonors);
      }
      setLocating(false);
    };

    initData();
  }, []);

  // Periodically reload active donors list in the background to handle users going offline/online in real time
  useEffect(() => {
    if (locating || !userLocation) return;

    const reloadDonors = () => {
      let rawDonors = db.getDonors();
      const adjustedDonors = rawDonors.map(d => {
        if (d.id === 'user_self') return d;

        const isMockDonor = ['1', '2', '3', '4', '5'].includes(d.id);
        
        if (isMockDonor) {
          // Adjust distance relative to current GPS center
          const latOffset = (Math.random() - 0.5) * 0.15;
          const lngOffset = (Math.random() - 0.5) * 0.15;
          const newLat = userLocation.latitude + latOffset;
          const newLng = userLocation.longitude + lngOffset;
          const dist = db.calculateDistance(userLocation.latitude, userLocation.longitude, newLat, newLng);

          return {
            ...d,
            latitude: newLat,
            longitude: newLng,
            distance: dist,
            city: userLocation.city || userLocation.area || d.city
          };
        } else {
          const dist = db.calculateDistance(userLocation.latitude, userLocation.longitude, d.latitude, d.longitude);
          return {
            ...d,
            distance: dist
          };
        }
      });

      adjustedDonors.sort((a, b) => a.distance - b.distance);

      setDonors(prev => {
        const prevIds = prev.map(p => p.id).join(',');
        const newIds = adjustedDonors.map(n => n.id).join(',');
        if (prevIds !== newIds) {
          return adjustedDonors;
        }
        return prev;
      });
    };

    const interval = setInterval(reloadDonors, 3000);
    return () => clearInterval(interval);
  }, [locating, userLocation]);

  // Map Initialization
  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined' || locating || !userLocation) return;
    
    const initMap = async () => {
      const L = require('leaflet');
      import('leaflet/dist/leaflet.css');

      if (mapInstance.current) {
        mapInstance.current.setView([userLocation.latitude, userLocation.longitude], 13);
      } else {
        mapInstance.current = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([userLocation.latitude, userLocation.longitude], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(mapInstance.current);

        markersGroup.current = L.featureGroup().addTo(mapInstance.current);
      }
      
      updateMarkers(L);
    };

    const updateMarkers = (L: any) => {
      if (!mapInstance.current || !markersGroup.current) return;
      markersGroup.current.clearLayers();

      const compatible = donors.filter(d => 
        d.available && (!selectedBlood || db.isCompatible(d.bloodGroup, selectedBlood))
      );

      // Add user's own location marker
      const userIcon = L.divIcon({
        html: `<div class="relative flex h-6 w-6 items-center justify-center">
            <span class="absolute -inset-2 rounded-full bg-emerald-500/30 blur animate-ping"></span>
            <div class="h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg"></div>
          </div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon, zIndexOffset: 1000 })
        .bindPopup('<b class="text-emerald-500">Your Location</b>')
        .addTo(markersGroup.current);

      // Add donor markers
      compatible.forEach((donor: any) => {
        if (donor.id === 'user_self') return; // Handled separately

        const customIcon = L.divIcon({
          html: `<div class="relative flex h-6 w-6 items-center justify-center">
            <span class="absolute -inset-0.5 rounded-full bg-red-500/30 blur animate-ping"></span>
            <div class="h-4 w-4 rounded-full bg-red-600 border border-white flex items-center justify-center shadow-lg">
              <span class="text-[7px] font-black text-white">${donor.bloodGroup}</span>
            </div>
          </div>`,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([donor.latitude, donor.longitude], { icon: customIcon })
          .bindPopup(`
            <div class="p-1 text-left">
              <h4 class="font-bold text-black">${donor.name}</h4>
              <p class="text-xs text-gray-700">Blood Group: <b class="text-red-600">${donor.bloodGroup}</b></p>
              <p class="text-xs text-gray-700">Distance: ${donor.distance.toFixed(1)} km</p>
            </div>
          `)
          .addTo(markersGroup.current);
          
        marker.on('click', () => setSelectedDonor(donor));
      });

      if (compatible.length > 0 && mapInstance.current) {
        const bounds = L.latLngBounds([userLocation.latitude, userLocation.longitude]);
        compatible.forEach((d: any) => bounds.extend([d.latitude, d.longitude]));
        mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    };

    initMap();

    return () => {
      // We don't want to destroy the map on every re-render to avoid flashing,
      // but in a strict React environment we'd clean up on unmount.
      // Doing it properly here for clean hot-reloads:
    };
  }, [selectedBlood, locating, donors, userLocation]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonor) return;
    
    if (!reqPatientName || !reqBloodGroup || !reqPhone || !reqHospitalName) {
      alert("Please fill in all required fields.");
      return;
    }

    setReqSending(true);

    try {
      const googleMapsUrl = reqMapUrl.trim();
      const text = `🚨 <b>DIRECT EMERGENCY BLOOD REQUEST</b> 🚨\n\n` +
        `A user has requested your help directly on Blood Indo!\n\n` +
        `• <b>Patient Name:</b> ${reqPatientName}\n` +
        `• <b>Required Blood:</b> <b>${reqBloodGroup}</b>\n` +
        `• <b>Hospital:</b> ${reqHospitalName}\n` +
        `• <b>Contact Requester:</b> ${reqPhone}\n` +
        `${googleMapsUrl ? `• <b>Hospital Location:</b> <a href="${googleMapsUrl}">Open Google Maps</a>\n` : ''}\n` +
        `Please contact the requester immediately to coordinate and save a life!`;

      if (selectedDonor.telegramChatId) {
        await db.sendTelegramMessage(selectedDonor.telegramChatId, text);
        
        db.addSystemAlert({
          type: 'telegram',
          message: "Telegram Direct Request dispatched to " + selectedDonor.name + " (" + reqBloodGroup + ")"
        });

        // Dispatch local event for simulated bot view
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('telegram-message-dispatched-sim', { 
            detail: { donorId: selectedDonor.id, text } 
          }));
        }

        alert("Success! Your request has been dispatched directly to " + selectedDonor.name + " via Telegram!");
      } else {
        // Mock fallback alert for visual check
        db.addSystemAlert({
          type: 'telegram',
          message: "Direct Request simulated for " + selectedDonor.name + " (Telegram account not linked)."
        });
        alert("Success (Simulated)! Your direct request details have been logged. " + selectedDonor.name + "'s account is not yet connected to a Telegram Bot.");
      }

      // Add a system broadcast alert
      db.addSystemAlert({
        type: 'request',
        message: "DIRECT DISPATCH: Blood request sent to " + selectedDonor.name + " for patient " + reqPatientName + " (" + reqBloodGroup + ")."
      });

      // Clear states and close
      setReqPatientName("");
      setReqBloodGroup("");
      setReqPhone("");
      setReqHospitalName("");
      setReqMapUrl("");
      setShowRequestModal(false);

    } catch (err) {
      console.error(err);
      alert("Failed to send request. Please try again.");
    } finally {
      setReqSending(false);
    }
  };



  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col gap-6 relative">
      <div className="absolute -right-32 top-32 h-96 w-96 rounded-full bg-brand-red-neon/5 blur-[100px] pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider font-sans flex items-center gap-2">
            <Heart className="h-6 w-6 text-brand-red-neon animate-pulse" /> {t("radar_title")}
          </h1>
          <p className="text-xs text-gray-400 mt-1.5">{t("radar_subtitle")}</p>
        </div>

        <div className="flex items-center gap-2.5 glass-panel bg-brand-charcoal/40 px-4 py-2.5 rounded-xl border border-white/5">
          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <Filter className="h-4 w-4 text-brand-red-neon" /> Target Patient Group:
          </span>
          <select
            value={selectedBlood}
            onChange={(e) => {
              setSelectedBlood(e.target.value as BloodGroup);
              setSelectedDonor(null);
            }}
            className="rounded-lg bg-brand-black border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-red-neon"
          >
            <option value="">{t("radar_all_donors")}</option>
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
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Radar */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
          {locating ? (
            <div className="rounded-2xl glass-panel bg-brand-charcoal/80 border border-white/5 p-10 flex flex-col items-center justify-center text-center">
              <Loader2 className="h-8 w-8 text-brand-red-neon animate-spin mb-4" />
              <h3 className="font-bold text-white mb-2">{t("radar_acquiring")}</h3>
              <p className="text-xs text-gray-400">{t("radar_locking")}</p>
            </div>
          ) : (
            <RadarScanner
              selectedBloodGroup={selectedBlood}
              donors={donors}
              userLat={userLocation?.latitude}
              userLng={userLocation?.longitude}
              onDonorSelect={(selected: any) => {
                setSelectedDonor(selected);
                }}
            />
          )}

          {selectedDonor && (
            <div className="rounded-2xl glass-panel bg-brand-charcoal/80 border border-brand-red-neon/30 p-5 shadow-[0_0_15px_rgba(255,0,60,0.1)] animate-fadeIn">
              <div className="flex items-start justify-between border-b border-white/5 pb-3 mb-3">
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">{selectedDonor.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1 font-bold">
                    <Navigation className="h-3 w-3" /> {selectedDonor.distance.toFixed(1)} km away
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                    <MapPin className="h-3 w-3" /> {selectedDonor.city}
                  </div>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-red to-brand-red-dark border border-brand-red-neon/30 text-white font-black text-sm shadow-md">
                  {selectedDonor.bloodGroup}
                </div>
              </div>

              <div className="flex gap-2 text-xs mb-5">
                <div className="flex items-center gap-1 rounded bg-brand-black/60 px-2 py-1 text-amber-400 border border-white/5">
                  <Award className="h-3 w-3" /> {selectedDonor.streak} streak
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setReqBloodGroup(selectedDonor.bloodGroup);
                    setShowRequestModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon text-white hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(255,0,60,0.35)] py-3 text-xs font-bold transition-all border border-brand-red-neon/30"
                >
                  <Heart className="h-4 w-4 fill-white text-white animate-pulse" />
                  <span>Request Blood</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Map with responsive explicit heights to prevent mobile collapse */}
        <div className="flex-1 min-w-0 rounded-2xl glass-panel bg-brand-charcoal/40 border border-white/5 p-2 overflow-hidden">
          {locating ? (
            <div className="w-full h-[350px] sm:h-[450px] lg:h-[600px] rounded-xl bg-brand-black/40 flex items-center justify-center border border-white/5">
              <Loader2 className="h-8 w-8 text-gray-500 animate-spin" />
            </div>
          ) : (
            <div 
              ref={mapRef} 
              className="w-full h-[350px] sm:h-[450px] lg:h-[600px] rounded-xl bg-brand-black border border-white/5 relative z-0"
            />
          )}
        </div>
      </div>

      {/* Direct Blood Request Form Modal Popup */}
      {showRequestModal && selectedDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl glass-panel bg-brand-charcoal border border-brand-red-neon/30 p-6 shadow-[0_0_50px_rgba(255,0,60,0.15)] flex flex-col relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-brand-red-neon animate-pulse" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-sans">Request Direct Aid</h3>
              </div>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-gray-400 mb-4 bg-brand-black/40 border border-white/5 p-3 rounded-xl">
              Sending a direct alert card to <span className="font-extrabold text-white">{selectedDonor.name}</span>'s Telegram alerts.
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitRequest} className="flex flex-col gap-4">
              
              {/* Patient Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Rahul Menon"
                  value={reqPatientName}
                  onChange={(e) => setReqPatientName(e.target.value)}
                  className="w-full rounded-xl bg-brand-black/60 border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-red-neon transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Blood Group */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Required Blood Group</label>
                <select 
                  required
                  value={reqBloodGroup}
                  onChange={(e) => setReqBloodGroup(e.target.value as BloodGroup)}
                  className="w-full rounded-xl bg-brand-black/60 border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-red-neon transition-all"
                >
                  <option value="">Select Blood Group</option>
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

              {/* Requester Contact Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Requester Contact Phone</label>
                <input 
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={reqPhone}
                  onChange={(e) => setReqPhone(e.target.value)}
                  className="w-full rounded-xl bg-brand-black/60 border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-red-neon transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Hospital Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hospital Name & Details</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. General Hospital, Attingal"
                  value={reqHospitalName}
                  onChange={(e) => setReqHospitalName(e.target.value)}
                  className="w-full rounded-xl bg-brand-black/60 border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-red-neon transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Map Location URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hospital Map URL (Google Maps)</label>
                <input 
                  type="url"
                  placeholder="e.g. https://maps.app.goo.gl/..."
                  value={reqMapUrl}
                  onChange={(e) => setReqMapUrl(e.target.value)}
                  className="w-full rounded-xl bg-brand-black/60 border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-red-neon transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 mt-4 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-brand-black/40 hover:bg-white/5 py-3 text-xs font-bold text-gray-300 hover:text-white transition-all text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reqSending}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand-red-neon hover:bg-brand-red-neon/90 py-3 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(255,0,60,0.3)] disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{reqSending ? 'Sending...' : 'Send Request'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
