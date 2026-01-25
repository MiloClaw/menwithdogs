export interface NationalPark {
  id: string;
  name: string;
  state: string;
  states: string[];
  lat: number;
  lng: number;
  established: number;
  acreage: number;
  npsUrl: string;
  description: string;
}

export interface StateParks {
  stateAbbr: string;
  stateName: string;
  parks: NationalPark[];
}

// All 63 US National Parks (as of 2024)
export const nationalParks: NationalPark[] = [
  // Alaska (8 parks)
  { id: "denali", name: "Denali National Park", state: "AK", states: ["AK"], lat: 63.1148, lng: -151.1926, established: 1917, acreage: 4740911, npsUrl: "https://www.nps.gov/dena", description: "Home to North America's tallest peak and vast subarctic wilderness." },
  { id: "gates-of-the-arctic", name: "Gates of the Arctic National Park", state: "AK", states: ["AK"], lat: 67.7863, lng: -153.3018, established: 1980, acreage: 7523897, npsUrl: "https://www.nps.gov/gaar", description: "America's northernmost park, entirely above the Arctic Circle." },
  { id: "glacier-bay", name: "Glacier Bay National Park", state: "AK", states: ["AK"], lat: 58.6658, lng: -136.9000, established: 1980, acreage: 3223384, npsUrl: "https://www.nps.gov/glba", description: "Tidewater glaciers, rainforest, and abundant marine wildlife." },
  { id: "katmai", name: "Katmai National Park", state: "AK", states: ["AK"], lat: 58.5970, lng: -154.6939, established: 1980, acreage: 3674529, npsUrl: "https://www.nps.gov/katm", description: "Famous for brown bears fishing at Brooks Falls." },
  { id: "kenai-fjords", name: "Kenai Fjords National Park", state: "AK", states: ["AK"], lat: 59.9226, lng: -149.6500, established: 1980, acreage: 669650, npsUrl: "https://www.nps.gov/kefj", description: "Glaciers flowing from the Harding Icefield into the sea." },
  { id: "kobuk-valley", name: "Kobuk Valley National Park", state: "AK", states: ["AK"], lat: 67.3356, lng: -159.1289, established: 1980, acreage: 1750716, npsUrl: "https://www.nps.gov/kova", description: "Arctic sand dunes and caribou migration routes." },
  { id: "lake-clark", name: "Lake Clark National Park", state: "AK", states: ["AK"], lat: 60.4127, lng: -154.3235, established: 1980, acreage: 2619816, npsUrl: "https://www.nps.gov/lacl", description: "Volcanoes, glaciers, and pristine salmon-filled waters." },
  { id: "wrangell-st-elias", name: "Wrangell-St. Elias National Park", state: "AK", states: ["AK"], lat: 61.4182, lng: -142.6028, established: 1980, acreage: 8323147, npsUrl: "https://www.nps.gov/wrst", description: "America's largest national park with nine of the 16 highest peaks." },

  // American Samoa (1 park)
  { id: "american-samoa", name: "National Park of American Samoa", state: "AS", states: ["AS"], lat: -14.2583, lng: -170.6883, established: 1988, acreage: 8256, npsUrl: "https://www.nps.gov/npsa", description: "Tropical rainforest, coral reefs, and Samoan culture." },

  // Arizona (3 parks)
  { id: "grand-canyon", name: "Grand Canyon National Park", state: "AZ", states: ["AZ"], lat: 36.0544, lng: -112.1401, established: 1919, acreage: 1201647, npsUrl: "https://www.nps.gov/grca", description: "One of Earth's most awe-inspiring landscapes carved by the Colorado River." },
  { id: "petrified-forest", name: "Petrified Forest National Park", state: "AZ", states: ["AZ"], lat: 35.0657, lng: -109.7890, established: 1962, acreage: 221390, npsUrl: "https://www.nps.gov/pefo", description: "Colorful badlands and one of the world's largest petrified wood concentrations." },
  { id: "saguaro", name: "Saguaro National Park", state: "AZ", states: ["AZ"], lat: 32.1479, lng: -110.7382, established: 1994, acreage: 92867, npsUrl: "https://www.nps.gov/sagu", description: "Iconic giant saguaro cacti in the Sonoran Desert." },

  // Arkansas (1 park)
  { id: "hot-springs", name: "Hot Springs National Park", state: "AR", states: ["AR"], lat: 34.5217, lng: -93.0424, established: 1921, acreage: 5554, npsUrl: "https://www.nps.gov/hosp", description: "Historic bathhouses and naturally heated spring waters." },

  // California (9 parks)
  { id: "channel-islands", name: "Channel Islands National Park", state: "CA", states: ["CA"], lat: 34.0069, lng: -119.7785, established: 1980, acreage: 249561, npsUrl: "https://www.nps.gov/chis", description: "Five islands with unique plants, animals, and archaeological resources." },
  { id: "death-valley", name: "Death Valley National Park", state: "CA", states: ["CA", "NV"], lat: 36.5054, lng: -117.0794, established: 1994, acreage: 3408406, npsUrl: "https://www.nps.gov/deva", description: "Hottest place on Earth with dramatic desert landscapes." },
  { id: "joshua-tree", name: "Joshua Tree National Park", state: "CA", states: ["CA"], lat: 33.8734, lng: -115.9010, established: 1994, acreage: 795155, npsUrl: "https://www.nps.gov/jotr", description: "Where the Mojave and Colorado deserts meet, featuring iconic Joshua trees." },
  { id: "kings-canyon", name: "Kings Canyon National Park", state: "CA", states: ["CA"], lat: 36.8879, lng: -118.5551, established: 1940, acreage: 461901, npsUrl: "https://www.nps.gov/seki", description: "Deep granite canyons and giant sequoia groves." },
  { id: "lassen-volcanic", name: "Lassen Volcanic National Park", state: "CA", states: ["CA"], lat: 40.4977, lng: -121.5080, established: 1916, acreage: 106589, npsUrl: "https://www.nps.gov/lavo", description: "All four types of volcanoes, hydrothermal features, and clear mountain lakes." },
  { id: "pinnacles", name: "Pinnacles National Park", state: "CA", states: ["CA"], lat: 36.4906, lng: -121.1825, established: 2013, acreage: 26685, npsUrl: "https://www.nps.gov/pinn", description: "Towering rock spires and talus caves, home to California condors." },
  { id: "redwood", name: "Redwood National Park", state: "CA", states: ["CA"], lat: 41.2132, lng: -124.0046, established: 1968, acreage: 138999, npsUrl: "https://www.nps.gov/redw", description: "World's tallest trees along the Northern California coast." },
  { id: "sequoia", name: "Sequoia National Park", state: "CA", states: ["CA"], lat: 36.4864, lng: -118.5658, established: 1890, acreage: 404064, npsUrl: "https://www.nps.gov/seki", description: "Giant sequoias including General Sherman, the world's largest tree." },
  { id: "yosemite", name: "Yosemite National Park", state: "CA", states: ["CA"], lat: 37.8651, lng: -119.5383, established: 1890, acreage: 761747, npsUrl: "https://www.nps.gov/yose", description: "Iconic granite cliffs, waterfalls, and ancient giant sequoias." },

  // Colorado (4 parks)
  { id: "black-canyon", name: "Black Canyon of the Gunnison National Park", state: "CO", states: ["CO"], lat: 38.5754, lng: -107.7416, established: 1999, acreage: 30779, npsUrl: "https://www.nps.gov/blca", description: "Dramatic steep-walled gorge carved by the Gunnison River." },
  { id: "great-sand-dunes", name: "Great Sand Dunes National Park", state: "CO", states: ["CO"], lat: 37.7916, lng: -105.5943, established: 2004, acreage: 107341, npsUrl: "https://www.nps.gov/grsa", description: "North America's tallest sand dunes backed by snow-capped peaks." },
  { id: "mesa-verde", name: "Mesa Verde National Park", state: "CO", states: ["CO"], lat: 37.2309, lng: -108.4618, established: 1906, acreage: 52485, npsUrl: "https://www.nps.gov/meve", description: "Well-preserved Ancestral Puebloan cliff dwellings." },
  { id: "rocky-mountain", name: "Rocky Mountain National Park", state: "CO", states: ["CO"], lat: 40.3428, lng: -105.6836, established: 1915, acreage: 265807, npsUrl: "https://www.nps.gov/romo", description: "Alpine lakes, meadows, and mountain peaks including Longs Peak." },

  // Florida (3 parks)
  { id: "biscayne", name: "Biscayne National Park", state: "FL", states: ["FL"], lat: 25.4824, lng: -80.2083, established: 1980, acreage: 172971, npsUrl: "https://www.nps.gov/bisc", description: "Coral reefs, mangrove shorelines, and aquamarine waters." },
  { id: "dry-tortugas", name: "Dry Tortugas National Park", state: "FL", states: ["FL"], lat: 24.6285, lng: -82.8732, established: 1992, acreage: 64701, npsUrl: "https://www.nps.gov/drto", description: "Remote island fort and pristine coral reefs." },
  { id: "everglades", name: "Everglades National Park", state: "FL", states: ["FL"], lat: 25.2866, lng: -80.8987, established: 1947, acreage: 1508938, npsUrl: "https://www.nps.gov/ever", description: "Largest subtropical wilderness in the United States." },

  // Hawaii (2 parks)
  { id: "haleakala", name: "Haleakalā National Park", state: "HI", states: ["HI"], lat: 20.7204, lng: -156.1552, established: 1961, acreage: 33264, npsUrl: "https://www.nps.gov/hale", description: "Maui's dormant volcano with otherworldly summit and rare species." },
  { id: "hawaii-volcanoes", name: "Hawai'i Volcanoes National Park", state: "HI", states: ["HI"], lat: 19.4194, lng: -155.2885, established: 1916, acreage: 335259, npsUrl: "https://www.nps.gov/havo", description: "Two active volcanoes including Kīlauea, one of the world's most active." },

  // Indiana (1 park)
  { id: "indiana-dunes", name: "Indiana Dunes National Park", state: "IN", states: ["IN"], lat: 41.6533, lng: -87.0524, established: 2019, acreage: 15349, npsUrl: "https://www.nps.gov/indu", description: "Sandy beaches and diverse ecosystems along Lake Michigan." },

  // Kentucky (1 park)
  { id: "mammoth-cave", name: "Mammoth Cave National Park", state: "KY", states: ["KY"], lat: 37.1870, lng: -86.1005, established: 1941, acreage: 54011, npsUrl: "https://www.nps.gov/maca", description: "World's longest known cave system with over 400 miles explored." },

  // Maine (1 park)
  { id: "acadia", name: "Acadia National Park", state: "ME", states: ["ME"], lat: 44.3386, lng: -68.2733, established: 1919, acreage: 49071, npsUrl: "https://www.nps.gov/acad", description: "Rugged Atlantic coastline, granite peaks, and woodland trails." },

  // Michigan (1 park)
  { id: "isle-royale", name: "Isle Royale National Park", state: "MI", states: ["MI"], lat: 48.1000, lng: -88.5500, established: 1940, acreage: 571790, npsUrl: "https://www.nps.gov/isro", description: "Remote wilderness island in Lake Superior, famous for wolf-moose study." },

  // Minnesota (1 park)
  { id: "voyageurs", name: "Voyageurs National Park", state: "MN", states: ["MN"], lat: 48.4839, lng: -92.8284, established: 1975, acreage: 218222, npsUrl: "https://www.nps.gov/voya", description: "Interconnected waterways once traveled by French-Canadian voyageurs." },

  // Missouri (1 park)
  { id: "gateway-arch", name: "Gateway Arch National Park", state: "MO", states: ["MO"], lat: 38.6247, lng: -90.1848, established: 2018, acreage: 192, npsUrl: "https://www.nps.gov/jeff", description: "Iconic 630-foot stainless steel arch commemorating westward expansion." },

  // Montana (2 parks)
  { id: "glacier", name: "Glacier National Park", state: "MT", states: ["MT"], lat: 48.7596, lng: -113.7870, established: 1910, acreage: 1013125, npsUrl: "https://www.nps.gov/glac", description: "Pristine forests, alpine meadows, and rugged mountains with over 700 lakes." },
  { id: "yellowstone", name: "Yellowstone National Park", state: "WY", states: ["WY", "MT", "ID"], lat: 44.4280, lng: -110.5885, established: 1872, acreage: 2219790, npsUrl: "https://www.nps.gov/yell", description: "World's first national park, famous for geysers and abundant wildlife." },

  // Nevada (1 park)
  { id: "great-basin", name: "Great Basin National Park", state: "NV", states: ["NV"], lat: 38.9833, lng: -114.3000, established: 1986, acreage: 77180, npsUrl: "https://www.nps.gov/grba", description: "Ancient bristlecone pines, limestone caves, and dark night skies." },

  // New Mexico (2 parks)
  { id: "carlsbad-caverns", name: "Carlsbad Caverns National Park", state: "NM", states: ["NM"], lat: 32.1232, lng: -104.5567, established: 1930, acreage: 46766, npsUrl: "https://www.nps.gov/cave", description: "Over 100 caves with massive chambers and spectacular formations." },
  { id: "white-sands", name: "White Sands National Park", state: "NM", states: ["NM"], lat: 32.7872, lng: -106.3257, established: 2019, acreage: 146344, npsUrl: "https://www.nps.gov/whsa", description: "World's largest gypsum dune field, brilliant white rolling dunes." },

  // North Carolina (1 park)
  { id: "great-smoky-mountains", name: "Great Smoky Mountains National Park", state: "TN", states: ["TN", "NC"], lat: 35.6532, lng: -83.5070, established: 1934, acreage: 522426, npsUrl: "https://www.nps.gov/grsm", description: "America's most visited park with ancient mountains and diverse plant life." },

  // North Dakota (1 park)
  { id: "theodore-roosevelt", name: "Theodore Roosevelt National Park", state: "ND", states: ["ND"], lat: 46.9790, lng: -103.5387, established: 1978, acreage: 70446, npsUrl: "https://www.nps.gov/thro", description: "Colorful badlands where Roosevelt ranched and developed conservation ethics." },

  // Ohio (1 park)
  { id: "cuyahoga-valley", name: "Cuyahoga Valley National Park", state: "OH", states: ["OH"], lat: 41.2808, lng: -81.5678, established: 2000, acreage: 32571, npsUrl: "https://www.nps.gov/cuva", description: "Scenic valley with waterfalls, forests, and historic canal." },

  // Oregon (1 park)
  { id: "crater-lake", name: "Crater Lake National Park", state: "OR", states: ["OR"], lat: 42.9446, lng: -122.1090, established: 1902, acreage: 183224, npsUrl: "https://www.nps.gov/crla", description: "Deepest lake in the US, known for its stunning blue color." },

  // South Carolina (1 park)
  { id: "congaree", name: "Congaree National Park", state: "SC", states: ["SC"], lat: 33.7948, lng: -80.7821, established: 2003, acreage: 26476, npsUrl: "https://www.nps.gov/cong", description: "Largest intact old-growth bottomland hardwood forest in the US." },

  // South Dakota (2 parks)
  { id: "badlands", name: "Badlands National Park", state: "SD", states: ["SD"], lat: 43.8554, lng: -102.3397, established: 1978, acreage: 242755, npsUrl: "https://www.nps.gov/badl", description: "Dramatically eroded buttes, pinnacles, and mixed-grass prairie." },
  { id: "wind-cave", name: "Wind Cave National Park", state: "SD", states: ["SD"], lat: 43.5724, lng: -103.4394, established: 1903, acreage: 33970, npsUrl: "https://www.nps.gov/wica", description: "One of the world's longest caves with unique boxwork formations." },

  // Tennessee - Great Smoky is listed under NC for organization
  
  // Texas (2 parks)
  { id: "big-bend", name: "Big Bend National Park", state: "TX", states: ["TX"], lat: 29.1275, lng: -103.2425, established: 1944, acreage: 801163, npsUrl: "https://www.nps.gov/bibe", description: "Chihuahuan Desert, Rio Grande canyons, and the Chisos Mountains." },
  { id: "guadalupe-mountains", name: "Guadalupe Mountains National Park", state: "TX", states: ["TX"], lat: 31.9231, lng: -104.8645, established: 1972, acreage: 86367, npsUrl: "https://www.nps.gov/gumo", description: "Texas's highest peak and an ancient fossilized reef." },

  // US Virgin Islands (1 park)
  { id: "virgin-islands", name: "Virgin Islands National Park", state: "VI", states: ["VI"], lat: 18.3358, lng: -64.7505, established: 1956, acreage: 14940, npsUrl: "https://www.nps.gov/viis", description: "Pristine beaches, coral reefs, and tropical forests on St. John." },

  // Utah (5 parks)
  { id: "arches", name: "Arches National Park", state: "UT", states: ["UT"], lat: 38.7331, lng: -109.5925, established: 1971, acreage: 76678, npsUrl: "https://www.nps.gov/arch", description: "Over 2,000 natural stone arches including iconic Delicate Arch." },
  { id: "bryce-canyon", name: "Bryce Canyon National Park", state: "UT", states: ["UT"], lat: 37.5930, lng: -112.1871, established: 1928, acreage: 35835, npsUrl: "https://www.nps.gov/brca", description: "Largest collection of hoodoos—distinctive red rock spires." },
  { id: "canyonlands", name: "Canyonlands National Park", state: "UT", states: ["UT"], lat: 38.3269, lng: -109.8783, established: 1964, acreage: 337597, npsUrl: "https://www.nps.gov/cany", description: "Vast wilderness of countless canyons carved by the Colorado River." },
  { id: "capitol-reef", name: "Capitol Reef National Park", state: "UT", states: ["UT"], lat: 38.0877, lng: -111.1505, established: 1971, acreage: 241904, npsUrl: "https://www.nps.gov/care", description: "100-mile wrinkle in the earth's crust with colorful cliffs and domes." },
  { id: "zion", name: "Zion National Park", state: "UT", states: ["UT"], lat: 37.2982, lng: -113.0263, established: 1919, acreage: 147242, npsUrl: "https://www.nps.gov/zion", description: "Towering red cliffs and narrow slot canyons in the high desert." },

  // Virginia (1 park)
  { id: "shenandoah", name: "Shenandoah National Park", state: "VA", states: ["VA"], lat: 38.4755, lng: -78.4535, established: 1935, acreage: 199223, npsUrl: "https://www.nps.gov/shen", description: "Blue Ridge Mountains with Skyline Drive and over 500 miles of trails." },

  // Washington (3 parks)
  { id: "mount-rainier", name: "Mount Rainier National Park", state: "WA", states: ["WA"], lat: 46.8800, lng: -121.7269, established: 1899, acreage: 236381, npsUrl: "https://www.nps.gov/mora", description: "Iconic volcano with the most glaciated peak in the contiguous US." },
  { id: "north-cascades", name: "North Cascades National Park", state: "WA", states: ["WA"], lat: 48.7718, lng: -121.2985, established: 1968, acreage: 504780, npsUrl: "https://www.nps.gov/noca", description: "Rugged mountain wilderness with over 300 glaciers." },
  { id: "olympic", name: "Olympic National Park", state: "WA", states: ["WA"], lat: 47.8021, lng: -123.6044, established: 1938, acreage: 922649, npsUrl: "https://www.nps.gov/olym", description: "Diverse ecosystems from glacier-capped peaks to temperate rainforest to coast." },

  // West Virginia (1 park)
  { id: "new-river-gorge", name: "New River Gorge National Park", state: "WV", states: ["WV"], lat: 38.0658, lng: -81.0543, established: 2020, acreage: 7021, npsUrl: "https://www.nps.gov/neri", description: "Deep canyon with world-class whitewater and rock climbing." },

  // Wyoming (2 parks - Yellowstone listed under Montana)
  { id: "grand-teton", name: "Grand Teton National Park", state: "WY", states: ["WY"], lat: 43.7904, lng: -110.6818, established: 1929, acreage: 310044, npsUrl: "https://www.nps.gov/grte", description: "Dramatic Teton Range rising abruptly above Jackson Hole valley." },
];

// State name mapping
const stateNames: Record<string, string> = {
  AK: "Alaska",
  AS: "American Samoa",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  FL: "Florida",
  HI: "Hawaii",
  IN: "Indiana",
  KY: "Kentucky",
  ME: "Maine",
  MI: "Michigan",
  MN: "Minnesota",
  MO: "Missouri",
  MT: "Montana",
  NV: "Nevada",
  NM: "New Mexico",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OR: "Oregon",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  VI: "US Virgin Islands",
  UT: "Utah",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WY: "Wyoming",
  ID: "Idaho",
};

// Group parks by primary state
export function groupParksByState(): StateParks[] {
  const grouped: Record<string, NationalPark[]> = {};
  
  nationalParks.forEach(park => {
    if (!grouped[park.state]) {
      grouped[park.state] = [];
    }
    grouped[park.state].push(park);
  });

  // Sort states alphabetically by name, then parks within each state
  return Object.entries(grouped)
    .map(([stateAbbr, parks]) => ({
      stateAbbr,
      stateName: stateNames[stateAbbr] || stateAbbr,
      parks: parks.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.stateName.localeCompare(b.stateName));
}

// Calculate total stats
export function getParkStats() {
  const totalParks = nationalParks.length;
  const totalAcreage = nationalParks.reduce((sum, park) => sum + park.acreage, 0);
  const stateCount = new Set(nationalParks.map(p => p.state)).size;
  const oldestPark = nationalParks.reduce((oldest, park) => 
    park.established < oldest.established ? park : oldest
  );
  
  return {
    totalParks,
    totalAcreage,
    stateCount,
    oldestPark,
    formattedAcreage: `${(totalAcreage / 1000000).toFixed(1)}M`,
  };
}
