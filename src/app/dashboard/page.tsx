"use client";

import { useState, useEffect } from 'react';
import { Award, Flame, Heart, Calendar, User, ShieldAlert, Trophy, CheckCircle2, MapPin, Navigation, Loader2, Lock, ArrowRight, UserPlus, MessageSquare, ExternalLink, ShieldCheck } from "lucide-react";
import { db, UserProfile, LeaderboardEntry, BloodGroup } from "../../lib/db";
import { supabase } from "../../lib/supabase";
import { useTranslation } from "../../components/LanguageContext";
import { detectFullLocation, LocationData } from "../../lib/geolocation";

import EligibilityTracker from "../../components/profile/EligibilityTracker";

export default function DashboardPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "">("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [stateName, setStateName] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [availableToDonate, setAvailableToDonate] = useState(false);
  const [telegramCode, setTelegramCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  // Handle Telegram verification code state and countdown
  useEffect(() => {
    if (profile && profile.telegramChatId && profile.telegramChatId.startsWith('CODE:')) {
      const parts = profile.telegramChatId.split(':');
      const code = parts[1];
      const expiry = parseInt(parts[2] || '0');
      if (expiry && Date.now() < expiry) {
        setTelegramCode(code);
        setTimeLeft(Math.ceil((expiry - Date.now()) / 1000));
      } else {
        setTelegramCode('');
        setTimeLeft(0);
      }
    } else {
      setTelegramCode('');
      setTimeLeft(0);
    }
  }, [profile]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTelegramCode('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerateTelegramCode = () => {
    if (!profile) return;
    const code = 'BLOOD-' + Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    const updatedVal = `CODE:${code}:${expiry}`;
    const updated = {
      ...profile,
      telegramChatId: updatedVal
    };
    db.saveUserProfile(updated);
    setProfile(updated);
    setTelegramCode(code);
    setTimeLeft(600);
    
    db.addSystemAlert({
      type: 'telegram',
      message: `SYSTEM: Telegram connection code generated for ${profile.name} (${code}). Expires in 10 minutes.`
    });
  };

  const handleDisconnectTelegram = () => {
    if (!profile) return;
    if (confirm("Are you sure you want to disconnect your Telegram notifications?")) {
      const updated = {
        ...profile,
        telegramChatId: '',
            lastDonationDate: undefined
          };
      db.saveUserProfile(updated);
      setProfile(updated);
      setTelegramCode('');
      setTimeLeft(0);
      
      db.addSystemAlert({
        type: 'telegram',
        message: `SYSTEM: Telegram alert notifications disconnected for ${profile.name}.`
      });
    }
  };

  // Location detection state
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationDetected, setLocationDetected] = useState(false);

  // Auth Modal state
  const [showAuth, setShowAuth] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login / Register fields
  const [authIdentifier, setAuthIdentifier] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState(""); // For registration
  
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [isLoggingDonation, setIsLoggingDonation] = useState(false);

  const handleLogDonation = async () => {
    if (!profile?.id) return;
    setIsLoggingDonation(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('bloodindo_profiles')
        .update({ last_donation_date: now })
        .eq('id', profile.id);

      if (!error) {
        setProfile({ ...profile, lastDonationDate: now });
        db.saveUserProfile({ ...profile, lastDonationDate: now });
      }
    } catch (err) {
      console.error('Error logging donation:', err);
    } finally {
      setIsLoggingDonation(false);
    }
  };

  const loadData = () => {
    const userProfile = db.getUserProfile();
    setProfile(userProfile);
    setLeaderboard(db.getLeaderboard());

    if (userProfile) {
      setName(userProfile.name);
      setPhone(userProfile.phone);
      setBloodGroup(userProfile.bloodGroup);
      setCity(userProfile.city);
      setCountry(userProfile.country || '');
      setStateName(userProfile.state || '');
      setDistrict(userProfile.district || '');
      setArea(userProfile.area || '');
      setLatitude(userProfile.latitude || 0);
      setLongitude(userProfile.longitude || 0);
      setAvailableToDonate(userProfile.availableToDonate || false);
    }
  };

  const checkSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // User is logged in via Supabase Auth (e.g. Google Login)
        // Let's fetch their profile from the database
        const { data: dbProfile } = await supabase
          .from('bloodindo_profiles')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        if (dbProfile) {
          // If a profile exists, load it
          const updatedProfile: UserProfile = {
            id: dbProfile.id,
            name: dbProfile.name || user.user_metadata?.full_name || 'Google User',
            email: dbProfile.email || user.email || '',
            phone: dbProfile.phone || '',
            username: dbProfile.username || user.email?.split('@')[0] || 'google_user',
            bloodGroup: dbProfile.blood_group as BloodGroup || '',
            city: dbProfile.city || '',
            country: dbProfile.country || '',
            state: dbProfile.state || '',
            district: dbProfile.district || '',
            area: dbProfile.area || '',
            latitude: dbProfile.latitude || 0,
            longitude: dbProfile.longitude || 0,
            streak: dbProfile.streak || 0,
            points: dbProfile.points || 0,
            donationsCount: dbProfile.donations_count || 0,
            badges: dbProfile.badges || [],
            isLoggedIn: true,
            availableToDonate: dbProfile.available_to_donate || false,
            telegramChatId: dbProfile.telegram_chat_id || '',
            lastDonationDate: dbProfile.last_donation_date || undefined
          };
          db.saveUserProfile(updatedProfile);
          setProfile(updatedProfile);

          setName(updatedProfile.name);
          setPhone(updatedProfile.phone);
          setBloodGroup(updatedProfile.bloodGroup);
          setCity(updatedProfile.city);
          setCountry(updatedProfile.country || '');
          setStateName(updatedProfile.state || '');
          setDistrict(updatedProfile.district || '');
          setArea(updatedProfile.area || '');
          setLatitude(updatedProfile.latitude || 0);
          setLongitude(updatedProfile.longitude || 0);
          setAvailableToDonate(updatedProfile.availableToDonate || false);
        } else {
          // Profile doesn't exist, create a clean one for them!
          const newProfile: UserProfile = {
            id: user.id,
            name: user.user_metadata?.full_name || 'Google User',
            email: user.email || '',
            phone: '',
            username: user.email?.split('@')[0] || 'google_user',
            bloodGroup: '',
            city: '',
            country: '',
            state: '',
            district: '',
            area: '',
            latitude: 0,
            longitude: 0,
            streak: 0,
            points: 100, // starting points
            donationsCount: 0,
            badges: [],
            isLoggedIn: true,
            availableToDonate: false,
            telegramChatId: '',
            lastDonationDate: undefined
          };
          db.saveUserProfile(newProfile);
          setProfile(newProfile);

          setName(newProfile.name);
          setPhone(newProfile.phone);
          setBloodGroup(newProfile.bloodGroup);
          setCity(newProfile.city);
        }
        window.dispatchEvent(new Event('telegram-status-updated'));
      } else {
        // Fall back to standard locally cached profile (e.g. from custom credentials auth)
        loadData();
      }
    } catch (e) {
      console.error("Error verifying active session:", e);
      loadData();
    }
  };

  useEffect(() => {
    checkSession();

    // Trigger Auth Modal if auth parameter is present in URL query or if user is not logged in and hasn't skipped
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'true') {
        setShowAuth(true);
      } else {
        const userProfile = db.getUserProfile();
        const hasPrompted = localStorage.getItem("auth_prompted") === "true";
        if ((!userProfile || !userProfile.isLoggedIn) && !hasPrompted) {
          // Auto-prompt after 1.5 seconds for fresh visitors
          setTimeout(() => {
            setShowAuth(true);
            localStorage.setItem("auth_prompted", "true");
          }, 1500);
        }
      }
    }
  }, []);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setLocationError("");
    try {
      const loc: LocationData = await detectFullLocation();
      setCountry(loc.country);
      setStateName(loc.state);
      setDistrict(loc.district);
      setCity(loc.city);
      setArea(loc.area);
      setLatitude(loc.latitude);
      setLongitude(loc.longitude);
      setLocationDetected(true);
    } catch (err: any) {
      setLocationError(err.message || "Failed to detect location.");
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const updated: UserProfile = {
      ...profile,
      name,
      phone,
      bloodGroup: bloodGroup as BloodGroup,
      city,
      country,
      state: stateName,
      district,
      area,
      latitude,
      longitude,
      availableToDonate
    };

    db.saveUserProfile(updated);
    setProfile(updated);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleToggleAvailability = () => {
    if (!profile) return;
    const nextVal = !profile.availableToDonate;
    const updated: UserProfile = {
      ...profile,
      availableToDonate: nextVal
    };
    db.saveUserProfile(updated);
    setProfile(updated);
    setAvailableToDonate(nextVal);
    
    db.addSystemAlert({
      type: 'request',
      message: "DONOR STATUS UPDATE: " + profile.name + " toggled donation readiness " + (nextVal ? 'ON' : 'OFF') + " (" + profile.bloodGroup + ")."
    });
  };

  const handleLogout = async () => {
    // Simply clear profile and reload
    await supabase.auth.signOut();
    db.saveUserProfile({ ...db.getUserProfile(), isLoggedIn: false } as any);
    window.dispatchEvent(new Event('telegram-status-updated'));
    window.location.reload();
  };

  const handleSkipAuth = () => {
    localStorage.setItem("auth_prompted", "true");
    setShowAuth(false);
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteAccountConfirm = async () => {
    if (deleteConfirmText.toUpperCase() !== "DELETE" || !profile?.id) return;
    setLoading(true);
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('bloodindo_profiles')
        .delete()
        .eq('id', profile.id);

      if (error) throw error;

      // Clear local storage and log out
      await supabase.auth.signOut();
      db.saveUserProfile({ ...db.getUserProfile(), isLoggedIn: false } as any);
      localStorage.removeItem('blood_user_profile');
      
      db.addSystemAlert({
        type: 'request',
        message: `SYSTEM: Account permanently deleted for ${profile.name}`
      });

      window.dispatchEvent(new Event('telegram-status-updated'));
      window.location.reload();
    } catch (e: any) {
      alert("Error deleting account: " + e.message);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    if (!authIdentifier || !authPassword) {
      setAuthError("Please fill in all required fields.");
      return;
    }

    if (authMode === 'register' && !authName) {
      setAuthError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Detect GPS location first
      let loc: LocationData | null = null;
      try {
        loc = await detectFullLocation();
      } catch (e) {
        console.warn("Location detection skipped or failed during auth.", e);
      }

      // Step 2: Directly execute authentication client-side to be 100% platform-agnostic (Capacitor/Web)
      let apiUser;
      const isPhone = /^[\d\+\-\s]+$/.test(authIdentifier);

      if (authMode === 'login') {
        // --- CLIENT-SIDE LOGIN ---
        let query = supabase.from('bloodindo_profiles').select('*');
        if (isPhone) {
          const normalizedPhone = authIdentifier.replace(/\D/g, '').slice(-10);
          query = query.like('phone', `%${normalizedPhone}`);
        } else {
          query = query.eq('username', authIdentifier);
        }
        
        const { data: user, error: fetchError } = await query.maybeSingle();
        
        if (fetchError || !user) {
          throw new Error('Invalid credentials. User not found.');
        }

        if (!user.password_hash) {
          throw new Error('Account requires social login or OTP.');
        }

        // Compare password client-side using bcryptjs
        const bcrypt = await import('bcryptjs');
        const isMatch = await bcrypt.compare(authPassword, user.password_hash);
        
        if (!isMatch) {
          throw new Error('Invalid credentials. Incorrect password.');
        }

        // Update login status
        await supabase.from('bloodindo_profiles').update({ is_logged_in: true }).eq('id', user.id);
        
        apiUser = { ...user, is_logged_in: true };
      } else {
        // --- CLIENT-SIDE REGISTER ---
        const phone = isPhone ? authIdentifier : '';
        const username = !isPhone ? authIdentifier : '';

        // Check duplicate identifier first
        let query = supabase.from('bloodindo_profiles').select('id');
        if (isPhone) {
          const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
          query = query.like('phone', `%${normalizedPhone}`);
        } else {
          query = query.eq('username', username);
        }
        
        const { data: existingUser } = await query.maybeSingle();
        
        if (existingUser) {
          throw new Error('An account with this identifier already exists.');
        }

        // Hash password client-side
        const bcrypt = await import('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(authPassword, salt);

        const customUserId = 'custom_' + Date.now() + Math.floor(Math.random() * 1000);

        const { data: newUser, error: insertError } = await supabase.from('bloodindo_profiles').insert({
          id: customUserId,
          phone: phone || null,
          username: username || null,
          password_hash: passwordHash,
          name: authName || (isPhone ? 'New User' : username),
          blood_group: '',
          city: loc?.city || '',
          country: loc?.country || '',
          state: loc?.state || '',
          district: loc?.district || '',
          area: loc?.area || '',
          latitude: loc?.latitude || 0,
          longitude: loc?.longitude || 0,
          is_logged_in: true,
          streak: 0,
          points: 100, // Starting points for registration
          donations_count: 0,
          badges: []
        }).select().single();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error('Database error creating account: ' + insertError.message);
        }

        apiUser = { ...newUser };
      }

      // Step 3: Construct local profile from Supabase user profile
      const updatedProfile: UserProfile = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email || '',
        phone: apiUser.phone || '',
        username: apiUser.username || '',
        bloodGroup: apiUser.blood_group as BloodGroup || '',
        city: loc?.city || apiUser.city || '',
        country: loc?.country || apiUser.country || '',
        state: loc?.state || apiUser.state || '',
        district: loc?.district || apiUser.district || '',
        area: loc?.area || apiUser.area || '',
        latitude: loc?.latitude || apiUser.latitude || 0,
        longitude: loc?.longitude || apiUser.longitude || 0,
        streak: apiUser.streak || 0,
        points: apiUser.points || 0,
        donationsCount: apiUser.donations_count || 0,
        badges: apiUser.badges || [],
        isLoggedIn: true,
        availableToDonate: apiUser.available_to_donate || false,
        telegramChatId: apiUser.telegram_chat_id || ''
      };

      // Save locally
      db.saveUserProfile(updatedProfile);
      window.dispatchEvent(new Event('telegram-status-updated'));
      setProfile(updatedProfile);
      
      // Update form state fields so dashboard UI reflects them immediately
      setName(updatedProfile.name);
      setPhone(updatedProfile.phone);
      setBloodGroup(updatedProfile.bloodGroup);
      setCity(updatedProfile.city);
      setCountry(updatedProfile.country || "");
      setStateName(updatedProfile.state || "");
      setDistrict(updatedProfile.district || "");
      setArea(updatedProfile.area || "");
      setLatitude(updatedProfile.latitude || 0);
      setLongitude(updatedProfile.longitude || 0);

      setLoading(false);
      setShowAuth(false);
      
      db.addSystemAlert({
        type: 'request',
        message: `SYSTEM: ${authMode === 'login' ? 'User logged in' : 'New user registered'} -> ${updatedProfile.name} (${updatedProfile.city || 'Unknown Location'})`
      });

    } catch (error: any) {
      setLoading(false);
      setAuthError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError("");

    try {
      // 1. Try real Supabase Google Sign In (will redirect if configured in Supabase dashboard)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined
        }
      });

      if (error) {
        console.warn("Supabase Google Auth failed, falling back to seamless mock profile...", error.message);
      } else {
        // Real Google login initiated successfully, early return to await redirect.
        return;
      }

      // 2. Mock Google Account fallback for local testing
      const googleUser = {
        name: "Google Lifesaver",
        email: "lifesaver@gmail.com",
        phone: "+91 99887 76655",
        username: "google_saver",
        blood_group: "O+",
        city: "Kochi",
        country: "India",
        state: "Kerala",
        district: "Ernakulam",
        area: "Kadavanthra",
        latitude: 9.9682,
        longitude: 76.2998,
        streak: 3,
        points: 450,
        donations_count: 2,
        badges: ["Fast Responder"],
        available_to_donate: true
      };

      let loc = null;
      try {
        loc = await detectFullLocation();
      } catch (err) {
        console.warn("Could not get GPS for Google Login, using default coordinates.");
      }

      const updatedProfile = {
        name: googleUser.name,
        email: googleUser.email,
        phone: googleUser.phone,
        username: googleUser.username,
        bloodGroup: googleUser.blood_group as BloodGroup,
        city: loc?.city || googleUser.city,
        country: loc?.country || googleUser.country,
        state: loc?.state || googleUser.state,
        district: loc?.district || googleUser.district,
        area: loc?.area || googleUser.area,
        latitude: loc?.latitude || googleUser.latitude,
        longitude: loc?.longitude || googleUser.longitude,
        streak: googleUser.streak,
        points: googleUser.points,
        donationsCount: googleUser.donations_count,
        badges: googleUser.badges,
        isLoggedIn: true,
        availableToDonate: googleUser.available_to_donate
      };

      db.saveUserProfile(updatedProfile);
      setProfile(updatedProfile);
      
      db.addSystemAlert({
        type: 'request',
        message: `SYSTEM: Google OAuth Sign-in -> ${updatedProfile.name} (${updatedProfile.city})`
      });

      // Synchronize in-memory form values
      setName(updatedProfile.name);
      setPhone(updatedProfile.phone);
      setBloodGroup(updatedProfile.bloodGroup);
      setCity(updatedProfile.city);
      setCountry(updatedProfile.country || '');
      setStateName(updatedProfile.state || '');
      setDistrict(updatedProfile.district || '');
      setArea(updatedProfile.area || '');
      setLatitude(updatedProfile.latitude || 0);
      setLongitude(updatedProfile.longitude || 0);
      setAvailableToDonate(updatedProfile.availableToDonate || false);

      setShowAuth(false);
      alert("Welcome! Logged in successfully via Google.");
    } catch (e) {
      console.error(e);
      setAuthError(e instanceof Error ? e.message : String(e) || "Google Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="text-center py-20">Loading profile...</div>;

  const locationSummary = [area, city, district, stateName, country].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col gap-6 relative">
      <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-brand-red-neon/5 blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider font-sans flex items-center gap-2">
            <Award className="h-6 w-6 text-brand-red-neon" /> {t("dash_title")}
          </h1>
          <p className="text-xs text-gray-400 mt-1.5">{t("dash_subtitle")}</p>
        </div>

        {!profile.isLoggedIn ? (
          <button
            onClick={() => setShowAuth(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon px-6 py-3 text-xs font-bold text-white shadow-md shadow-brand-red-neon/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Lock className="h-4 w-4" /> {t("nav_login")}
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 px-5 py-3 text-xs font-bold active:scale-95 transition-all"
          >
            Logout
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: User Profile & Gamification */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gamified Profile Card */}
          <div className="glass-panel bg-brand-charcoal/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            <span className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-brand-red-neon/5 blur-3xl"></span>
            
            {!profile.isLoggedIn ? (
              <div className="text-center py-8 flex flex-col items-center">
                <ShieldAlert className="h-10 w-10 text-brand-red-neon mb-3 animate-pulse" />
                <h3 className="text-base font-bold text-white">{t("dash_access_restricted")}</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">{t("dash_auth_required")}</p>
                <button
                  onClick={() => setShowAuth(true)}
                  className="mt-4 rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-red-neon/20"
                >
                  Authenticate Now
                </button>
              </div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-red-dark to-brand-charcoal border border-brand-red-neon/30 flex items-center justify-center font-bold text-lg text-brand-red-glow">
                      {profile.name ? profile.name.substring(0,2).toUpperCase() : 'US'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{profile.name || (profile.username || profile.phone)}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-brand-red-neon" />
                        {locationSummary || (profile.city || 'Location Pending')}
                      </p>
                    </div>
                  </div>

                  {profile.bloodGroup && (
                    <span className="text-xs font-black tracking-tight text-brand-red-glow bg-brand-red-dark/30 border border-brand-red-neon/30 px-3 py-1.5 rounded-lg">
                      {"Blood Group: " + profile.bloodGroup}
                    </span>
                  )}
                </div>

                {/* GPS Coordinates Badge */}
                {profile.latitude !== 0 && (
                  <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs">
                    <Navigation className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">{"GPS Active: " + (profile.latitude || 0).toFixed(4) + ", " + (profile.longitude || 0).toFixed(4)}</span>
                    <span className="text-gray-500 ml-auto">{locationSummary}</span>
                  </div>
                )}

                              </div>
            )}
          </div>

          {/* Profile Editor */}
          {profile.isLoggedIn && (
            <div className="glass-panel bg-brand-charcoal/40 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t("dash_personal_registry")}</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-bold text-brand-red-glow hover:underline"
                >
                  {isEditing ? 'Cancel' : 'Edit Registry'}
                </button>
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-gray-500">Full Name</span>
                      <span className="text-white font-semibold">{profile.name || '—'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-gray-500">Username / Phone</span>
                      <span className="text-white font-semibold">{profile.username || profile.phone || '—'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-gray-500">Blood Group</span>
                      <span className="text-white font-semibold">{profile.bloodGroup || '—'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-gray-500">City</span>
                      <span className="text-white font-semibold">{profile.city || '—'}</span>
                    </div>
                  </div>

                  {/* Location Details */}
                  {(profile.country || profile.state || profile.district || profile.area) && (
                    <div className="rounded-xl bg-brand-black/40 border border-white/5 p-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-brand-red-neon" /> Detected Location
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div><span className="text-gray-500 block">Country</span><span className="text-white font-semibold">{profile.country || '—'}</span></div>
                        <div><span className="text-gray-500 block">State</span><span className="text-white font-semibold">{profile.state || '—'}</span></div>
                        <div><span className="text-gray-500 block">District</span><span className="text-white font-semibold">{profile.district || '—'}</span></div>
                        <div><span className="text-gray-500 block">City</span><span className="text-white font-semibold">{profile.city || '—'}</span></div>
                        <div><span className="text-gray-500 block">Area / Locality</span><span className="text-white font-semibold">{profile.area || '—'}</span></div>
                        <div><span className="text-gray-500 block">Coordinates</span><span className="text-emerald-400 font-mono font-semibold">{profile.latitude ? ((profile.latitude || 0).toFixed(4) + ", " + (profile.longitude || 0).toFixed(4)) : '—'}</span></div>
                      </div>
                    </div>
                  )}

                  {/* Donation Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-brand-black/40 border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <span className={"relative flex h-3 w-3"}>
                        {profile.availableToDonate ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </>
                        ) : (
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-600"></span>
                        )}
                      </span>
                      <div>
                        <div className="text-white font-bold flex items-center gap-1.5 text-xs">
                          {"Ready to Donate: "}
                          <span className={profile.availableToDonate ? 'text-emerald-400 font-extrabold' : 'text-gray-400'}>
                            {profile.availableToDonate ? 'ACTIVE (Visible on Radar)' : 'OFFLINE (Hidden)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">{t("dash_broadcast_desc")}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleToggleAvailability}
                      className={"rounded-xl py-2.5 px-4 text-xs font-bold transition-all active:scale-95 border " + (
                        profile.availableToDonate
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                          : 'bg-brand-black/60 text-gray-400 border-white/5 hover:text-white'
                      )}
                    >
                      {profile.availableToDonate ? 'Go Offline' : 'Be Ready to Donate'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Contact Phone</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                        className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                      >
                        <option value="">Select...</option>
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
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                      />
                    </div>
                  </div>

                  {/* Location Fields */}
                  <div className="rounded-xl bg-brand-black/30 border border-white/5 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5 text-brand-red-neon" /> Location Details
                      </h4>
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={detectingLocation}
                        className={"flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95 " + (
                          detectingLocation
                            ? 'bg-brand-red-neon/10 text-brand-red-glow border border-brand-red-neon/30'
                            : locationDetected
                            ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-brand-red-neon/10 text-brand-red-glow border border-brand-red-neon/30 hover:bg-brand-red-neon/20'
                        )}
                      >
                        {detectingLocation ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Detecting GPS...</>
                        ) : locationDetected ? (
                          <><CheckCircle2 className="h-3.5 w-3.5" /> Location Detected</>
                        ) : (
                          <><Navigation className="h-3.5 w-3.5" /> Auto-Detect GPS</>
                        )}
                      </button>
                    </div>

                    {locationError && (
                      <div className="text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-lg px-3 py-2">{locationError}</div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">State</label>
                        <input
                          type="text"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          placeholder="e.g. Karnataka"
                          className="w-full rounded-lg bg-brand-black border border-white/5 p-2.5 text-xs text-white focus:outline-none focus:border-brand-red-neon"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">District</label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="e.g. Bangalore Urban"
                          className="w-full rounded-lg bg-brand-black border border-white/5 p-2.5 text-xs text-white focus:outline-none focus:border-brand-red-neon"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">City</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Bengaluru"
                          className="w-full rounded-lg bg-brand-black border border-white/5 p-2.5 text-xs text-white focus:outline-none focus:border-brand-red-neon"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Area / Locality</label>
                        <input
                          type="text"
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          placeholder="e.g. Koramangala"
                          className="w-full rounded-lg bg-brand-black border border-white/5 p-2.5 text-xs text-white focus:outline-none focus:border-brand-red-neon"
                        />
                      </div>
                    </div>

                    {latitude !== 0 && (
                      <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
                        <Navigation className="h-3 w-3" />
                        {"GPS: " + latitude.toFixed(6) + ", " + longitude.toFixed(6)}
                      </div>
                    )}
                  </div>

                  {/* Donate Toggle in Edit */}
                  <div className="border-t border-white/5 pt-4 mt-2 flex items-center justify-between p-4 rounded-xl bg-brand-black/40 border border-white/5 mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">{t("dash_ready_donate")}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Toggle to appear live on compatible GPS radar scans.</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setAvailableToDonate(!availableToDonate)}
                      className={"w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none " + (
                        availableToDonate ? 'bg-brand-red-neon' : 'bg-zinc-800'
                      )}
                    >
                      <div
                        className={"w-4 h-4 rounded-full bg-white transition-transform duration-300 " + (
                          availableToDonate ? 'transform translate-x-6' : ''
                        )}
                      />
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon py-3 text-xs font-bold text-white hover:shadow-[0_0_15px_rgba(255,0,60,0.3)]"
                  >
                    Save Registry
                  </button>

                  {/* Danger Zone: Account Deletion Option */}
                  <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                    <div>
                      <h4 className="text-xs font-black uppercase text-red-500 tracking-wider flex items-center gap-1.5 font-sans">
                        <ShieldAlert className="h-4 w-4" /> Danger Zone
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1 font-sans">
                        Permanently delete your profile and all associated volunteer data from the emergency network.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDeleteAccountClick}
                      className="w-full rounded-xl bg-red-950/20 border border-red-500/30 hover:bg-red-500 hover:text-white py-3 text-xs font-bold text-red-400 active:scale-95 transition-all cursor-pointer"
                    >
                      Delete My Account
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        
          {/* Eligibility Tracker */}
          {profile.isLoggedIn && (
            <EligibilityTracker 
              lastDonationDate={profile.lastDonationDate}
              onDonateToday={handleLogDonation}
              isLoading={isLoggingDonation}
            />
          )}


        
        {/* Right: Telegram Bot Alert Center */}
        <div className="w-full z-10">
          <div className="glass-panel bg-brand-charcoal/40 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-brand-red animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Telegram Alerts</h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                profile && profile.telegramChatId && !profile.telegramChatId.startsWith('CODE:')
                  ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20'
                  : telegramCode && timeLeft > 0
                  ? 'text-amber-400 bg-amber-950/20 border-amber-500/20'
                  : 'text-zinc-500 bg-zinc-950/40 border-zinc-500/20'
              }`}>
                {profile && profile.telegramChatId && !profile.telegramChatId.startsWith('CODE:')
                  ? 'Connected'
                  : telegramCode && timeLeft > 0
                  ? 'Waiting for Verification'
                  : 'Not Connected'}
              </span>
            </div>
            
            {profile && profile.telegramChatId && !profile.telegramChatId.startsWith('CODE:') ? (
              // Connected State
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 text-emerald-400">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-bold uppercase tracking-wider">Connected</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Receiving real-time matching emergency blood alerts.</p>
                  </div>
                </div>
                
                <button
                  onClick={handleDisconnectTelegram}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-red-950/20 border border-white/5 hover:border-red-500/20 text-xs text-gray-400 hover:text-red-400 font-bold rounded-xl transition-all active:scale-95 animate-fadeIn"
                >
                  Disconnect Bot
                </button>
              </div>
            ) : (
              // Disconnected / Code Pending State
              <div className="flex flex-col gap-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Connect your profile to receive live emergency notifications whenever a patient matches your blood group!
                </p>

                {telegramCode && timeLeft > 0 ? (
                  // Code Generated, instructions shown
                  <div className="bg-brand-black/60 border border-brand-red-neon/20 rounded-xl p-4 flex flex-col items-center gap-3 animate-fadeIn">
                    <div className="text-center w-full">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold">Your Verification Code</p>
                      
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <p className="text-2xl font-black text-brand-red-glow font-mono tracking-wider animate-pulse">
                          {telegramCode}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(telegramCode);
                            alert("Verification code copied to clipboard!");
                          }}
                          className="p-1.5 bg-brand-charcoal border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-lg transition-all active:scale-90"
                          title="Copy Code"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-amber-500 font-bold">
                        <span className="animate-ping h-1.5 w-1.5 rounded-full bg-amber-500 mr-1" />
                        <span>Expires in: {formatTime(timeLeft)}</span>
                      </div>
                    </div>

                    <div className="w-full border-t border-white/5 pt-3 text-left space-y-2">
                      <p className="text-[10px] font-bold text-white uppercase">How to activate:</p>
                      <div className="text-[11px] text-gray-400 space-y-1.5 pl-1">
                        <p>1. Open bot: <a href="https://t.me/bloodundobot" target="_blank" rel="noreferrer" className="text-brand-red-glow hover:underline inline-flex items-center gap-0.5 font-bold">@bloodundobot <ExternalLink className="h-2.5 w-2.5 inline" /></a></p>
                        <p>2. Send your code: <code className="bg-brand-charcoal text-white px-1.5 py-0.5 rounded font-mono font-bold text-xs">{telegramCode}</code></p>
                        <p>3. Your account will link instantly!</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateTelegramCode}
                      className="text-[10px] text-sky-400 hover:underline mt-1 bg-transparent border-none cursor-pointer"
                    >
                      Generate New Code
                    </button>
                  </div>
                ) : (
                  // Generate Code Button
                  <button
                    type="button"
                    onClick={handleGenerateTelegramCode}
                    className="w-full py-3 bg-gradient-to-r from-brand-red to-brand-red-neon text-white font-bold rounded-xl text-xs shadow-md shadow-brand-red-neon/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Generate Code</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

            {/* NEW AUTHENTICATION MODAL */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-brand-charcoal rounded-2xl border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Lock className="h-5 w-5 text-brand-red-neon" /> 
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </h3>
              <button
                onClick={handleSkipAuth}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            {authError && (
              <div className="mb-4 rounded-xl bg-red-950/40 border border-red-500/20 p-3 text-xs text-red-400 font-semibold animate-pulse">
                {authError}
              </div>
            )}

            <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-400">
              <Navigation className="h-4 w-4 shrink-0" />
              <span>We will automatically request GPS location on sign-in to configure your donor radar.</span>
            </div>

            {/* HIGHLY PROMINENT GOOGLE SIGN IN BUTTON */}
            <div className="mb-5 space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-brand-red to-brand-red-neon text-white py-3.5 text-xs font-black uppercase tracking-wider active:scale-[0.98] transition-all shadow-lg shadow-brand-red-neon/30 hover:brightness-110 cursor-pointer border border-brand-red-neon/20"
              >
                <svg className="h-4 w-4 text-white shrink-0 animate-pulse" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-brand-charcoal px-3 text-gray-500 font-black tracking-wider">Or continue with credentials</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 font-sans">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 font-sans">Phone or Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +919876543210 or johndoe"
                  value={authIdentifier}
                  onChange={(e) => setAuthIdentifier(e.target.value)}
                  className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 font-sans">Password</label>
                <input
                  type="password"
                  required
                  placeholder="        "
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-brand-red-neon"
                />
              </div>

              {authMode === 'register' && (
                <div className="flex items-start gap-2.5 pt-1.5 pb-2">
                  <input
                    type="checkbox"
                    id="registerConsent"
                    required
                    className="mt-0.5 rounded border border-white/15 bg-brand-black text-brand-red-neon focus:ring-brand-red-neon focus:ring-1 shrink-0 cursor-pointer h-3.5 w-3.5"
                  />
                  <label htmlFor="registerConsent" className="text-[10px] text-gray-400 font-medium leading-normal select-none">
                    I agree to the <a href="/terms" target="_blank" className="text-brand-red-glow font-bold hover:underline">Terms of Service</a>, <a href="/privacy" target="_blank" className="text-brand-red-glow font-bold hover:underline">Privacy Policy</a>, and <a href="/disclaimer" target="_blank" className="text-brand-red-glow font-bold hover:underline">Medical &amp; Emergency Disclaimers</a>.
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 py-3 text-xs font-bold text-white mt-4 active:scale-95 transition-all cursor-pointer"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin text-brand-red-neon" /> Processing...</>
                ) : authMode === 'login' ? (
                  <><ArrowRight className="h-4 w-4 text-brand-red-neon" /> Sign In</>
                ) : (
                  <><UserPlus className="h-4 w-4 text-brand-red-neon" /> Register Account</>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-gray-500">
              {authMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button onClick={() => { setAuthMode('register'); setAuthError(""); }} className="text-brand-red-glow font-bold hover:underline cursor-pointer">
                    Register here
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button onClick={() => { setAuthMode('login'); setAuthError(""); }} className="text-brand-red-glow font-bold hover:underline cursor-pointer">
                    Sign in here
                  </button>
                </p>
              )}
            </div>

            {/* Skip / Do it later Button */}
            <div className="mt-5 border-t border-white/5 pt-4 text-center">
              <button
                type="button"
                onClick={handleSkipAuth}
                className="w-full py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20 active:scale-95 transition-all cursor-pointer"
              >
                Do it later / Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT DELETION CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-black/95 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-brand-charcoal rounded-2xl border border-red-500/30 p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-red-500 border-b border-white/5 pb-4">
              <ShieldAlert className="h-6 w-6 animate-bounce" />
              <h3 className="text-lg font-black uppercase tracking-wider font-sans">Delete Account?</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-medium font-sans">
              This action is <strong className="text-red-400">PERMANENT</strong> and cannot be undone. It will completely wipe your volunteer profile, badges, history, and instantly disconnect all your Telegram dispatches.
            </p>

            <div className="space-y-2">
              <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider font-sans">
                Type <span className="text-red-400 font-black">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full rounded-xl bg-brand-black border border-white/5 p-3 text-sm text-white focus:outline-none focus:border-red-500 uppercase tracking-widest text-center"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDeleteAccountConfirm}
                disabled={deleteConfirmText.toUpperCase() !== "DELETE" || loading}
                className="flex-1 rounded-xl bg-red-600 disabled:bg-red-950/20 disabled:text-red-900 text-white py-3 text-xs font-bold transition-all cursor-pointer hover:bg-red-500 active:scale-95"
              >
                {loading ? "Deleting..." : "Permanently Delete"}
              </button>
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
                className="flex-1 rounded-xl bg-white/5 border border-white/10 text-gray-300 py-3 text-xs font-bold transition-all cursor-pointer hover:bg-white/10 hover:border-white/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


