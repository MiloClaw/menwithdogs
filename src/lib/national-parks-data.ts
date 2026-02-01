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
  heroImageUrl: string;
  heroImageCredit: string;
}

export interface StateParks {
  stateAbbr: string;
  stateName: string;
  parks: NationalPark[];
}

// All 63 US National Parks (as of 2024)
export const nationalParks: NationalPark[] = [
  // Alaska (8 parks)
  { id: "denali", name: "Denali National Park", state: "AK", states: ["AK"], lat: 63.1148, lng: -151.1926, established: 1917, acreage: 4740911, npsUrl: "https://www.nps.gov/dena", description: "Home to North America's tallest peak and vast subarctic wilderness.", heroImageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80", heroImageCredit: "NPS / Denali" },
  { id: "gates-of-the-arctic", name: "Gates of the Arctic National Park", state: "AK", states: ["AK"], lat: 67.7863, lng: -153.3018, established: 1980, acreage: 7523897, npsUrl: "https://www.nps.gov/gaar", description: "America's northernmost park, entirely above the Arctic Circle.", heroImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", heroImageCredit: "NPS / Gates of the Arctic" },
  { id: "glacier-bay", name: "Glacier Bay National Park", state: "AK", states: ["AK"], lat: 58.6658, lng: -136.9000, established: 1980, acreage: 3223384, npsUrl: "https://www.nps.gov/glba", description: "Tidewater glaciers, rainforest, and abundant marine wildlife.", heroImageUrl: "https://images.unsplash.com/photo-1501908734255-16579c18c25f?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "katmai", name: "Katmai National Park", state: "AK", states: ["AK"], lat: 58.5970, lng: -154.6939, established: 1980, acreage: 3674529, npsUrl: "https://www.nps.gov/katm", description: "Famous for brown bears fishing at Brooks Falls.", heroImageUrl: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&q=80", heroImageCredit: "NPS / Katmai" },
  { id: "kenai-fjords", name: "Kenai Fjords National Park", state: "AK", states: ["AK"], lat: 59.9226, lng: -149.6500, established: 1980, acreage: 669650, npsUrl: "https://www.nps.gov/kefj", description: "Glaciers flowing from the Harding Icefield into the sea.", heroImageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "kobuk-valley", name: "Kobuk Valley National Park", state: "AK", states: ["AK"], lat: 67.3356, lng: -159.1289, established: 1980, acreage: 1750716, npsUrl: "https://www.nps.gov/kova", description: "Arctic sand dunes and caribou migration routes.", heroImageUrl: "https://images.unsplash.com/photo-1520962880247-cfaf541c8724?w=800&q=80", heroImageCredit: "NPS / Kobuk Valley" },
  { id: "lake-clark", name: "Lake Clark National Park", state: "AK", states: ["AK"], lat: 60.4127, lng: -154.3235, established: 1980, acreage: 2619816, npsUrl: "https://www.nps.gov/lacl", description: "Volcanoes, glaciers, and pristine salmon-filled waters.", heroImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "wrangell-st-elias", name: "Wrangell-St. Elias National Park", state: "AK", states: ["AK"], lat: 61.4182, lng: -142.6028, established: 1980, acreage: 8323147, npsUrl: "https://www.nps.gov/wrst", description: "America's largest national park with nine of the 16 highest peaks.", heroImageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", heroImageCredit: "Unsplash" },

  // American Samoa (1 park)
  { id: "american-samoa", name: "National Park of American Samoa", state: "AS", states: ["AS"], lat: -14.2583, lng: -170.6883, established: 1988, acreage: 8256, npsUrl: "https://www.nps.gov/npsa", description: "Tropical rainforest, coral reefs, and Samoan culture.", heroImageUrl: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80", heroImageCredit: "NPS / American Samoa" },

  // Arizona (3 parks)
  { id: "grand-canyon", name: "Grand Canyon National Park", state: "AZ", states: ["AZ"], lat: 36.0544, lng: -112.1401, established: 1919, acreage: 1201647, npsUrl: "https://www.nps.gov/grca", description: "One of Earth's most awe-inspiring landscapes carved by the Colorado River.", heroImageUrl: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "petrified-forest", name: "Petrified Forest National Park", state: "AZ", states: ["AZ"], lat: 35.0657, lng: -109.7890, established: 1962, acreage: 221390, npsUrl: "https://www.nps.gov/pefo", description: "Colorful badlands and one of the world's largest petrified wood concentrations.", heroImageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80", heroImageCredit: "NPS / Petrified Forest" },
  { id: "saguaro", name: "Saguaro National Park", state: "AZ", states: ["AZ"], lat: 32.1479, lng: -110.7382, established: 1994, acreage: 92867, npsUrl: "https://www.nps.gov/sagu", description: "Iconic giant saguaro cacti in the Sonoran Desert.", heroImageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80", heroImageCredit: "Unsplash" },

  // Arkansas (1 park)
  { id: "hot-springs", name: "Hot Springs National Park", state: "AR", states: ["AR"], lat: 34.5217, lng: -93.0424, established: 1921, acreage: 5554, npsUrl: "https://www.nps.gov/hosp", description: "Historic bathhouses and naturally heated spring waters.", heroImageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", heroImageCredit: "NPS / Hot Springs" },

  // California (9 parks)
  { id: "channel-islands", name: "Channel Islands National Park", state: "CA", states: ["CA"], lat: 34.0069, lng: -119.7785, established: 1980, acreage: 249561, npsUrl: "https://www.nps.gov/chis", description: "Five islands with unique plants, animals, and archaeological resources.", heroImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", heroImageCredit: "NPS / Channel Islands" },
  { id: "death-valley", name: "Death Valley National Park", state: "CA", states: ["CA", "NV"], lat: 36.5054, lng: -117.0794, established: 1994, acreage: 3408406, npsUrl: "https://www.nps.gov/deva", description: "Hottest place on Earth with dramatic desert landscapes.", heroImageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "joshua-tree", name: "Joshua Tree National Park", state: "CA", states: ["CA"], lat: 33.8734, lng: -115.9010, established: 1994, acreage: 795155, npsUrl: "https://www.nps.gov/jotr", description: "Where the Mojave and Colorado deserts meet, featuring iconic Joshua trees.", heroImageUrl: "https://images.unsplash.com/photo-1527489377706-5bf97e608852?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "kings-canyon", name: "Kings Canyon National Park", state: "CA", states: ["CA"], lat: 36.8879, lng: -118.5551, established: 1940, acreage: 461901, npsUrl: "https://www.nps.gov/seki", description: "Deep granite canyons and giant sequoia groves.", heroImageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "lassen-volcanic", name: "Lassen Volcanic National Park", state: "CA", states: ["CA"], lat: 40.4977, lng: -121.5080, established: 1916, acreage: 106589, npsUrl: "https://www.nps.gov/lavo", description: "All four types of volcanoes, hydrothermal features, and clear mountain lakes.", heroImageUrl: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "pinnacles", name: "Pinnacles National Park", state: "CA", states: ["CA"], lat: 36.4906, lng: -121.1825, established: 2013, acreage: 26685, npsUrl: "https://www.nps.gov/pinn", description: "Towering rock spires and talus caves, home to California condors.", heroImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", heroImageCredit: "NPS / Pinnacles" },
  { id: "redwood", name: "Redwood National Park", state: "CA", states: ["CA"], lat: 41.2132, lng: -124.0046, established: 1968, acreage: 138999, npsUrl: "https://www.nps.gov/redw", description: "World's tallest trees along the Northern California coast.", heroImageUrl: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "sequoia", name: "Sequoia National Park", state: "CA", states: ["CA"], lat: 36.4864, lng: -118.5658, established: 1890, acreage: 404064, npsUrl: "https://www.nps.gov/seki", description: "Giant sequoias including General Sherman, the world's largest tree.", heroImageUrl: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "yosemite", name: "Yosemite National Park", state: "CA", states: ["CA"], lat: 37.8651, lng: -119.5383, established: 1890, acreage: 761747, npsUrl: "https://www.nps.gov/yose", description: "Iconic granite cliffs, waterfalls, and ancient giant sequoias.", heroImageUrl: "https://images.unsplash.com/photo-1562310503-a918c4c61e38?w=800&q=80", heroImageCredit: "Unsplash" },

  // Colorado (4 parks)
  { id: "black-canyon", name: "Black Canyon of the Gunnison National Park", state: "CO", states: ["CO"], lat: 38.5754, lng: -107.7416, established: 1999, acreage: 30779, npsUrl: "https://www.nps.gov/blca", description: "Dramatic steep-walled gorge carved by the Gunnison River.", heroImageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80", heroImageCredit: "NPS / Black Canyon" },
  { id: "great-sand-dunes", name: "Great Sand Dunes National Park", state: "CO", states: ["CO"], lat: 37.7916, lng: -105.5943, established: 2004, acreage: 107341, npsUrl: "https://www.nps.gov/grsa", description: "North America's tallest sand dunes backed by snow-capped peaks.", heroImageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "mesa-verde", name: "Mesa Verde National Park", state: "CO", states: ["CO"], lat: 37.2309, lng: -108.4618, established: 1906, acreage: 52485, npsUrl: "https://www.nps.gov/meve", description: "Well-preserved Ancestral Puebloan cliff dwellings.", heroImageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80", heroImageCredit: "NPS / Mesa Verde" },
  { id: "rocky-mountain", name: "Rocky Mountain National Park", state: "CO", states: ["CO"], lat: 40.3428, lng: -105.6836, established: 1915, acreage: 265807, npsUrl: "https://www.nps.gov/romo", description: "Alpine lakes, meadows, and mountain peaks including Longs Peak.", heroImageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", heroImageCredit: "Unsplash" },

  // Florida (3 parks)
  { id: "biscayne", name: "Biscayne National Park", state: "FL", states: ["FL"], lat: 25.4824, lng: -80.2083, established: 1980, acreage: 172971, npsUrl: "https://www.nps.gov/bisc", description: "Coral reefs, mangrove shorelines, and aquamarine waters.", heroImageUrl: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "dry-tortugas", name: "Dry Tortugas National Park", state: "FL", states: ["FL"], lat: 24.6285, lng: -82.8732, established: 1992, acreage: 64701, npsUrl: "https://www.nps.gov/drto", description: "Remote island fort and pristine coral reefs.", heroImageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", heroImageCredit: "NPS / Dry Tortugas" },
  { id: "everglades", name: "Everglades National Park", state: "FL", states: ["FL"], lat: 25.2866, lng: -80.8987, established: 1947, acreage: 1508938, npsUrl: "https://www.nps.gov/ever", description: "Largest subtropical wilderness in the United States.", heroImageUrl: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800&q=80", heroImageCredit: "Unsplash" },

  // Hawaii (2 parks)
  { id: "haleakala", name: "Haleakalā National Park", state: "HI", states: ["HI"], lat: 20.7204, lng: -156.1552, established: 1961, acreage: 33264, npsUrl: "https://www.nps.gov/hale", description: "Maui's dormant volcano with otherworldly summit and rare species.", heroImageUrl: "https://images.unsplash.com/photo-1542259009477-d625272157b7?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "hawaii-volcanoes", name: "Hawai'i Volcanoes National Park", state: "HI", states: ["HI"], lat: 19.4194, lng: -155.2885, established: 1916, acreage: 335259, npsUrl: "https://www.nps.gov/havo", description: "Two active volcanoes including Kīlauea, one of the world's most active.", heroImageUrl: "https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=800&q=80", heroImageCredit: "Unsplash" },

  // Indiana (1 park)
  { id: "indiana-dunes", name: "Indiana Dunes National Park", state: "IN", states: ["IN"], lat: 41.6533, lng: -87.0524, established: 2019, acreage: 15349, npsUrl: "https://www.nps.gov/indu", description: "Sandy beaches and diverse ecosystems along Lake Michigan.", heroImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", heroImageCredit: "NPS / Indiana Dunes" },

  // Kentucky (1 park)
  { id: "mammoth-cave", name: "Mammoth Cave National Park", state: "KY", states: ["KY"], lat: 37.1870, lng: -86.1005, established: 1941, acreage: 54011, npsUrl: "https://www.nps.gov/maca", description: "World's longest known cave system with over 400 miles explored.", heroImageUrl: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80", heroImageCredit: "NPS / Mammoth Cave" },

  // Maine (1 park)
  { id: "acadia", name: "Acadia National Park", state: "ME", states: ["ME"], lat: 44.3386, lng: -68.2733, established: 1919, acreage: 49071, npsUrl: "https://www.nps.gov/acad", description: "Rugged Atlantic coastline, granite peaks, and woodland trails.", heroImageUrl: "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=800&q=80", heroImageCredit: "Unsplash" },

  // Michigan (1 park)
  { id: "isle-royale", name: "Isle Royale National Park", state: "MI", states: ["MI"], lat: 48.1000, lng: -88.5500, established: 1940, acreage: 571790, npsUrl: "https://www.nps.gov/isro", description: "Remote wilderness island in Lake Superior, famous for wolf-moose study.", heroImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", heroImageCredit: "NPS / Isle Royale" },

  // Minnesota (1 park)
  { id: "voyageurs", name: "Voyageurs National Park", state: "MN", states: ["MN"], lat: 48.4839, lng: -92.8284, established: 1975, acreage: 218222, npsUrl: "https://www.nps.gov/voya", description: "Interconnected waterways once traveled by French-Canadian voyageurs.", heroImageUrl: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800&q=80", heroImageCredit: "Unsplash" },

  // Missouri (1 park)
  { id: "gateway-arch", name: "Gateway Arch National Park", state: "MO", states: ["MO"], lat: 38.6247, lng: -90.1848, established: 2018, acreage: 192, npsUrl: "https://www.nps.gov/jeff", description: "Iconic 630-foot stainless steel arch commemorating westward expansion.", heroImageUrl: "https://images.unsplash.com/photo-1543953099-a6e5a8d1f2a9?w=800&q=80", heroImageCredit: "Unsplash" },

  // Montana (2 parks)
  { id: "glacier", name: "Glacier National Park", state: "MT", states: ["MT"], lat: 48.7596, lng: -113.7870, established: 1910, acreage: 1013125, npsUrl: "https://www.nps.gov/glac", description: "Pristine forests, alpine meadows, and rugged mountains with over 700 lakes.", heroImageUrl: "https://images.unsplash.com/photo-1501908734255-16579c18c25f?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "yellowstone", name: "Yellowstone National Park", state: "WY", states: ["WY", "MT", "ID"], lat: 44.4280, lng: -110.5885, established: 1872, acreage: 2219790, npsUrl: "https://www.nps.gov/yell", description: "World's first national park, famous for geysers and abundant wildlife.", heroImageUrl: "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=800&q=80", heroImageCredit: "Unsplash" },

  // Nevada (1 park)
  { id: "great-basin", name: "Great Basin National Park", state: "NV", states: ["NV"], lat: 38.9833, lng: -114.3000, established: 1986, acreage: 77180, npsUrl: "https://www.nps.gov/grba", description: "Ancient bristlecone pines, limestone caves, and dark night skies.", heroImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", heroImageCredit: "NPS / Great Basin" },

  // New Mexico (2 parks)
  { id: "carlsbad-caverns", name: "Carlsbad Caverns National Park", state: "NM", states: ["NM"], lat: 32.1232, lng: -104.5567, established: 1930, acreage: 46766, npsUrl: "https://www.nps.gov/cave", description: "Over 100 caves with massive chambers and spectacular formations.", heroImageUrl: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80", heroImageCredit: "NPS / Carlsbad Caverns" },
  { id: "white-sands", name: "White Sands National Park", state: "NM", states: ["NM"], lat: 32.7872, lng: -106.3257, established: 2019, acreage: 146344, npsUrl: "https://www.nps.gov/whsa", description: "World's largest gypsum dune field, brilliant white rolling dunes.", heroImageUrl: "https://images.unsplash.com/photo-1520962880247-cfaf541c8724?w=800&q=80", heroImageCredit: "Unsplash" },

  // North Carolina (1 park)
  { id: "great-smoky-mountains", name: "Great Smoky Mountains National Park", state: "TN", states: ["TN", "NC"], lat: 35.6532, lng: -83.5070, established: 1934, acreage: 522426, npsUrl: "https://www.nps.gov/grsm", description: "America's most visited park with ancient mountains and diverse plant life.", heroImageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80", heroImageCredit: "Unsplash" },

  // North Dakota (1 park)
  { id: "theodore-roosevelt", name: "Theodore Roosevelt National Park", state: "ND", states: ["ND"], lat: 46.9790, lng: -103.5387, established: 1978, acreage: 70446, npsUrl: "https://www.nps.gov/thro", description: "Colorful badlands where Roosevelt ranched and developed conservation ethics.", heroImageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80", heroImageCredit: "NPS / Theodore Roosevelt" },

  // Ohio (1 park)
  { id: "cuyahoga-valley", name: "Cuyahoga Valley National Park", state: "OH", states: ["OH"], lat: 41.2808, lng: -81.5678, established: 2000, acreage: 32571, npsUrl: "https://www.nps.gov/cuva", description: "Scenic valley with waterfalls, forests, and historic canal.", heroImageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80", heroImageCredit: "Unsplash" },

  // Oregon (1 park)
  { id: "crater-lake", name: "Crater Lake National Park", state: "OR", states: ["OR"], lat: 42.9446, lng: -122.1090, established: 1902, acreage: 183224, npsUrl: "https://www.nps.gov/crla", description: "Deepest lake in the US, known for its stunning blue color.", heroImageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80", heroImageCredit: "Unsplash" },

  // South Carolina (1 park)
  { id: "congaree", name: "Congaree National Park", state: "SC", states: ["SC"], lat: 33.7948, lng: -80.7821, established: 2003, acreage: 26476, npsUrl: "https://www.nps.gov/cong", description: "Largest intact old-growth bottomland hardwood forest in the US.", heroImageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80", heroImageCredit: "Unsplash" },

  // South Dakota (2 parks)
  { id: "badlands", name: "Badlands National Park", state: "SD", states: ["SD"], lat: 43.8554, lng: -102.3397, established: 1978, acreage: 242755, npsUrl: "https://www.nps.gov/badl", description: "Dramatically eroded buttes, pinnacles, and mixed-grass prairie.", heroImageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "wind-cave", name: "Wind Cave National Park", state: "SD", states: ["SD"], lat: 43.5724, lng: -103.4394, established: 1903, acreage: 33970, npsUrl: "https://www.nps.gov/wica", description: "One of the world's longest caves with unique boxwork formations.", heroImageUrl: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80", heroImageCredit: "NPS / Wind Cave" },

  // Tennessee - Great Smoky is listed under NC for organization
  
  // Texas (2 parks)
  { id: "big-bend", name: "Big Bend National Park", state: "TX", states: ["TX"], lat: 29.1275, lng: -103.2425, established: 1944, acreage: 801163, npsUrl: "https://www.nps.gov/bibe", description: "Chihuahuan Desert, Rio Grande canyons, and the Chisos Mountains.", heroImageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "guadalupe-mountains", name: "Guadalupe Mountains National Park", state: "TX", states: ["TX"], lat: 31.9231, lng: -104.8645, established: 1972, acreage: 86367, npsUrl: "https://www.nps.gov/gumo", description: "Texas's highest peak and an ancient fossilized reef.", heroImageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80", heroImageCredit: "Unsplash" },

  // US Virgin Islands (1 park)
  { id: "virgin-islands", name: "Virgin Islands National Park", state: "VI", states: ["VI"], lat: 18.3358, lng: -64.7505, established: 1956, acreage: 14940, npsUrl: "https://www.nps.gov/viis", description: "Pristine beaches, coral reefs, and tropical forests on St. John.", heroImageUrl: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80", heroImageCredit: "Unsplash" },

  // Utah (5 parks)
  { id: "arches", name: "Arches National Park", state: "UT", states: ["UT"], lat: 38.7331, lng: -109.5925, established: 1971, acreage: 76678, npsUrl: "https://www.nps.gov/arch", description: "Over 2,000 natural stone arches including iconic Delicate Arch.", heroImageUrl: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "bryce-canyon", name: "Bryce Canyon National Park", state: "UT", states: ["UT"], lat: 37.5930, lng: -112.1871, established: 1928, acreage: 35835, npsUrl: "https://www.nps.gov/brca", description: "Largest collection of hoodoos—distinctive red rock spires.", heroImageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "canyonlands", name: "Canyonlands National Park", state: "UT", states: ["UT"], lat: 38.3269, lng: -109.8783, established: 1964, acreage: 337597, npsUrl: "https://www.nps.gov/cany", description: "Vast wilderness of countless canyons carved by the Colorado River.", heroImageUrl: "https://images.unsplash.com/photo-1496128858413-b36217c2ce36?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "capitol-reef", name: "Capitol Reef National Park", state: "UT", states: ["UT"], lat: 38.0877, lng: -111.1505, established: 1971, acreage: 241904, npsUrl: "https://www.nps.gov/care", description: "100-mile wrinkle in the earth's crust with colorful cliffs and domes.", heroImageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "zion", name: "Zion National Park", state: "UT", states: ["UT"], lat: 37.2982, lng: -113.0263, established: 1919, acreage: 147242, npsUrl: "https://www.nps.gov/zion", description: "Towering red cliffs and narrow slot canyons in the high desert.", heroImageUrl: "https://images.unsplash.com/photo-1535747831336-47bce9afb4c5?w=800&q=80", heroImageCredit: "Unsplash" },

  // Virginia (1 park)
  { id: "shenandoah", name: "Shenandoah National Park", state: "VA", states: ["VA"], lat: 38.4755, lng: -78.4535, established: 1935, acreage: 199223, npsUrl: "https://www.nps.gov/shen", description: "Blue Ridge Mountains with Skyline Drive and over 500 miles of trails.", heroImageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80", heroImageCredit: "Unsplash" },

  // Washington (3 parks)
  { id: "mount-rainier", name: "Mount Rainier National Park", state: "WA", states: ["WA"], lat: 46.8800, lng: -121.7269, established: 1899, acreage: 236381, npsUrl: "https://www.nps.gov/mora", description: "Iconic volcano with the most glaciated peak in the contiguous US.", heroImageUrl: "https://images.unsplash.com/photo-1501908734255-16579c18c25f?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "north-cascades", name: "North Cascades National Park", state: "WA", states: ["WA"], lat: 48.7718, lng: -121.2985, established: 1968, acreage: 504780, npsUrl: "https://www.nps.gov/noca", description: "Rugged mountain wilderness with over 300 glaciers.", heroImageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", heroImageCredit: "Unsplash" },
  { id: "olympic", name: "Olympic National Park", state: "WA", states: ["WA"], lat: 47.8021, lng: -123.6044, established: 1938, acreage: 922649, npsUrl: "https://www.nps.gov/olym", description: "Diverse ecosystems from glacier-capped peaks to temperate rainforest to coast.", heroImageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80", heroImageCredit: "Unsplash" },

  // West Virginia (1 park)
  { id: "new-river-gorge", name: "New River Gorge National Park", state: "WV", states: ["WV"], lat: 38.0658, lng: -81.0543, established: 2020, acreage: 7021, npsUrl: "https://www.nps.gov/neri", description: "Deep canyon with world-class whitewater and rock climbing.", heroImageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80", heroImageCredit: "Unsplash" },

  // Wyoming (2 parks - Yellowstone listed under Montana)
  { id: "grand-teton", name: "Grand Teton National Park", state: "WY", states: ["WY"], lat: 43.7904, lng: -110.6818, established: 1929, acreage: 310044, npsUrl: "https://www.nps.gov/grte", description: "Dramatic Teton Range rising abruptly above Jackson Hole valley.", heroImageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80", heroImageCredit: "Unsplash" },
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
export function getStateParks(): StateParks[] {
  const grouped = nationalParks.reduce((acc, park) => {
    const stateKey = park.state;
    if (!acc[stateKey]) {
      acc[stateKey] = {
        stateAbbr: stateKey,
        stateName: stateNames[stateKey] || stateKey,
        parks: [],
      };
    }
    acc[stateKey].parks.push(park);
    return acc;
  }, {} as Record<string, StateParks>);

  return Object.values(grouped).sort((a, b) => 
    a.stateName.localeCompare(b.stateName)
  );
}

// Alias for backwards compatibility
export const groupParksByState = getStateParks;

// Get park statistics
export function getParkStats() {
  const totalAcreage = nationalParks.reduce((sum, p) => sum + p.acreage, 0);
  const statesCount = new Set(nationalParks.flatMap(p => p.states)).size;
  
  return {
    totalParks: nationalParks.length,
    totalAcreage,
    statesCount,
    oldestPark: nationalParks.reduce((oldest, p) => 
      p.established < oldest.established ? p : oldest
    ),
    newestPark: nationalParks.reduce((newest, p) => 
      p.established > newest.established ? p : newest
    ),
    largestPark: nationalParks.reduce((largest, p) => 
      p.acreage > largest.acreage ? p : largest
    ),
  };
}

// Get count of parks per region
export function getParksByRegion() {
  const regions = {
    "West": ["AK", "AZ", "CA", "CO", "HI", "MT", "NV", "NM", "OR", "UT", "WA", "WY", "ID"],
    "Southeast": ["AR", "FL", "KY", "NC", "SC", "TN", "VA", "WV", "VI"],
    "Midwest": ["IN", "MI", "MN", "MO", "ND", "OH", "SD"],
    "Northeast": ["ME"],
    "Pacific Islands": ["AS"],
  };

  return Object.entries(regions).map(([region, states]) => ({
    region,
    count: nationalParks.filter(p => states.includes(p.state)).length,
    parks: nationalParks.filter(p => states.includes(p.state)),
  }));
}
