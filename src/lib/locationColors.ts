export const LOCATION_COLORS: Record<string, string> = {
  'Quetta': '#3b82f6',
  'Faisalabad': '#10b981',
  'Lahore': '#f59e0b',
  'Islamabad': '#ef4444',
  'Multan': '#8b5cf6',
  'Saudi Arabia': '#ec4899',
  'Patti, India': '#14b8a6',
};

export const getLocationColor = (location: string | undefined | null): string => {
  if (!location) return '#94a3b8';
  if (LOCATION_COLORS[location]) return LOCATION_COLORS[location];
  
  let hash = 0;
  for (let i = 0; i < location.length; i++) {
    hash = location.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
};
