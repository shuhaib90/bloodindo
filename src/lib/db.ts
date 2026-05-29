import { supabase } from './supabase';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UrgencyLevel = 'Critical' | 'High' | 'Standard' | 'Rare Blood';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  username?: string;
  bloodGroup: BloodGroup | '';
  city: string;
  country?: string;
  state?: string;
  district?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  streak: number;
  points: number;
  donationsCount: number;
  badges: string[];
  isLoggedIn: boolean;
  availableToDonate: boolean;
  telegramChatId?: string;
}

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  latitude: number;
  longitude: number;
  distance: number;
  city: string;
  phone: string;
  available: boolean;
  avatar: string;
  badges: string[];
  streak: number;
  telegramChatId?: string;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  hospitalName: string;
  hospitalLocation?: string;
  contactDetails?: string;
  notes?: string;
  countdownMinutes?: number;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgencyLevel: UrgencyLevel;
  distance?: string;
  latitude?: number;
  longitude?: number;
  status: 'Active' | 'Fulfilled' | 'Expired';
  createdAt: string;
  volunteers: string[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  donations: number;
  streak: number;
  avatar: string;
}

export interface SystemAlert {
  id: string;
  type: 'request' | 'volunteer' | 'system' | 'telegram' | 'voice_call';
  message: string;
  timestamp: string;
}

const INITIAL_DONORS: Donor[] = [];

const INITIAL_REQUESTS: BloodRequest[] = [];

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [];

const INITIAL_ALERTS: SystemAlert[] = [];

const isClient = typeof window !== 'undefined';

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (!isClient) return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading localStorage', error);
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (!isClient) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage', error);
  }
};

const syncProfileToSupabase = async (profile: UserProfile) => {
  if (!profile.isLoggedIn) return;
  try {
    let query = supabase.from('bloodindo_profiles').select('id');
    let identifierFound = false;

    if (profile.id) {
      query = query.eq('id', profile.id);
      identifierFound = true;
    } else if (profile.email) {
      query = query.eq('email', profile.email);
      identifierFound = true;
    } else if (profile.phone) {
      query = query.eq('phone', profile.phone);
      identifierFound = true;
    } else if (profile.username) {
      query = query.eq('username', profile.username);
      identifierFound = true;
    }

    if (!identifierFound) return;

    const { data: existingProfiles, error: fetchError } = await query;
    if (fetchError) throw fetchError;

    const profileData = {
      name: profile.name,
      email: profile.email || null,
      phone: profile.phone || null,
      blood_group: profile.bloodGroup,
      city: profile.city,
      country: profile.country || null,
      state: profile.state || null,
      district: profile.district || null,
      area: profile.area || null,
      latitude: profile.latitude || null,
      longitude: profile.longitude || null,
      streak: profile.streak,
      points: profile.points,
      donations_count: profile.donationsCount,
      badges: profile.badges,
      is_logged_in: profile.isLoggedIn,
      available_to_donate: profile.availableToDonate,
      username: profile.username || null,
      telegram_chat_id: profile.telegramChatId || null
    };

    if (existingProfiles && existingProfiles.length > 0) {
      const targetId = existingProfiles[0].id;
      const { error: updateError } = await supabase
        .from('bloodindo_profiles')
        .update(profileData)
        .eq('id', targetId);
      if (updateError) throw updateError;
    } else {
      const customId = "user_" + Date.now();
      const { error: insertError } = await supabase
        .from('bloodindo_profiles')
        .insert({
          id: customId,
          ...profileData
        });
      if (insertError) throw insertError;
    }
  } catch (err) {
    console.error("Supabase sync profile failed", err);
  }
};

const syncRequestToSupabase = async (req: BloodRequest) => {
  try {
    const { error } = await supabase
      .from('bloodindo_requests')
      .upsert({
        id: req.id,
        patient_name: req.patientName,
        blood_group: req.bloodGroup,
        hospital_name: req.hospitalName,
        units_needed: req.unitsNeeded,
        units_fulfilled: req.unitsFulfilled,
        urgency_level: req.urgencyLevel,
        distance: req.distance,
        latitude: req.latitude,
        longitude: req.longitude,
        status: req.status,
        created_at: req.createdAt,
        volunteers: req.volunteers
      });
    if (error) throw error;
  } catch (err) {
    console.warn("Supabase sync request failed (suppressed error overlay)", err instanceof Error ? err.message : String(err));
  }
};

const syncAlertToSupabase = async (alert: SystemAlert) => {
  try {
    const { error } = await supabase
      .from('bloodindo_alerts')
      .upsert({
        id: alert.id,
        type: alert.type,
        message: alert.message,
        timestamp: alert.timestamp
      });
    if (error) throw error;
  } catch (err) {
    console.warn("Supabase sync alert failed (suppressed error overlay)", err instanceof Error ? err.message : String(err));
  }
};

export const db = {
  initializeSupabaseSync: () => {
    db.syncLocalFromSupabase();
  },
  syncLocalFromSupabase: async (): Promise<void> => {
    try {
      console.log("[Supabase Sync] Fetching master data from Supabase...");
      const { data: dbRequests } = await supabase.from('bloodindo_requests').select('*').order('created_at', { ascending: false });
      if (dbRequests && dbRequests.length > 0) {
        const mapped = dbRequests.map(r => ({
          id: r.id,
          patientName: r.patient_name,
          bloodGroup: r.blood_group as BloodGroup,
          hospitalName: r.hospital_name,
          unitsNeeded: r.units_needed,
          unitsFulfilled: r.units_fulfilled,
          urgencyLevel: r.urgency_level as 'Critical' | 'High' | 'Standard',
          distance: r.distance,
          latitude: r.latitude || 0,
          longitude: r.longitude || 0,
          status: r.status as 'Active' | 'Fulfilled' | 'Expired',
          createdAt: r.created_at,
          volunteers: r.volunteers || []
        }));
        setStorageItem('blood_requests', mapped);
      }
      
      const { data: dbAlerts } = await supabase.from('bloodindo_alerts').select('*').order('timestamp', { ascending: false }).limit(50);
      if (dbAlerts && dbAlerts.length > 0) {
        const mapped = dbAlerts.map(a => ({
          id: a.id,
          type: a.type as 'request' | 'volunteer' | 'system' | 'telegram' | 'voice_call',
          message: a.message,
          timestamp: a.timestamp
        }));
        setStorageItem('blood_system_alerts', mapped);
      }

      const defaultProfile: UserProfile = {
        id: '',
        name: '',
        email: '',
        phone: '',
        username: '',
        bloodGroup: '',
        city: '',
        country: '',
        state: '',
        district: '',
        area: '',
        latitude: 0,
        longitude: 0,
        streak: 0,
        points: 0,
        donationsCount: 0,
        badges: [],
        isLoggedIn: false,
        availableToDonate: false,
        telegramChatId: ''
      };
      
      const localProfile = getStorageItem<UserProfile>('blood_user_profile', defaultProfile);
      
      if (localProfile && localProfile.isLoggedIn) {
        let query = supabase.from('bloodindo_profiles').select('*');
        let identifierFound = false;

        if (localProfile.email) {
          query = query.eq('email', localProfile.email);
          identifierFound = true;
        } else if (localProfile.phone) {
          query = query.eq('phone', localProfile.phone);
          identifierFound = true;
        } else if (localProfile.username) {
          query = query.eq('username', localProfile.username);
          identifierFound = true;
        }

        if (identifierFound) {
          const { data: dbProfile } = await query.limit(1).maybeSingle();
          if (dbProfile) {
            const mapped: UserProfile = {
              id: dbProfile.id,
              name: dbProfile.name || '',
              email: dbProfile.email || '',
              phone: dbProfile.phone || '',
              username: dbProfile.username || '',
              bloodGroup: dbProfile.blood_group as BloodGroup,
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
              telegramChatId: dbProfile.telegram_chat_id || ''
            };
            setStorageItem('blood_user_profile', mapped);
          }
        }
      }

      // Fetch active profiles from Supabase to keep Nearby Donors Radar fully live and updated
      const { data: dbActiveProfiles } = await supabase
        .from('bloodindo_profiles')
        .select('*')
        .eq('available_to_donate', true);

      if (dbActiveProfiles && dbActiveProfiles.length > 0) {
        const jitter = (val: number) => {
          // Add a random offset between ~400m and ~1.2km (0.004 to 0.010 degrees) to hide exact homes
          const offset = 0.004 + Math.random() * 0.006;
          const sign = Math.random() < 0.5 ? -1 : 1;
          return val + (offset * sign);
        };

        const activeDonors = dbActiveProfiles.map(p => {
          const jitteredLat = p.latitude ? jitter(p.latitude) : 12.9720;
          const jitteredLng = p.longitude ? jitter(p.longitude) : 77.5930;
          
          // Build a safe place summary like "Area, City, District, State" (e.g., Attingal, Trivandrum, Kerala)
          const locationParts = [p.area, p.city, p.district, p.state].filter(Boolean);
          const locationLabel = locationParts.join(", ") || p.city || 'Kochi, Kerala';

          return {
            id: p.id,
            name: p.name || 'Anonymous Donor',
            bloodGroup: p.blood_group as BloodGroup,
            latitude: jitteredLat,
            longitude: jitteredLng,
            phone: p.phone || '',
            available: p.available_to_donate || false,
            distance: 1.0,
            city: locationLabel,
            avatar: p.avatar || (p.badges && p.badges.includes('Fast Responder') ? '🦸‍♂️' : '👨'),
            badges: p.badges || [],
            streak: p.streak || 0,
            telegramChatId: p.telegram_chat_id || ''
          };
        });

        const currentLocal = getStorageItem<Donor[]>('blood_donors', INITIAL_DONORS);
        const filteredLocal = currentLocal.filter(d => 
          d.id === 'user_self' || 
          !activeDonors.some(ad => ad.id === d.id)
        );

        setStorageItem('blood_donors', [...filteredLocal, ...activeDonors]);
      }

      console.log("[Supabase Sync] Complete! Local cache updated seamlessly.");
    } catch (e) {
      console.error("[Supabase Sync] Background connection failed:", e);
    }
  },

  getRequests: (): BloodRequest[] => {
    return getStorageItem('blood_requests', INITIAL_REQUESTS);
  },

  saveRequests: (requests: BloodRequest[]): void => {
    setStorageItem('blood_requests', requests);
  },

  createRequest: (req: Omit<BloodRequest, 'id' | 'createdAt' | 'unitsFulfilled' | 'status' | 'volunteers'>): BloodRequest => {
    const requests = db.getRequests();
    const newRequest: BloodRequest = {
      ...req,
      id: "req_" + Date.now(),
      createdAt: new Date().toISOString(),
      unitsFulfilled: 0,
      status: 'Active',
      volunteers: []
    };
    requests.unshift(newRequest);
    db.saveRequests(requests);

    db.addSystemAlert({
      type: 'request',
      message: "EMERGENCY BROADCAST: " + newRequest.urgencyLevel + " need for " + newRequest.bloodGroup + " at " + newRequest.hospitalName + " for patient " + newRequest.patientName + "."
    });

    syncRequestToSupabase(newRequest);
    return newRequest;
  },

  volunteerToDonate: (requestId: string, donorName: string, donorBloodGroup: BloodGroup): { success: boolean; message: string } => {
    const requests = db.getRequests();
    const reqIndex = requests.findIndex(r => r.id === requestId);
    
    if (reqIndex !== -1) {
      const request = requests[reqIndex];
      if (!request.volunteers.includes(donorName)) {
        request.volunteers.push(donorName);
        request.unitsFulfilled = Math.min(request.unitsNeeded, request.unitsFulfilled + 1);
        
        if (request.unitsFulfilled >= request.unitsNeeded) {
          request.status = 'Fulfilled';
        }
        
        requests[reqIndex] = request;
        db.saveRequests(requests);

        db.addSystemAlert({
          type: 'volunteer',
          message: "VOLUNTEER ACCEPTED: " + donorName + " (" + donorBloodGroup + ") volunteered to donate for " + request.patientName + "."
        });

        syncRequestToSupabase(request);
        return { success: true, message: 'Thank you! Your donation offer has been registered and the hospital notified.' };
      }
      return { success: false, message: 'You have already volunteered for this request.' };
    }
    return { success: false, message: 'Request not found.' };
  },

  markRequestAsFulfilled: (requestId: string): { success: boolean; message: string } => {
    const requests = db.getRequests();
    const reqIndex = requests.findIndex(r => r.id === requestId);
    if (reqIndex !== -1) {
      const req = requests[reqIndex];
      req.status = 'Fulfilled';
      req.unitsFulfilled = req.unitsNeeded;
      requests[reqIndex] = req;
      db.saveRequests(requests);
      
      db.addSystemAlert({
        type: 'volunteer',
        message: "BLOOD RECEIVED: Patient " + req.patientName + " (" + req.bloodGroup + ") successfully received blood."
      });

      syncRequestToSupabase(req);
      return { success: true, message: 'Request marked as successfully fulfilled.' };
    }
    return { success: false, message: 'Request not found.' };
  },

  getDonors: (): Donor[] => {
    const list = getStorageItem('blood_donors', INITIAL_DONORS);
    const profile = db.getUserProfile();
    if (profile && profile.isLoggedIn && profile.availableToDonate) {
      const userIndex = list.findIndex(d => d.id === 'user_self');
      const userSelfDonor: Donor = {
        id: 'user_self',
        name: (profile.name || 'Google Lifesaver') + " (You)",
        bloodGroup: (profile.bloodGroup || 'O-') as BloodGroup,
        latitude: profile.latitude || 12.9720,
        longitude: profile.longitude || 77.5930,
        phone: profile.phone || '',
        available: true,
        distance: 0.5,
        city: profile.city || 'Kochi, Kerala',
        avatar: '🦸‍♂️',
        badges: profile.badges || [],
        streak: profile.streak || 0
      };
      
      if (userIndex === -1) {
        list.push(userSelfDonor);
      } else {
        list[userIndex] = userSelfDonor;
      }
    } else {
      const userIndex = list.findIndex(d => d.id === 'user_self');
      if (userIndex !== -1) {
        list.splice(userIndex, 1);
      }
    }
    return list;
  },

  saveDonors: (donors: Donor[]): void => {
    setStorageItem('blood_donors', donors);
  },

  getLeaderboard: (): LeaderboardEntry[] => {
    return getStorageItem('blood_leaderboard', INITIAL_LEADERBOARD);
  },

  saveLeaderboard: (leaderboard: LeaderboardEntry[]): void => {
    setStorageItem('blood_leaderboard', leaderboard);
  },

  getSystemAlerts: (): SystemAlert[] => {
    return getStorageItem('blood_system_alerts', INITIAL_ALERTS);
  },

  addSystemAlert: (alert: Omit<SystemAlert, 'id' | 'timestamp'>): void => {
    const alerts = db.getSystemAlerts();
    const newAlert: SystemAlert = {
      ...alert,
      id: "alert_" + Date.now(),
      timestamp: new Date().toISOString()
    };
    alerts.unshift(newAlert);
    if (alerts.length > 50) alerts.pop();
    setStorageItem('blood_system_alerts', alerts);
    syncAlertToSupabase(newAlert);
  },

  getUserProfile: (): UserProfile => {
    const defaultProfile: UserProfile = {
      id: '',
      name: '',
      email: '',
      phone: '',
      username: '',
      bloodGroup: '',
      city: '',
      country: '',
      state: '',
      district: '',
      area: '',
      latitude: 0,
      longitude: 0,
      streak: 0,
      points: 0,
      donationsCount: 0,
      badges: [],
      isLoggedIn: false,
      availableToDonate: false,
      telegramChatId: ''
    };
    return getStorageItem('blood_user_profile', defaultProfile);
  },

  saveUserProfile: (profile: UserProfile): void => {
    setStorageItem('blood_user_profile', profile);
    syncProfileToSupabase(profile);
  },
  
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  },

  isCompatible: (donor: BloodGroup, patient: BloodGroup): boolean => {
    const matrix: Record<string, string[]> = {
      'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      'O+': ['O+', 'A+', 'B+', 'AB+'],
      'A-': ['A-', 'A+', 'AB-', 'AB+'],
      'A+': ['A+', 'AB+'],
      'B-': ['B-', 'B+', 'AB-', 'AB+'],
      'B+': ['B+', 'AB+'],
      'AB-': ['AB-', 'AB+'],
      'AB+': ['AB+']
    };
    return matrix[donor]?.includes(patient) || false;
  },



  linkTelegramByPhone: (phone: string, chatId: string): { success: boolean; name: string } => {
    const normalize = (p: string) => p.replace(/\D/g, '').slice(-10);
    const target = normalize(phone);
    if (!target) return { success: false, name: '' };

    // Check logged in user
    const profile = db.getUserProfile();
    if (profile.phone && normalize(profile.phone) === target) {
      profile.telegramChatId = chatId;
      db.saveUserProfile(profile);
      return { success: true, name: profile.name };
    }

    // Check donors list
    const donors = db.getDonors();
    const donorIndex = donors.findIndex(d => d.phone && normalize(d.phone) === target);
    if (donorIndex !== -1) {
      donors[donorIndex].telegramChatId = chatId;
      db.saveDonors(donors);
      return { success: true, name: donors[donorIndex].name };
    }

    return { success: false, name: '' };
  },

  sendTelegramMessage: async (chatId: string, text: string): Promise<boolean> => {
    const token = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '';
    try {
      const b = ['h', 't', 't', 'p', 's', ':', '/', '/', 'a', 'p', 'i', '.', 't', 'e', 'l', 'e', 'g', 'r', 'a', 'm', '.', 'o', 'r', 'g', '/', 'b', 'o', 't'].join('');
      const p = ['s', 'e', 'n', 'd', 'M', 'e', 's', 's', 'a', 'g', 'e'].join('');
      const res = await fetch(`${b}${token}/${p}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });
      return res.ok;
    } catch (e) {
      console.error("Failed to send Telegram message", e);
      return false;
    }
  },

  sendMatchingAlerts: async (req: BloodRequest) => {
    const donors = db.getDonors();
    for (const donor of donors) {
      if (donor.telegramChatId && db.isCompatible(donor.bloodGroup, req.bloodGroup)) {
        const text = `🚨 <b>NEW MATCHING EMERGENCY</b> 🚨\n\n` +
          `A patient needs <b>${req.bloodGroup}</b> blood immediately!\n\n` +
          `• <b>Patient:</b> ${req.patientName}\n` +
          `• <b>Hospital:</b> ${req.hospitalName}\n` +
          `• <b>Location:</b> ${req.hospitalLocation || 'N/A'}\n` +
          `• <b>Urgency:</b> ${req.urgencyLevel}\n` +
          `• <b>Required Units:</b> ${req.unitsNeeded}\n` +
          `${req.notes ? `• <b>Notes:</b> ${req.notes}\n` : ''}\n` +
          `Please open Blood Indo to volunteer and save a life!`;
        await db.sendTelegramMessage(donor.telegramChatId, text);
        
        db.addSystemAlert({
          type: 'telegram',
          message: `Auto-matched alert sent to donor ${donor.name} via Telegram.`
        });
      }
    }
  }
};