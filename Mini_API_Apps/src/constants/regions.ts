// ==========================================
// WatchWise — Watch Provider Regions
// ==========================================
// A short curated list rather than TMDB's full ~200-country list —
// covers where this app's audience actually is. ISO 3166-1 codes,
// as required by the /movie/{id}/watch/providers endpoint.

export interface Region {
  code: string;
  name: string;
}

export const REGIONS: Region[] = [
  { code: 'TH', name: 'Thailand' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
  { code: 'PH', name: 'Philippines' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'MY', name: 'Malaysia' },
];

export const DEFAULT_REGION = 'TH';
