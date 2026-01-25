// Trail data types and curated trail information for National Parks
// Separated from national-parks-data.ts to avoid bloating that file

export type TrailDifficulty = 'easy' | 'moderate' | 'strenuous';

export interface Trail {
  id: string;
  name: string;
  distance: number; // miles (round-trip unless noted)
  difficulty: TrailDifficulty;
  elevationGain?: number; // feet
  description: string;
  trailhead: [number, number]; // [lng, lat]
  isLoop?: boolean;
}

export interface ParkTrails {
  parkId: string;
  trails: Trail[];
}

// Difficulty color mapping for UI
export const DIFFICULTY_COLORS: Record<TrailDifficulty, { bg: string; text: string; border: string }> = {
  easy: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  moderate: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  strenuous: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
};

// Curated featured trails for popular National Parks
// Data sourced from NPS.gov and AllTrails
export const PARK_TRAILS: Record<string, Trail[]> = {
  // Joshua Tree National Park
  'joshua-tree': [
    {
      id: 'ryan-mountain',
      name: 'Ryan Mountain Trail',
      distance: 3.0,
      difficulty: 'strenuous',
      elevationGain: 1050,
      description: '360-degree panoramic views from the summit. One of the park\'s most rewarding hikes.',
      trailhead: [-116.1369, 33.9856],
    },
    {
      id: 'hidden-valley',
      name: 'Hidden Valley Nature Trail',
      distance: 1.0,
      difficulty: 'easy',
      description: 'Loop through massive boulder formations. Great for rock scrambling and wildlife.',
      trailhead: [-116.1675, 34.0117],
      isLoop: true,
    },
    {
      id: 'barker-dam',
      name: 'Barker Dam Loop',
      distance: 1.1,
      difficulty: 'easy',
      description: 'Historic dam and Native American petroglyphs. Best after rain when the dam holds water.',
      trailhead: [-116.1585, 34.0203],
      isLoop: true,
    },
    {
      id: 'skull-rock',
      name: 'Skull Rock Nature Trail',
      distance: 1.7,
      difficulty: 'easy',
      description: 'Iconic skull-shaped boulder and desert wash exploration.',
      trailhead: [-116.0544, 34.0024],
      isLoop: true,
    },
    {
      id: 'lost-horse-mine',
      name: 'Lost Horse Mine Trail',
      distance: 4.0,
      difficulty: 'moderate',
      elevationGain: 480,
      description: 'Historic gold mining ruins with expansive desert views.',
      trailhead: [-116.1553, 33.9667],
    },
    {
      id: 'fortynine-palms-oasis',
      name: '49 Palms Oasis Trail',
      distance: 3.0,
      difficulty: 'moderate',
      elevationGain: 600,
      description: 'Desert oasis with fan palms. Best in cooler months.',
      trailhead: [-116.1028, 34.1067],
    },
  ],

  // Grand Canyon National Park
  'grand-canyon': [
    {
      id: 'bright-angel',
      name: 'Bright Angel Trail',
      distance: 12.4,
      difficulty: 'strenuous',
      elevationGain: 4380,
      description: 'Iconic rim-to-river trail. Day hikers should turn around at 1.5 or 3-Mile Resthouse.',
      trailhead: [-112.1435, 36.0576],
    },
    {
      id: 'south-kaibab',
      name: 'South Kaibab Trail',
      distance: 6.4,
      difficulty: 'strenuous',
      elevationGain: 4860,
      description: 'Steep descent with panoramic views. No water - carry plenty. Ooh Aah Point is a popular turnaround.',
      trailhead: [-112.0837, 36.0531],
    },
    {
      id: 'rim-trail',
      name: 'Rim Trail',
      distance: 13.0,
      difficulty: 'easy',
      description: 'Paved and flat. Walk any section for stunning canyon views. Connects major viewpoints.',
      trailhead: [-112.1397, 36.0571],
    },
    {
      id: 'hermit-trail',
      name: 'Hermit Trail',
      distance: 18.8,
      difficulty: 'strenuous',
      elevationGain: 5200,
      description: 'Less crowded wilderness trail. Rocky and unmaintained below Santa Maria Spring.',
      trailhead: [-112.2078, 36.0642],
    },
  ],

  // Yosemite National Park
  'yosemite': [
    {
      id: 'half-dome',
      name: 'Half Dome',
      distance: 16.0,
      difficulty: 'strenuous',
      elevationGain: 4800,
      description: 'Iconic granite dome. Permit required for cables. Start before dawn.',
      trailhead: [-119.5584, 37.7270],
    },
    {
      id: 'mist-trail',
      name: 'Mist Trail to Vernal Fall',
      distance: 5.4,
      difficulty: 'strenuous',
      elevationGain: 1000,
      description: 'Get soaked by Vernal Fall spray. Continue to Nevada Fall for the full experience.',
      trailhead: [-119.5584, 37.7270],
    },
    {
      id: 'yosemite-falls',
      name: 'Yosemite Falls Trail',
      distance: 7.2,
      difficulty: 'strenuous',
      elevationGain: 2700,
      description: 'Climb to top of North America\'s tallest waterfall. Best in spring.',
      trailhead: [-119.5972, 37.7457],
    },
    {
      id: 'valley-loop',
      name: 'Valley Loop Trail',
      distance: 11.5,
      difficulty: 'easy',
      description: 'Flat loop around Yosemite Valley floor. Views of El Capitan and Bridalveil Fall.',
      trailhead: [-119.5912, 37.7416],
      isLoop: true,
    },
    {
      id: 'mirror-lake',
      name: 'Mirror Lake Loop',
      distance: 5.0,
      difficulty: 'easy',
      description: 'Reflections of Half Dome and Mt. Watkins. Best in spring when lake is full.',
      trailhead: [-119.5559, 37.7442],
      isLoop: true,
    },
  ],

  // Zion National Park
  'zion': [
    {
      id: 'angels-landing',
      name: 'Angels Landing',
      distance: 5.4,
      difficulty: 'strenuous',
      elevationGain: 1488,
      description: 'Thrilling knife-edge ridge with chains. Permit required. Not for those afraid of heights.',
      trailhead: [-112.9508, 37.2592],
    },
    {
      id: 'the-narrows',
      name: 'The Narrows (Bottom-Up)',
      distance: 9.0,
      difficulty: 'strenuous',
      description: 'Wade through the Virgin River between 2000ft canyon walls. Rent gear in Springdale.',
      trailhead: [-112.9469, 37.2850],
    },
    {
      id: 'observation-point',
      name: 'Observation Point',
      distance: 8.0,
      difficulty: 'strenuous',
      elevationGain: 2148,
      description: 'Highest viewpoint in Zion Canyon. Look down on Angels Landing.',
      trailhead: [-112.9380, 37.2693],
    },
    {
      id: 'riverside-walk',
      name: 'Riverside Walk',
      distance: 2.2,
      difficulty: 'easy',
      description: 'Paved path to the start of The Narrows. Hanging gardens and canyon views.',
      trailhead: [-112.9469, 37.2850],
    },
    {
      id: 'emerald-pools',
      name: 'Emerald Pools Trail',
      distance: 3.0,
      difficulty: 'moderate',
      elevationGain: 350,
      description: 'Three tiered pools with seasonal waterfalls. Lower pool is wheelchair accessible.',
      trailhead: [-112.9578, 37.2553],
    },
  ],

  // Yellowstone National Park
  'yellowstone': [
    {
      id: 'old-faithful-geyser',
      name: 'Old Faithful Geyser Loop',
      distance: 1.0,
      difficulty: 'easy',
      description: 'Boardwalk loop around Old Faithful and nearby thermal features.',
      trailhead: [-110.8282, 44.4605],
      isLoop: true,
    },
    {
      id: 'grand-prismatic',
      name: 'Grand Prismatic Overlook',
      distance: 1.6,
      difficulty: 'moderate',
      elevationGain: 200,
      description: 'Best view of the famous rainbow hot spring. Short but steep.',
      trailhead: [-110.8381, 44.5247],
    },
    {
      id: 'uncle-tom-trail',
      name: 'Uncle Tom\'s Trail',
      distance: 0.5,
      difficulty: 'moderate',
      elevationGain: 500,
      description: '328 steel stairs to Lower Yellowstone Falls. Strenuous on the return.',
      trailhead: [-110.4950, 44.7180],
    },
    {
      id: 'mt-washburn',
      name: 'Mount Washburn',
      distance: 6.4,
      difficulty: 'moderate',
      elevationGain: 1400,
      description: 'Fire lookout with 360-degree views. Watch for bighorn sheep.',
      trailhead: [-110.4372, 44.7985],
    },
    {
      id: 'fairy-falls',
      name: 'Fairy Falls',
      distance: 5.4,
      difficulty: 'easy',
      description: '197-foot waterfall plus Grand Prismatic overlook on the way.',
      trailhead: [-110.8548, 44.5247],
    },
  ],

  // Rocky Mountain National Park
  'rocky-mountain': [
    {
      id: 'sky-pond',
      name: 'Sky Pond',
      distance: 9.8,
      difficulty: 'strenuous',
      elevationGain: 1740,
      description: 'Alpine lake beneath the Cathedral Spires. Scramble up The Loch and Timberline Falls.',
      trailhead: [-105.6421, 40.3117],
    },
    {
      id: 'bear-lake',
      name: 'Bear Lake Loop',
      distance: 0.8,
      difficulty: 'easy',
      description: 'Scenic alpine lake with mountain reflections. Fully accessible.',
      trailhead: [-105.6456, 40.3117],
      isLoop: true,
    },
    {
      id: 'emerald-lake-romo',
      name: 'Emerald Lake Trail',
      distance: 3.6,
      difficulty: 'moderate',
      elevationGain: 650,
      description: 'Three alpine lakes: Nymph, Dream, and Emerald. One of the park\'s most popular.',
      trailhead: [-105.6456, 40.3117],
    },
    {
      id: 'chasm-lake',
      name: 'Chasm Lake',
      distance: 8.4,
      difficulty: 'strenuous',
      elevationGain: 2360,
      description: 'Dramatic lake beneath Longs Peak\'s Diamond face. High altitude challenge.',
      trailhead: [-105.5572, 40.2705],
    },
    {
      id: 'alberta-falls',
      name: 'Alberta Falls',
      distance: 1.6,
      difficulty: 'easy',
      elevationGain: 200,
      description: '30-foot waterfall through Glacier Gorge. Great for families.',
      trailhead: [-105.6380, 40.3106],
    },
  ],

  // Acadia National Park
  'acadia': [
    {
      id: 'precipice',
      name: 'Precipice Trail',
      distance: 1.6,
      difficulty: 'strenuous',
      elevationGain: 1000,
      description: 'Iron rungs and ladders up cliff face. Closed during peregrine falcon nesting.',
      trailhead: [-68.1889, 44.3489],
    },
    {
      id: 'beehive',
      name: 'Beehive Loop',
      distance: 1.5,
      difficulty: 'strenuous',
      elevationGain: 450,
      description: 'Iron rungs up exposed granite with Sand Beach views. Thrilling but not for everyone.',
      trailhead: [-68.1856, 44.3306],
    },
    {
      id: 'cadillac-summit',
      name: 'Cadillac Summit Loop',
      distance: 0.5,
      difficulty: 'easy',
      description: 'First place to see sunrise in the US (Oct-Mar). Paved summit loop.',
      trailhead: [-68.2253, 44.3522],
      isLoop: true,
    },
    {
      id: 'jordan-pond',
      name: 'Jordan Pond Path',
      distance: 3.3,
      difficulty: 'easy',
      description: 'Loop around crystal-clear pond with North Bubble views. Pop into Jordan Pond House for popovers.',
      trailhead: [-68.2531, 44.3206],
      isLoop: true,
    },
    {
      id: 'bubble-rock',
      name: 'South Bubble',
      distance: 1.0,
      difficulty: 'moderate',
      elevationGain: 300,
      description: 'Glacial erratic "Bubble Rock" balanced on cliff edge.',
      trailhead: [-68.2514, 44.3286],
    },
  ],

  // Grand Teton National Park
  'grand-teton': [
    {
      id: 'cascade-canyon',
      name: 'Cascade Canyon',
      distance: 9.1,
      difficulty: 'moderate',
      elevationGain: 1100,
      description: 'Take the Jenny Lake boat shuttle to cut 4 miles. Watch for moose.',
      trailhead: [-110.7261, 43.7706],
    },
    {
      id: 'delta-lake',
      name: 'Delta Lake',
      distance: 8.0,
      difficulty: 'strenuous',
      elevationGain: 2300,
      description: 'Turquoise glacial lake beneath the Grand. Unmarked but well-worn social trail.',
      trailhead: [-110.6850, 43.7583],
    },
    {
      id: 'taggart-lake',
      name: 'Taggart Lake',
      distance: 3.0,
      difficulty: 'easy',
      elevationGain: 350,
      description: 'Picturesque lake with Teton backdrop. Great for families.',
      trailhead: [-110.7330, 43.7020],
    },
    {
      id: 'lake-solitude',
      name: 'Lake Solitude',
      distance: 14.5,
      difficulty: 'strenuous',
      elevationGain: 2400,
      description: 'Remote alpine lake at canyon\'s head. All-day adventure.',
      trailhead: [-110.7261, 43.7706],
    },
    {
      id: 'inspiration-point',
      name: 'Inspiration Point',
      distance: 2.0,
      difficulty: 'moderate',
      elevationGain: 420,
      description: 'Jenny Lake overlook via shuttle. Combine with Hidden Falls.',
      trailhead: [-110.7261, 43.7706],
    },
  ],

  // Glacier National Park
  'glacier': [
    {
      id: 'highline',
      name: 'Highline Trail',
      distance: 11.8,
      difficulty: 'strenuous',
      elevationGain: 830,
      description: 'Continental Divide traverse from Logan Pass. Arrange shuttle or hitchhike back.',
      trailhead: [-113.7187, 48.6964],
    },
    {
      id: 'grinnell-glacier',
      name: 'Grinnell Glacier',
      distance: 10.6,
      difficulty: 'strenuous',
      elevationGain: 1600,
      description: 'Hike to one of the park\'s remaining glaciers. Take boat shuttle to save 4 miles.',
      trailhead: [-113.6548, 48.7974],
    },
    {
      id: 'avalanche-lake',
      name: 'Avalanche Lake',
      distance: 5.9,
      difficulty: 'moderate',
      elevationGain: 730,
      description: 'Through old-growth cedar forest to glacial cirque. One of the park\'s most popular.',
      trailhead: [-113.8189, 48.6817],
    },
    {
      id: 'hidden-lake',
      name: 'Hidden Lake Overlook',
      distance: 2.7,
      difficulty: 'moderate',
      elevationGain: 540,
      description: 'Boardwalk from Logan Pass through alpine meadows. Mountain goats common.',
      trailhead: [-113.7187, 48.6964],
    },
    {
      id: 'iceberg-lake',
      name: 'Iceberg Lake',
      distance: 9.7,
      difficulty: 'moderate',
      elevationGain: 1200,
      description: 'Lake with floating icebergs into summer. Spectacular cirque walls.',
      trailhead: [-113.6789, 48.7970],
    },
  ],

  // Great Smoky Mountains National Park
  'great-smoky-mountains': [
    {
      id: 'alum-cave',
      name: 'Alum Cave Trail to Mt. LeConte',
      distance: 11.0,
      difficulty: 'strenuous',
      elevationGain: 2763,
      description: 'Most popular route to LeConte Lodge. Spectacular arch and cliff faces.',
      trailhead: [-83.4511, 35.6308],
    },
    {
      id: 'chimney-tops',
      name: 'Chimney Tops',
      distance: 4.0,
      difficulty: 'strenuous',
      elevationGain: 1400,
      description: 'Steep climb to rocky pinnacle. Trail damaged by 2016 fires but reopened.',
      trailhead: [-83.4728, 35.6281],
    },
    {
      id: 'laurel-falls',
      name: 'Laurel Falls',
      distance: 2.6,
      difficulty: 'easy',
      description: '80-foot waterfall on paved trail. Very popular - go early.',
      trailhead: [-83.6117, 35.6700],
    },
    {
      id: 'abrams-falls',
      name: 'Abrams Falls',
      distance: 5.0,
      difficulty: 'moderate',
      elevationGain: 650,
      description: '20-foot wide falls in Cades Cove area. Swimming is dangerous.',
      trailhead: [-83.8450, 35.6042],
    },
    {
      id: 'rainbow-falls',
      name: 'Rainbow Falls',
      distance: 5.4,
      difficulty: 'moderate',
      elevationGain: 1685,
      description: '80-foot falls that create rainbows on sunny afternoons.',
      trailhead: [-83.4953, 35.6736],
    },
  ],
};

// Helper function to get trails for a specific park
export function getTrailsForPark(parkId: string): Trail[] {
  return PARK_TRAILS[parkId] || [];
}

// Helper function to get difficulty label with proper casing
export function getDifficultyLabel(difficulty: TrailDifficulty): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}
