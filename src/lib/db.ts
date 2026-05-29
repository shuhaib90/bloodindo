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
  lastDonationDate?: string;
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
  lastDonationDate?: string;
}

export interface DonationCamp {
  id: string;
  campName: string;
  organizerName: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  state: string;
  district: string;
  city: string;
  area: string;
  mapsUrl: string;
  contactNumber: string;
  registrationLink?: string;
  category: 'Blood Donation Camp' | 'Awareness Program' | 'Medical Camp' | 'Hospital Drive' | 'NGO Event' | 'Emergency Donation Drive';
  coverImage?: string;
  organizerLogo?: string;
  isCompleted: boolean;
  createdBy: string;
  createdAt: string;
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

export const INITIAL_CAMPS: DonationCamp[] = [];

const INITIAL_DONORS: Donor[] = [
  { id: '1', name: 'Raj Kumar', bloodGroup: 'O+', latitude: 12.9716, longitude: 77.5946, distance: 2.5, city: 'Bengaluru', phone: '+91 90000 00001', available: true, avatar: '🏥', badges: ['Fast Responder'], streak: 3 },
  { id: '2', name: 'Priya Sharma', bloodGroup: 'A-', latitude: 12.9816, longitude: 77.6046, distance: 4.2, city: 'Bengaluru', phone: '+91 90000 00002', available: true, avatar: '🩸', badges: ['Lifesaver'], streak: 5 },
  { id: '3', name: 'Mohammed Ali', bloodGroup: 'B+', latitude: 12.9616, longitude: 77.5846, distance: 1.8, city: 'Bengaluru', phone: '+91 90000 00003', available: true, avatar: '🏥', badges: [], streak: 1 },
  { id: '4', name: 'Anita Desai', bloodGroup: 'O-', latitude: 12.9916, longitude: 77.5746, distance: 5.6, city: 'Bengaluru', phone: '+91 90000 00004', available: true, avatar: '🩸', badges: ['Universal Donor'], streak: 8 },
  { id: '5', name: 'Vikram Singh', bloodGroup: 'AB+', latitude: 12.9516, longitude: 77.6146, distance: 3.1, city: 'Bengaluru', phone: '+91 90000 00005', available: true, avatar: '🏥', badges: [], streak: 2 }
];

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
        hospital_location: req.hospitalLocation,
        contact_details: req.contactDetails,
        notes: req.notes,
        countdown_minutes: req.countdownMinutes,
        units_needed: req.unitsNeeded,
        units_fulfilled: req.unitsFulfilled,
        urgency_level: req.urgencyLevel,
                status: req.status,
        created_at: req.createdAt,
        volunteers: req.volunteers
      });
    if (error) throw error;
  } catch (err) {
    console.warn("Supabase sync request failed (suppressed error overlay)", err instanceof Error ? err.message : String(err));
  }
};

const deleteRequestFromSupabase = async (requestId: string) => {
  try {
    const { error } = await supabase
      .from('bloodindo_requests')
      .delete()
      .eq('id', requestId);
    if (error) throw error;
  } catch (err) {
    console.warn("Supabase delete request failed (suppressed error overlay)", err instanceof Error ? err.message : String(err));
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
    if (typeof window !== 'undefined' && !(window as any).supabaseSyncInterval) {
      (window as any).supabaseSyncInterval = setInterval(() => {
        db.syncLocalFromSupabase();
      }, 5000);
    }
  },
  syncLocalFromSupabase: async (): Promise<void> => {
    try {
      console.log("[Supabase Sync] Fetching master data from Supabase...");
      const { data: dbRequests } = await supabase.from('bloodindo_requests').select('*').order('created_at', { ascending: false });
      if (dbRequests) {
        const previousRequests = db.getRequests();
        const previousIds = previousRequests.map(r => r.id);

        const mapped = dbRequests.map(r => ({
          id: r.id,
          patientName: r.patient_name,
          bloodGroup: r.blood_group as BloodGroup,
          hospitalName: r.hospital_name,
          hospitalLocation: r.hospital_location,
          contactDetails: r.contact_details,
          notes: r.notes,
          countdownMinutes: r.countdown_minutes,
          unitsNeeded: r.units_needed,
          unitsFulfilled: r.units_fulfilled,
          urgencyLevel: r.urgency_level as any,
          distance: r.distance || '',
          latitude: r.latitude || 12.9716,
          longitude: r.longitude || 77.5946,
          status: r.status as 'Active' | 'Fulfilled' | 'Expired',
          createdAt: r.created_at,
          volunteers: r.volunteers || []
        }));
        setStorageItem('blood_requests', mapped);

        // Auto-trigger alerts for newly synced active requests!
        for (const req of mapped) {
          if (req.status === 'Active' && !previousIds.includes(req.id)) {
            // Trigger matching alerts in the background
            db.sendMatchingAlerts(req);
          }
        }
      }
      
      // Synchronize Camps & Events from Supabase
      try {
        const { data: dbCamps } = await supabase.from('bloodindo_camps').select('*').order('event_date', { ascending: true });
        if (dbCamps && dbCamps.length > 0) {
          const mappedCamps = dbCamps.map(c => ({
            id: c.id,
            campName: c.camp_name,
            organizerName: c.organizer_name,
            description: c.description,
            eventDate: c.event_date,
            startTime: c.start_time,
            endTime: c.end_time,
            venueName: c.venue_name,
            state: c.state,
            district: c.district,
            city: c.city,
            area: c.area,
            mapsUrl: c.maps_url,
            contactNumber: c.contact_number,
            registrationLink: c.registration_link,
            category: c.category as any,
            coverImage: c.cover_image,
            organizerLogo: c.organizer_logo,
            isCompleted: c.is_completed,
            createdBy: c.created_by,
            createdAt: c.created_at
          }));
          setStorageItem('blood_camps', mappedCamps);
        }
      } catch (err) {
        console.warn('[Supabase Sync] Failed to fetch camps from Supabase (table may not exist yet):', err);
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

      if (dbActiveProfiles) {
        const jitter = (val: number) => {
          // Add a random offset between ~400m and ~1.2km (0.004 to 0.010 degrees) to hide exact homes
          const offset = 0.004 + Math.random() * 0.006;
          const sign = Math.random() < 0.5 ? -1 : 1;
          return val + (offset * sign);
        };

        const activeDonors = dbActiveProfiles.map(p => {
          const jitteredLat = p.latitude ? jitter(p.latitude) : 12.9720;
          const jitteredLng = p.longitude ? jitter(p.longitude) : 77.5930;
          
          // Build a safe vicinity summary (e.g., Near Attingal, Kerala) to protect exact home privacy
          const locationParts = [p.city, p.state].filter(Boolean);
          const locationLabel = locationParts.length > 0 
            ? `Near ${locationParts.join(", ")}` 
            : 'Near Kochi, Kerala';

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
            avatar: p.avatar || (p.badges && p.badges.includes('Fast Responder') ? '🏥' : '🩸'),
            badges: p.badges || [],
            streak: p.streak || 0,
            telegramChatId: p.telegram_chat_id || ''
          };
        });

        const currentLocal = getStorageItem<Donor[]>('blood_donors', INITIAL_DONORS);
        const profile = db.getUserProfile();
        
        const mergedList: Donor[] = [...activeDonors];
        
        if (profile && profile.isLoggedIn && profile.availableToDonate) {
          const userSelf = currentLocal.find(d => d.id === 'user_self');
          if (userSelf) {
            mergedList.push(userSelf);
          } else {
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
              avatar: '🏥',
              badges: profile.badges || [],
              streak: profile.streak || 0
            };
            mergedList.push(userSelfDonor);
          }
        }
        
        const mockIds = ['1', '2', '3', '4', '5'];
        mockIds.forEach(id => {
          const mock = currentLocal.find(d => d.id === id);
          if (mock && !mergedList.some(d => d.id === id)) {
            mergedList.push(mock);
          }
        });
        
        setStorageItem('blood_donors', mergedList);
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
    
    // Trigger matching alerts immediately
    db.sendMatchingAlerts(newRequest);
    
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

  markRequestAsFulfilled: async (requestId: string): Promise<{ success: boolean; message: string }> => {
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

      await syncRequestToSupabase(req);
      return { success: true, message: 'Request marked as successfully fulfilled.' };
    }
    return { success: false, message: 'Request not found.' };
  },

  updateRequest: async (requestId: string, updatedFields: Partial<BloodRequest>): Promise<{ success: boolean; message: string; request?: BloodRequest }> => {
    const requests = db.getRequests();
    const reqIndex = requests.findIndex(r => r.id === requestId);
    if (reqIndex !== -1) {
      const req = { ...requests[reqIndex], ...updatedFields };
      if (req.unitsFulfilled >= req.unitsNeeded) {
        req.status = 'Fulfilled';
      } else {
        req.status = 'Active';
      }
      requests[reqIndex] = req;
      db.saveRequests(requests);
      await syncRequestToSupabase(req);
      return { success: true, message: 'Request updated successfully.', request: req };
    }
    return { success: false, message: 'Request not found.' };
  },

  deleteRequest: async (requestId: string): Promise<{ success: boolean; message: string }> => {
    const requests = db.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
      requests.splice(index, 1);
      db.saveRequests(requests);
      await deleteRequestFromSupabase(requestId);
      return { success: true, message: 'Request deleted successfully.' };
    }
    return { success: false, message: 'Request not found.' };
  },

  getDonors: (): Donor[] => {
    const list = getStorageItem('blood_donors', INITIAL_DONORS);
    const profile = db.getUserProfile();
    const userIndex = list.findIndex(d => d.id === 'user_self');
    if (profile && profile.isLoggedIn && profile.availableToDonate) {
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
        avatar: '🏥',
        badges: profile.badges || [],
        streak: profile.streak || 0
      };
      
      if (userIndex === -1) {
        list.push(userSelfDonor);
      } else {
        list[userIndex] = userSelfDonor;
      }
    } else {
      if (userIndex !== -1) {
        list.splice(userIndex, 1);
      }
    }
    setStorageItem('blood_donors', list);
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
    // Legacy method - removed in favor of secure code verification system
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

  getCamps: (): DonationCamp[] => {
    return getStorageItem('blood_camps', INITIAL_CAMPS);
  },

  saveCamps: (camps: DonationCamp[]): void => {
    setStorageItem('blood_camps', camps);
  },

  createCamp: (campData: Omit<DonationCamp, 'id' | 'createdAt' | 'isCompleted'>): DonationCamp => {
    const camps = db.getCamps();
    const newCamp: DonationCamp = {
      ...campData,
      id: "camp_" + Date.now(),
      createdAt: new Date().toISOString(),
      isCompleted: false
    };
    camps.unshift(newCamp);
    db.saveCamps(camps);

    db.addSystemAlert({
      type: 'system',
      message: `NEW CAMP: ${newCamp.campName} by ${newCamp.organizerName} scheduled on ${newCamp.eventDate}.`
    });

    // Asynchronously sync to Supabase and trigger Telegram alerts
    db.syncCampToSupabase(newCamp);
    db.sendCampTelegramAlert(newCamp);

    return newCamp;
  },

  updateCamp: (id: string, updatedData: Partial<DonationCamp>): DonationCamp | null => {
    const camps = db.getCamps();
    const idx = camps.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const updatedCamp = {
      ...camps[idx],
      ...updatedData
    };
    camps[idx] = updatedCamp;
    db.saveCamps(camps);

    db.syncCampToSupabase(updatedCamp);
    return updatedCamp;
  },

  deleteCamp: (id: string): boolean => {
    const camps = db.getCamps();
    const filtered = camps.filter(c => c.id !== id);
    if (filtered.length === camps.length) return false;

    db.saveCamps(filtered);
    
    // Asynchronously delete from Supabase
    supabase.from('bloodindo_camps').delete().eq('id', id).then();
    return true;
  },

  syncCampToSupabase: async (camp: DonationCamp) => {
    try {
      await supabase
        .from('bloodindo_camps')
        .upsert({
          id: camp.id,
          camp_name: camp.campName,
          organizer_name: camp.organizerName,
          description: camp.description,
          event_date: camp.eventDate,
          start_time: camp.startTime,
          end_time: camp.endTime,
          venue_name: camp.venueName,
          state: camp.state,
          district: camp.district,
          city: camp.city,
          area: camp.area,
          maps_url: camp.mapsUrl,
          contact_number: camp.contactNumber,
          registration_link: camp.registrationLink,
          category: camp.category,
          cover_image: camp.coverImage,
          organizer_logo: camp.organizerLogo,
          is_completed: camp.isCompleted,
          created_by: camp.createdBy,
          created_at: camp.createdAt
        });
    } catch (e) {
      console.warn('[Supabase Sync] bloodindo_camps sync failed (table may not exist yet):', e);
    }
  },

  sendCampTelegramAlert: async (camp: DonationCamp) => {
    try {
      // 1. Fetch all profiles that have an active Telegram account
      const { data: allProfiles, error } = await supabase
        .from('bloodindo_profiles')
        .select('*')
        .not('telegram_chat_id', 'is', null);

      if (error) throw error;
      if (!allProfiles || allProfiles.length === 0) return;

      // 2. Perform case-insensitive & trimmed location matching in JavaScript for 100% precision
      for (const profile of allProfiles) {
        if (!profile.telegram_chat_id) continue;
        if (profile.telegram_chat_id.startsWith('CODE:')) continue;

        const pState = (profile.state || '').trim().toLowerCase();
        const pDistrict = (profile.district || '').trim().toLowerCase();
        const pCity = (profile.city || '').trim().toLowerCase();

        const cState = (camp.state || '').trim().toLowerCase();
        const cDistrict = (camp.district || '').trim().toLowerCase();
        const cCity = (camp.city || '').trim().toLowerCase();

        // Exact State, District, and City match!
        if (pState === cState && pDistrict === cDistrict && pCity === cCity) {
          // Custom Telegram Alert Message (New Blood Donation Camp Near You)
          const text = `🩸 <b>New Blood Donation Camp Near You</b>\n\n` +
            `<b>Camp:</b> ${camp.campName}\n` +
            `<b>Date:</b> ${camp.eventDate} (${camp.startTime} - ${camp.endTime})\n` +
            `<b>Location:</b> ${camp.venueName}, ${camp.city}, ${camp.district}\n\n` +
            `<i>A blood donation camp has been scheduled in your area.</i>\n\n` +
            `👉 <a href="https://bloodundo.in/camps">View Details and Participate</a>`;

          await db.sendTelegramMessage(profile.telegram_chat_id, text);
        }
      }
    } catch (err) {
      console.error('[Alert Engine] Camp telegram alert failed:', err);
    }
  },

  sendMatchingAlerts: async (req: BloodRequest) => {
    // 1. Prevent duplicate alerts using local storage tracking list
    const notifiedKey = 'bloodindo_notified_telegram_alerts';
    let notifiedList: string[] = [];
    try {
      const stored = localStorage.getItem(notifiedKey);
      if (stored) notifiedList = JSON.parse(stored);
    } catch {}

    try {
      // 2. Performance Query matching blood groups first
      const { data: dbActiveProfiles, error: fetchError } = await supabase
        .from('bloodindo_profiles')
        .select('*')
        .eq('available_to_donate', true)
        .eq('blood_group', req.bloodGroup);

      if (fetchError) throw fetchError;
      if (!dbActiveProfiles || dbActiveProfiles.length === 0) return;

      for (const profile of dbActiveProfiles) {
        if (!profile.telegram_chat_id) continue;
        
        // Skip if pending code (starts with CODE:)
        if (profile.telegram_chat_id.startsWith('CODE:')) continue;

        // Check duplicate alert for this request + donor
        const duplicateId = `${req.id}_${profile.telegram_chat_id}`;
        if (notifiedList.includes(duplicateId)) continue;

        // 3. Location Matching
        // Search for location keywords in request details
        const reqText = (
          req.hospitalName + ' ' + 
          (req.hospitalLocation || '') + ' ' + 
          (req.notes || '')
        ).toLowerCase();

        let isLocationMatched = false;
        let matchReason = '';

        const donorCity = (profile.city || '').trim().toLowerCase();
        const donorDistrict = (profile.district || '').trim().toLowerCase();
        const donorState = (profile.state || '').trim().toLowerCase();
        const donorArea = (profile.area || '').trim().toLowerCase();

        // Priority 1: Same City or Area Match
        if (donorCity && reqText.includes(donorCity)) {
          isLocationMatched = true;
          matchReason = `City Match (${profile.city})`;
        } else if (donorArea && reqText.includes(donorArea)) {
          isLocationMatched = true;
          matchReason = `Area Match (${profile.area})`;
        }
        // Priority 2: Same District Match
        else if (donorDistrict && reqText.includes(donorDistrict)) {
          isLocationMatched = true;
          matchReason = `District Match (${profile.district})`;
        }
        // Priority 3: Same State Match (Critical only)
        else if (donorState && reqText.includes(donorState)) {
          if (req.urgencyLevel === 'Critical') {
            isLocationMatched = true;
            matchReason = `State Match (Critical - ${profile.state})`;
          }
        }

        if (!isLocationMatched) continue;

        // Format location for alert message (Hide exact donor location, show only request details)
        const locationDisplay = req.hospitalLocation || req.hospitalName;

        // 4. Custom Telegram Alert Message (Urgent Blood Needed) - Sending All Details
        const text = `🚨 <b>Urgent Blood Needed</b>\n\n` +
          `<b>Patient:</b> ${req.patientName}\n` +
          `<b>Blood Group:</b> ${req.bloodGroup}\n` +
          `<b>Required Units:</b> ${req.unitsNeeded}\n` +
          `<b>Urgency:</b> ${req.urgencyLevel}\n` +
          `<b>Hospital:</b> ${req.hospitalName}\n` +
          `<b>Location:</b> ${locationDisplay}\n` +
          `<b>Contact Details:</b> ${req.contactDetails || 'N/A'}\n` +
          `${req.notes ? `<b>Notes:</b> ${req.notes}\n` : ''}\n` +
          `<i>This request matches your blood group and location.</i>\n\n` +
          `👉 <a href="https://bloodundo.in/feed?id=${req.id}">Tap to view details and help save a life</a>`

        const success = await db.sendTelegramMessage(profile.telegram_chat_id, text);
        if (success) {
          // Log duplicate prevention
          notifiedList.push(duplicateId);
          try {
            localStorage.setItem(notifiedKey, JSON.stringify(notifiedList));
          } catch {}

          db.addSystemAlert({
            type: 'telegram',
            message: `Auto-matched alert (${matchReason}) sent to donor ${profile.name} via Telegram.`
          });
        }
      }
    } catch (err) {
      console.error('[Alert Engine] Matching alert calculation failed:', err);
    }
  }
};
