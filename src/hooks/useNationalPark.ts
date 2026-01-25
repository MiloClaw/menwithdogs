import { nationalParks, NationalPark } from '@/lib/national-parks-data';

interface UseNationalParkResult {
  park: NationalPark | null;
  relatedParks: NationalPark[];
  isNotFound: boolean;
}

export function useNationalPark(parkId: string | undefined): UseNationalParkResult {
  const park = parkId 
    ? nationalParks.find(p => p.id === parkId) ?? null
    : null;
  
  const relatedParks = park 
    ? nationalParks.filter(p => 
        p.states.some(s => park.states.includes(s)) && p.id !== park.id
      ).slice(0, 6)
    : [];
  
  return { 
    park, 
    relatedParks, 
    isNotFound: Boolean(parkId && !park) 
  };
}
