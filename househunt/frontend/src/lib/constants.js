export const TYPE_OPTIONS = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'INDEPENDENT_HOUSE', label: 'Independent house' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'PENTHOUSE', label: 'Penthouse' },
  { value: 'SERVICE_APARTMENT', label: 'Service apartment' },
];

export const FURNISHING_OPTIONS = [
  { value: 'FURNISHED', label: 'Fully furnished' },
  { value: 'SEMI_FURNISHED', label: 'Semi furnished' },
  { value: 'UNFURNISHED', label: 'Unfurnished' },
];

export const BED_OPTIONS = [
  { value: '1', label: '1+ bed' },
  { value: '2', label: '2+ beds' },
  { value: '3', label: '3+ beds' },
  { value: '4', label: '4+ beds' },
];

export const RENT_PRESETS = [
  { label: 'Any budget', value: '' },
  { label: 'Under ₹15k', min: 0, max: 15000 },
  { label: '₹15k – ₹30k', min: 15000, max: 30000 },
  { label: '₹30k – ₹50k', min: 30000, max: 50000 },
  { label: '₹50k – ₹80k', min: 50000, max: 80000 },
  { label: '₹80k+', min: 80000, max: 999999999 },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'relevance', label: 'Most relevant' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'area', label: 'Largest area' },
];

export const AMENITY_CATEGORIES = ['essential', 'lifestyle', 'outdoor', 'security'];

export const AMENITY_CATEGORY_LABEL = {
  essential: 'Essentials', lifestyle: 'Lifestyle', outdoor: 'Outdoors', security: 'Safety & security',
};

// Neighbourhood list is fetched from the API; these coordinates are the
// fallback used while the map bootstraps and for SEO-safe markup.
export const NEIGHBOURHOOD_FALLBACK = [
  { slug: 'indiranagar', name: 'Indiranagar', lat: 12.9719, lng: 77.6412 },
  { slug: 'koramangala', name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { slug: 'hsr-layout', name: 'HSR Layout', lat: 12.9116, lng: 77.6397 },
  { slug: 'whitefield', name: 'Whitefield', lat: 12.9698, lng: 77.7499 },
  { slug: 'bellandur', name: 'Bellandur', lat: 12.926, lng: 77.6773 },
  { slug: 'electronic-city', name: 'Electronic City', lat: 12.8452, lng: 77.6602 },
  { slug: 'jayanagar', name: 'Jayanagar', lat: 12.925, lng: 77.5938 },
  { slug: 'jp-nagar', name: 'JP Nagar', lat: 12.9056, lng: 77.5855 },
  { slug: 'yelahanka', name: 'Yelahanka', lat: 13.1007, lng: 77.5963 },
  { slug: 'hebbal', name: 'Hebbal', lat: 13.0358, lng: 77.597 },
];

export const BLR = { lat: 12.9716, lng: 77.5946, zoom: 11.4 };

export const MIN = 0;
