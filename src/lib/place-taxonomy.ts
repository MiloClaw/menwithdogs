// Editorial vibe tags for quality curation
// These help prevent "technically correct but vibes wrong" imports

export const VIBE_ENERGY_LABELS = [
  { value: 1, label: 'Quiet', description: 'Library-quiet, minimal interaction' },
  { value: 2, label: 'Calm', description: 'Low background noise, easy conversation' },
  { value: 3, label: 'Moderate', description: 'Normal ambient energy' },
  { value: 4, label: 'Lively', description: 'Active atmosphere, some noise' },
  { value: 5, label: 'High Energy', description: 'Loud, bustling, energetic' },
] as const;

export const VIBE_FORMALITY_LABELS = [
  { value: 1, label: 'Very Casual', description: 'Come as you are' },
  { value: 2, label: 'Casual', description: 'Relaxed dress code' },
  { value: 3, label: 'Smart Casual', description: 'Nice but not fancy' },
  { value: 4, label: 'Elevated', description: 'Dressy atmosphere' },
  { value: 5, label: 'Upscale', description: 'Fine dining / formal' },
] as const;

export const getVibeEnergyLabel = (value: number | null): string => {
  if (value === null) return 'Not set';
  return VIBE_ENERGY_LABELS.find(v => v.value === value)?.label || 'Unknown';
};

export const getVibeFormalityLabel = (value: number | null): string => {
  if (value === null) return 'Not set';
  return VIBE_FORMALITY_LABELS.find(v => v.value === value)?.label || 'Unknown';
};

// Check if any vibe tag is set for a place
export const hasVibeData = (place: {
  vibe_energy?: number | null;
  vibe_formality?: number | null;
  vibe_conversation?: boolean | null;
  vibe_daytime?: boolean | null;
  vibe_evening?: boolean | null;
}): boolean => {
  return (
    place.vibe_energy !== null && place.vibe_energy !== undefined ||
    place.vibe_formality !== null && place.vibe_formality !== undefined ||
    place.vibe_conversation !== null && place.vibe_conversation !== undefined ||
    place.vibe_daytime !== null && place.vibe_daytime !== undefined ||
    place.vibe_evening !== null && place.vibe_evening !== undefined
  );
};
