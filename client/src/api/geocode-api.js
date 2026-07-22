const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

// Free OpenStreetMap geocoder — no API key, matches the Leaflet/OSM map already in use.
// Used for address-suggestion-as-you-type; not proxied through our backend to keep the stack simple.
export async function searchAddress(query, signal) {
  const trimmed = query?.trim();
  if (!trimmed || trimmed.length < 3) return [];

  const params = new URLSearchParams({
    q: trimmed,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '5',
    countrycodes: 'in',
  });

  const res = await fetch(`${NOMINATIM_URL}?${params}`, { signal });
  if (!res.ok) return [];
  const results = await res.json();

  return results.map((result) => ({
    label: result.display_name,
    address: result.display_name,
    lat: Number(result.lat),
    lng: Number(result.lon),
    area: result.address?.suburb || result.address?.neighbourhood || result.address?.locality || '',
    city:
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.address?.county ||
      '',
    state: result.address?.state || '',
  }));
}

// Turns a captured device GPS point back into a human-readable address, so the
// executive doesn't have to type what's already at their current location.
export async function reverseGeocode(lat, lng, signal) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'jsonv2',
    addressdetails: '1',
  });

  const res = await fetch(`${NOMINATIM_REVERSE_URL}?${params}`, { signal });
  if (!res.ok) return null;
  const result = await res.json();
  if (!result || result.error) return null;

  return {
    address: result.display_name,
    area: result.address?.suburb || result.address?.neighbourhood || result.address?.locality || '',
    city:
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.address?.county ||
      '',
    state: result.address?.state || '',
  };
}
