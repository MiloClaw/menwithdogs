// NPS Unit Codes mapping from our park IDs to official NPS 4-letter codes
// Used for fetching trail data from NPS ArcGIS services

export const NPS_UNIT_CODES: Record<string, string> = {
  // Top 10 most visited parks with featured trail data
  'joshua-tree': 'JOTR',
  'grand-canyon': 'GRCA',
  'yosemite': 'YOSE',
  'yellowstone': 'YELL',
  'zion': 'ZION',
  'rocky-mountain': 'ROMO',
  'acadia': 'ACAD',
  'grand-teton': 'GRTE',
  'glacier': 'GLAC',
  'great-smoky-mountains': 'GRSM',
  
  // Additional parks (can be expanded)
  'denali': 'DENA',
  'death-valley': 'DEVA',
  'sequoia': 'SEQU',
  'kings-canyon': 'KICA',
  'olympic': 'OLYM',
  'arches': 'ARCH',
  'bryce-canyon': 'BRCA',
  'canyonlands': 'CANY',
  'capitol-reef': 'CARE',
  'crater-lake': 'CRLA',
  'mesa-verde': 'MEVE',
  'mount-rainier': 'MORA',
  'north-cascades': 'NOCA',
  'redwood': 'REDW',
  'saguaro': 'SAGU',
  'shenandoah': 'SHEN',
  'theodore-roosevelt': 'THRO',
  'badlands': 'BADL',
  'big-bend': 'BIBE',
  'carlsbad-caverns': 'CAVE',
  'everglades': 'EVER',
  'hawaii-volcanoes': 'HAVO',
  'haleakala': 'HALE',
  'lassen-volcanic': 'LAVO',
  'mammoth-cave': 'MACA',
  'petrified-forest': 'PEFO',
  'pinnacles': 'PINN',
  'white-sands': 'WHSA',
  'hot-springs': 'HOSP',
  'voyageurs': 'VOYA',
  'isle-royale': 'ISRO',
  'indiana-dunes': 'INDU',
  'biscayne': 'BISC',
  'dry-tortugas': 'DRTO',
  'channel-islands': 'CHIS',
  'gateway-arch': 'JEFF',
  'great-basin': 'GRBA',
  'great-sand-dunes': 'GRSA',
  'black-canyon': 'BLCA',
  'congaree': 'CONG',
  'cuyahoga-valley': 'CUVA',
  'guadalupe-mountains': 'GUMO',
  'kenai-fjords': 'KEFJ',
  'glacier-bay': 'GLBA',
  'katmai': 'KATM',
  'lake-clark': 'LACL',
  'wrangell-st-elias': 'WRST',
  'kobuk-valley': 'KOVA',
  'gates-of-the-arctic': 'GAAR',
  'american-samoa': 'NPSA',
  'virgin-islands': 'VIIS',
  'new-river-gorge': 'NERI',
};

// Get NPS unit code for a park, returns undefined if not mapped
export function getNPSUnitCode(parkId: string): string | undefined {
  return NPS_UNIT_CODES[parkId];
}

// Check if a park has NPS trail data available
export function hasNPSTrailData(parkId: string): boolean {
  return parkId in NPS_UNIT_CODES;
}
