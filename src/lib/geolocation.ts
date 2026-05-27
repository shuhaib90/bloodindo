"use client";

export interface LocationData {
  latitude: number;
  longitude: number;
  country: string;
  state: string;
  district: string;
  city: string;
  area: string;
  displayAddress: string;
}

export async function requestGPSLocation(): Promise<{latitude: number; longitude: number}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location permission denied. Please enable GPS access."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information unavailable."));
            break;
          case error.TIMEOUT:
            reject(new Error("Location request timed out."));
            break;
          default:
            reject(new Error("Unknown location error."));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationData> {
  try {
    const url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lon + "&zoom=18&addressdetails=1&accept-language=en";
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BloodIndo/1.0 (Emergency Blood Donation Platform)'
      }
    });

    if (!response.ok) {
      throw new Error("Geocoding request failed");
    }

    const data = await response.json();
    const addr = data.address || {};

    return {
      latitude: lat,
      longitude: lon,
      country: addr.country || '',
      state: addr.state || '',
      district: addr.state_district || addr.county || '',
      city: addr.city || addr.town || addr.village || addr.municipality || '',
      area: addr.suburb || addr.neighbourhood || addr.road || addr.hamlet || '',
      displayAddress: data.display_name || ''
    };
  } catch (e) {
    console.error("Reverse geocoding failed:", e);
    return {
      latitude: lat,
      longitude: lon,
      country: '',
      state: '',
      district: '',
      city: '',
      area: '',
      displayAddress: 'Location detected (geocoding unavailable)'
    };
  }
}

export async function detectFullLocation(): Promise<LocationData> {
  const coords = await requestGPSLocation();
  const locationData = await reverseGeocode(coords.latitude, coords.longitude);
  return locationData;
}
