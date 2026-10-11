// YATHRAKARUDE SRADHAKKU (യാത്രക്കാരുടെ ശ്രദ്ധയ്ക്ക്)
// Core Game & Community Data Store

const locations = [
    { 
        id: 'loc-kochi', 
        name: 'Fort Kochi', 
        region: 'Kerala, India', 
        x: 72, y: 64, 
        lng: 76.2430, lat: 9.9632,
        image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
        tagline: 'Colonial lanes, Chinese fishing nets & spice aromas',
        description: 'A historic coastal melting pot of Portuguese, Dutch, British, and Malabar heritage.'
    },
    { 
        id: 'loc-munnar', 
        name: 'Munnar', 
        region: 'Western Ghats, India', 
        x: 75, y: 62, 
        lng: 77.0592, lat: 10.0889,
        image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
        tagline: 'Mist-clad rolling tea hills & Neelakurinji trails',
        description: 'Serene high-altitude sanctuary known for endless green plantations and crisp mountain winds.'
    },
    { 
        id: 'loc-wayanad', 
        name: 'Wayanad', 
        region: 'Kerala, India', 
        x: 71, y: 59, 
        lng: 76.1950, lat: 11.6260,
        image: 'https://images.unsplash.com/photo-1600100397608-f010f4439126?auto=format&fit=crop&w=800&q=80',
        tagline: 'Ancient petroglyphs, bamboo forests & misty peaks',
        description: 'Lush hill district cradling the prehistoric Edakkal caves and indigenous forest trails.'
    },
    { 
        id: 'loc-varkala', 
        name: 'Varkala', 
        region: 'Kerala, India', 
        x: 72, y: 68, 
        lng: 76.7020, lat: 8.7370,
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        tagline: 'Red laterite cliffs overlooking the Arabian Sea',
        description: 'A spiritual coastal haven where bohemian cafes perch on high geological cliffs.'
    },
    { 
        id: 'loc-mumbai', 
        name: 'Mumbai', 
        region: 'Maharashtra, India', 
        x: 70, y: 51, 
        lng: 72.8777, lat: 19.0760,
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
        tagline: 'Art deco promenades, bustling bazaars & coastal trains',
        description: 'The maximum city where colonial architecture collides with relentless street energy.'
    },
    { 
        id: 'loc-delhi', 
        name: 'Old Delhi', 
        region: 'Delhi NCR, India', 
        x: 73, y: 44, 
        lng: 77.2300, lat: 28.6139,
        image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
        tagline: 'Mughal alleys, spice vaults & centuries of culinary lore',
        description: 'Walled city labyrinths resounding with call to prayers and searing tandoori fragrances.'
    },
    { 
        id: 'loc-kyoto', 
        name: 'Kyoto', 
        region: 'Kansai, Japan', 
        x: 91, y: 39, 
        lng: 135.7681, lat: 35.0116,
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        tagline: 'Zen stone gardens, cedar forests & wooden machiya',
        description: 'Japan\'s cultural heartland steeped in tea ceremony traditions and tranquil bamboo groves.'
    },
    { 
        id: 'loc-lisbon', 
        name: 'Lisbon', 
        region: 'Portugal', 
        x: 44, y: 38, 
        lng: -9.1393, lat: 38.7223,
        image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
        tagline: 'Sun-drenched azulejo tiles, yellow trams & fado songs',
        description: 'Seven hills overlooking the Tagus estuary where historic seafaring legends still linger.'
    },
    { 
        id: 'loc-oaxaca', 
        name: 'Oaxaca', 
        region: 'Mexico', 
        x: 20, y: 46, 
        lng: -96.7266, lat: 17.0732,
        image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=800&q=80',
        tagline: 'Artisanal mezcal, Zapotec textiles & ancestral moles',
        description: 'Vibrant highland state celebrating deep indigenous craft, market culture, and culinary richness.'
    },
    { 
        id: 'loc-edinburgh', 
        name: 'Edinburgh', 
        region: 'Scotland, UK', 
        x: 46, y: 24, 
        lng: -3.1883, lat: 55.9533,
        image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80',
        tagline: 'Cobblestone wynds, gothic spires & volcanic crags',
        description: 'Literary city of dramatic closes, atmospheric taverns, and the imposing Castle Rock.'
    }
];

// Believable routes connecting destinations
const possibleConnections = [
    // Local / Regional routes (Walking / Road / Train)
    { from: 'loc-kochi', to: 'loc-munnar', mode: 'road', name: 'Ghat Pass Highway' },
    { from: 'loc-kochi', to: 'loc-varkala', mode: 'train', name: 'Malabar Coast Rail' },
    { from: 'loc-kochi', to: 'loc-wayanad', mode: 'road', name: 'Spice Route North' },
    { from: 'loc-munnar', to: 'loc-wayanad', mode: 'road', name: 'High Range Ridge' },
    { from: 'loc-varkala', to: 'loc-mumbai', mode: 'train', name: 'Konkan Express' },
    { from: 'loc-mumbai', to: 'loc-delhi', mode: 'train', name: 'Rajdhani Corridor' },
    { from: 'loc-kochi', to: 'loc-mumbai', mode: 'train', name: 'Arabian Sea Rail' },
    
    // Global connections (Flight)
    { from: 'loc-delhi', to: 'loc-kyoto', mode: 'flight', name: 'Silk Route Airways' },
    { from: 'loc-mumbai', to: 'loc-lisbon', mode: 'flight', name: 'Old Navigator Cross' },
    { from: 'loc-lisbon', to: 'loc-edinburgh', mode: 'flight', name: 'Atlantic Passage' },
    { from: 'loc-lisbon', to: 'loc-oaxaca', mode: 'flight', name: 'Trans-Atlantic Hop' }
];

// Rich Sample Quests
const initialQuests = [
    {
        id: 'quest-kochi-food',
        title: 'Hidden Kayees & Matthi Curry Trail',
        subtitle: 'Uncover 3 century-old culinary secrets tucked in Mattancherry alleys',
        description: 'Join a small circle of travellers and a local elder to taste authentic Malabar Dum Biryani, slow-brewed Sulaimani tea, and fresh sea catch cooked with crushed peppercorns.',
        locationId: 'loc-kochi',
        locationName: 'Fort Kochi & Mattancherry',
        category: 'Food Trail',
        difficulty: 'Easy',
        duration: '2.5 Hours',
        teamSize: 4,
        suitableFor: 'Locals & Travellers',
        mode: 'walk',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        creator: { name: 'Faizal Rahman', role: 'Local Historian & Foodie', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
        participants: [
            { id: 'user-faizal', name: 'Faizal Rahman', role: 'Local Host', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
            { id: 'user-claire', name: 'Claire Dubois', role: 'Traveller (France)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' }
        ],
        milestones: [
            'Visit 80-year-old Kayees Biryani kitchen in Mattancherry',
            'Sample Sulaimani tea brewed with cloves and fresh mint',
            'Meet third-generation fishmongers by the Chinese Fishing Nets'
        ],
        discoveryReward: {
            title: 'The Spice Merchant\'s Notebook',
            note: 'Discovered handwritten Malabar garam masala ratio from 1947 inscribed inside an old Dutch warehouse tea room.'
        }
    },
    {
        id: 'quest-munnar-tea',
        title: 'Dawn Mist Trek to Chithirapuram Crags',
        subtitle: 'Walk through early morning tea gardens with an estate naturalist',
        description: 'An early morning walking quest across dew-soaked plantations. Spot endemic Nilgiri Pipits, learn ancient tea-withering techniques, and view sunrise over the Anamudi ridges.',
        locationId: 'loc-munnar',
        locationName: 'Munnar, High Ranges',
        category: 'Nature & Trek',
        difficulty: 'Moderate',
        duration: '4 Hours',
        teamSize: 3,
        suitableFor: 'Travellers & Locals',
        mode: 'walk',
        image: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?auto=format&fit=crop&w=800&q=80',
        creator: { name: 'Reshmi Nair', role: 'Wilderness Naturalist', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' },
        participants: [
            { id: 'user-reshmi', name: 'Reshmi Nair', role: 'Local Naturalist', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' }
        ],
        milestones: [
            'Rendezvous at Chithirapuram colonial church post',
            'Cross the hanging rope bridge across Lockhart river',
            'Identify 3 wild medicinal ferns with the local naturalist'
        ],
        discoveryReward: {
            title: 'Wild Cardamom Grove of Lockhart',
            note: 'Catalogued a secluded indigenous cardamom forest thriving untouched on the northern valley edge.'
        }
    },
    {
        id: 'quest-wayanad-cave',
        title: 'Prehistoric Petroglyph Trail of Edakkal',
        subtitle: 'Decode Neolithic stone engravings alongside local archaeology enthusiasts',
        description: 'Climb the Ambukuthi hills to investigate rock shelter carvings dating back to 6,000 BCE. Exchange theories with fellow wanderers over fresh forest honey and steamed tapioca.',
        locationId: 'loc-wayanad',
        locationName: 'Wayanad Foothills',
        category: 'Cultural Heritage',
        difficulty: 'Moderate',
        duration: '3.5 Hours',
        teamSize: 4,
        suitableFor: 'Both',
        mode: 'road',
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
        creator: { name: 'Devan Nambiar', role: 'Heritage Enthusiast', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
        participants: [
            { id: 'user-devan', name: 'Devan Nambiar', role: 'Local Host', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
            { id: 'user-arjun', name: 'Arjun K. (You)', role: 'Solo Traveller', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' }
        ],
        milestones: [
            'Ascend Ambukuthi Mala trail',
            'Photograph the prehistoric chieftain engraving',
            'Collect oral folk legends from the tribal elder cottage'
        ],
        discoveryReward: {
            title: 'Stone Sigil of Ambukuthi',
            note: 'Documented an obscure solar alignment carved high above the main cavern entrance.'
        }
    },
    {
        id: 'quest-delhi-street',
        title: 'Twilight Shadows of Shahjahanabad',
        subtitle: 'A quiet photography walk through Khari Baoli & Haveli courtyards',
        description: 'Capture the golden hour light hitting red sandstone minarets, antique bird hospitals, and narrow balconies where pigeons flock at sunset. Collaborative photo swap afterwards.',
        locationId: 'loc-delhi',
        locationName: 'Old Delhi',
        category: 'Photography Trail',
        difficulty: 'Easy',
        duration: '3 Hours',
        teamSize: 3,
        suitableFor: 'Travellers',
        mode: 'walk',
        image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
        creator: { name: 'Kavita Sen', role: 'Street Photographer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
        participants: [
            { id: 'user-kavita', name: 'Kavita Sen', role: 'Photographer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
            { id: 'user-sam', name: 'Sam Thorne', role: 'Traveller (UK)', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80' }
        ],
        milestones: [
            'Access rooftop spice drying terrace above Khari Baoli',
            'Photograph the 19th-century carved wooden door of Haveli Dharampura',
            'Trade printed postcards at Chai stall near Jama Masjid'
        ],
        discoveryReward: {
            title: 'Rooftop Pigeon Loft of Dariba Kalan',
            note: 'Discovered a secret rooftop flight keeper practicing the 300-year-old art of Kabootarbaazi.'
        }
    },
    {
        id: 'quest-varkala-cliff',
        title: 'Geology & Sunset Drum Circle on South Cliff',
        subtitle: 'Observe tertiary sedimentary cliffs and jam with coastal musicians',
        description: 'Walk the geological boundary where natural freshwater springs spill directly into the ocean sand. Conclude with acoustic rhythm sharing at sunset.',
        locationId: 'loc-varkala',
        locationName: 'Varkala Beach & Cliff',
        category: 'Music & Nature',
        difficulty: 'Easy',
        duration: '2 Hours',
        teamSize: 5,
        suitableFor: 'Both',
        mode: 'walk',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        creator: { name: 'Manu George', role: 'Ocean Musician & Surfer', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80' },
        participants: [
            { id: 'user-manu', name: 'Manu George', role: 'Local Host', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80' },
            { id: 'user-zoe', name: 'Zoe Klein', role: 'Traveller (Germany)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' }
        ],
        milestones: [
            'Examine exposed laterite sandstone fossils on South Cliff',
            'Drink clean sweet water from the coastal cliff spring',
            'Share percussion rhythms on the beach during twilight'
        ],
        discoveryReward: {
            title: 'The Hidden Freshwater Tide Pool',
            note: 'Found a crystal natural mineral spring cascading into the seawater, revered by local fishermen.'
        }
    },
    {
        id: 'quest-muziris-papyrus',
        title: 'Muziris Roman Papyrus & Pepper Wharf Expedition',
        subtitle: 'Trace ancient Greco-Roman maritime trade relics along the Periyar rivermouth',
        description: 'Venture into the ancient submerged port of Muziris. Inspect Roman amphora fragments, examine 1st-century BCE spice warehouses, and cross-reference geographic coordinates recorded in the famed Vienna Papyrus with local river pilots.',
        locationId: 'loc-kochi',
        locationName: 'Pattanam & Kodungallur',
        category: 'Cultural Heritage',
        difficulty: 'Challenging',
        duration: '4.5 Hours',
        teamSize: 4,
        suitableFor: 'Travellers & Locals',
        mode: 'walk',
        image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
        creator: { name: 'Ananya Varier', role: 'Maritime Archaeologist', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' },
        participants: [
            { id: 'user-ananya', name: 'Ananya Varier', role: 'Archaeologist', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' },
            { id: 'user-tariq', name: 'Tariq Al-Hassan', role: 'Dhow Navigator', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' }
        ],
        milestones: [
            'Rendezvous at Kottappuram fort watergate ruins on Periyar bank',
            'Survey Roman terra sigillata pottery beds with the expedition archaeologist',
            'Record ancient Malabar black pepper wharf coordinates into field ledger'
        ],
        discoveryReward: {
            title: 'Vienna Papyrus Muziris Port Ledger',
            note: 'Transcribed ancient shipping contract details documenting 130 amphoras of Malabar pepper destined for Alexandria.'
        }
    },
    {
        id: 'quest-munroe-starlight',
        title: 'Munroe Island Silent Canoe & Starlight Mangrove Run',
        subtitle: 'Paddle narrow emerald backwater canopies with local punt-boat navigators',
        description: 'Glide silently through low mangrove tunnels in a traditional hand-carved canoe as dusk settles over Ashtamudi Lake. Observe bioluminescent brackish water ripples and document tidal estuary bird roosts.',
        locationId: 'loc-kochi',
        locationName: 'Munroe Island, Kollam',
        category: 'Ocean & Backwaters',
        difficulty: 'Moderate',
        duration: '3 Hours',
        teamSize: 3,
        suitableFor: 'Both',
        mode: 'walk',
        image: 'https://images.unsplash.com/photo-1600100397608-f010f4439126?auto=format&fit=crop&w=800&q=80',
        creator: { name: 'Faizal Rahman', role: 'Local Historian', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
        participants: [
            { id: 'user-faizal', name: 'Faizal Rahman', role: 'Local Host', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' }
        ],
        milestones: [
            'Board traditional coir punt canoe at Ashtamudi estuary jetty',
            'Navigate the subterranean root archway of the glowing mangrove cove',
            'Catalog 3 nocturnal kingfisher and pond heron roost sites'
        ],
        discoveryReward: {
            title: 'Munroe Estuary Phosphorescent Chart',
            note: 'Mapped seasonal bioluminescence coordinates along the shallow tidal brackish waterways.'
        }
    },
    {
        id: 'quest-alappuzha-lighthouse',
        title: 'Lighthouse Keeper\'s Midnight Logbook',
        subtitle: 'Climb the 1862 spiral staircase and map Arabian Sea shipping beacons',
        description: 'Ascend the 30-meter teakwood spiral tower of Alappuzha lighthouse. Study the French-built Fresnel revolving lens, observe coastal dhow signals, and log maritime coordinates.',
        locationId: 'loc-kochi',
        locationName: 'Alappuzha Coastline',
        category: 'Cultural Heritage',
        difficulty: 'Easy',
        duration: '2 Hours',
        teamSize: 4,
        suitableFor: 'Locals & Travellers',
        mode: 'walk',
        image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
        creator: { name: 'Manu George', role: 'Coastal Guide', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80' },
        participants: [
            { id: 'user-manu', name: 'Manu George', role: 'Local Host', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80' },
            { id: 'user-claire', name: 'Claire Dubois', role: 'Traveller', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' }
        ],
        milestones: [
            'Examine the 1862 brass Fresnel lens clockwork rotation gear',
            'Decipher storm warning flags documented in the harbor ledger',
            'Record nocturnal ship bearing coordinates across the outer roadstead'
        ],
        discoveryReward: {
            title: 'Alappuzha Spiral Lantern Charter',
            note: 'Authenticated maritime navigational beacon logbook from the Travancore princely state era.'
        }
    },
    {
        id: 'quest-nilgiri-steam',
        title: 'Nilgiri Mountain Railway Rack & Pinion Heritage Walk',
        subtitle: 'Trek the vintage 1908 meter-gauge railway line with heritage train mechanics',
        description: 'Walk parallel to the engineering marvel that conquered the Blue Mountains. Learn how the Swiss Abt rack-and-pinion steel cog system drives vintage steam engines up 8.33% grades.',
        locationId: 'loc-munnar',
        locationName: 'Nilgiri High Foothills',
        category: 'Rail & Roads',
        difficulty: 'Moderate',
        duration: '4 Hours',
        teamSize: 3,
        suitableFor: 'Travellers',
        mode: 'walk',
        image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
        creator: { name: 'Sam Thorne', role: 'Rail Archivist', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80' },
        participants: [
            { id: 'user-sam', name: 'Sam Thorne', role: 'Rail Historian', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80' }
        ],
        milestones: [
            'Inspect Swiss Abt cog teeth mechanism at Hillgrove water station',
            'Walk the curved stone viaduct over the misty gorge at Kallar',
            'Meet the senior locomotive firemen at Coonoor heritage shed'
        ],
        discoveryReward: {
            title: 'Golden Token of the Nilgiri Mountain Railway',
            note: 'Acquired an authentic brass single-line ball token used to authorize safe rail transit through the mountain tunnels.'
        }
    }
];

// Seeded Community Profiles
const communityUsers = [
    {
        id: 'user-faizal',
        name: 'Faizal Rahman',
        role: 'Local Historian & Foodie',
        badge: 'Local Elder',
        location: 'Fort Kochi, Kerala',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        bio: 'Born in Mattancherry. I show genuine wanderers the alleys that guidebooks forgot. Passionate about Sulaimani tea, spice trade history, and oral folklore.',
        interests: ['Food Heritage', 'Old Architecture', 'Spice Lore', 'Street Conversations'],
        status: 'Available this evening for food trail',
        questsCompleted: 24,
        languages: ['Malayalam', 'English', 'Hindi', 'Arabic basics']
    },
    {
        id: 'user-claire',
        name: 'Claire Dubois',
        role: 'Solo Explorer & Illustrator',
        badge: 'Traveller (France)',
        location: 'Fort Kochi, Kerala',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bio: 'Travelling by coastal trains down the Indian peninsula with my sketchbook. Looking for companions for morning walks and sketch sessions.',
        interests: ['Art & Sketching', 'Photography', 'Tea Culture', 'Local Markets'],
        status: 'Seeking 1-2 people for Munnar high range trip',
        questsCompleted: 8,
        languages: ['French', 'English']
    },
    {
        id: 'user-reshmi',
        name: 'Reshmi Nair',
        role: 'Wildlife Biologist & Naturalist',
        badge: 'Local Guide',
        location: 'Munnar, Western Ghats',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        bio: 'Western Ghats field researcher. I run respectful, low-impact nature explorations focusing on endemic flora, cloud forests, and tribal botany.',
        interests: ['Birding', 'Hiking', 'Indigenous Ecology', 'Conservation'],
        status: 'Leading morning dawn walk tomorrow at 6 AM',
        questsCompleted: 31,
        languages: ['Malayalam', 'Tamil', 'English']
    },
    {
        id: 'user-sam',
        name: 'Sam Thorne',
        role: 'Slow Travel Writer',
        badge: 'Traveller (UK)',
        location: 'Old Delhi',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
        bio: 'Journeying overland without flights whenever possible. Currently documenting historic train junctions and night market conversations across South Asia.',
        interests: ['Rail Journeys', 'Photography', 'Historical Archives', 'Chai Walks'],
        status: 'Looking to join an Old Delhi evening group',
        questsCompleted: 14,
        languages: ['English', 'German']
    },
    {
        id: 'user-manu',
        name: 'Manu George',
        role: 'Ocean Musician & Surfer',
        badge: 'Local Host',
        location: 'Varkala Beach',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80',
        bio: 'Surfer by sunrise, acoustic guitarist by sunset on the cliff. Happy to show visitors quiet coves and introduce them to coastal fisher families.',
        interests: ['Acoustic Music', 'Ocean Ecology', 'Surfing', 'Sunset Circles'],
        status: 'Free today after 4 PM at South Cliff',
        questsCompleted: 19,
        languages: ['Malayalam', 'English']
    },
    {
        id: 'user-kavita',
        name: 'Kavita Sen',
        role: 'Street Documentary Photographer',
        badge: 'Local (Delhi)',
        location: 'Old Delhi',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        bio: 'Walking the walled city lanes with a 35mm lens. I know which rooftop has the best light at 5:30 PM.',
        interests: ['Photography', 'Architecture', 'Calligraphy', 'Heritage'],
        status: 'Hosting twilight rooftop photo trail',
        questsCompleted: 16,
        languages: ['Hindi', 'English', 'Bengali']
    },
    {
        id: 'user-ananya',
        name: 'Ananya Varier',
        role: 'Maritime Archaeologist & Epigrapher',
        badge: 'Local Historian',
        location: 'Pattanam, Muziris',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        bio: 'Field archaeologist unearthing Indian Ocean trade contacts. Specializing in Roman amphora analysis, ancient Brahmi pottery inscriptions, and medieval port geomorphology.',
        interests: ['Archaeology', 'Ancient Trade', 'Epigraphy', 'Coastal Surveys'],
        status: 'Cataloging fresh Periyar rivermouth finds today',
        questsCompleted: 28,
        languages: ['Malayalam', 'English', 'Tamil', 'Latin basics']
    },
    {
        id: 'user-tariq',
        name: 'Tariq Al-Hassan',
        role: 'Omani Dhow Navigator & Merchant',
        badge: 'Traveller (Oman)',
        location: 'Fort Kochi Harbor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        bio: 'Sailing heritage wooden dhows across the Arabian Sea between Sur, Muscat, and Malabar ports following seasonal monsoon currents. Documenting traditional celestial navigation.',
        interests: ['Maritime Sailing', 'Spice Trade', 'Astronavigation', 'Ship Carpentry'],
        status: 'Moored at Calvathy canal until Sunday',
        questsCompleted: 21,
        languages: ['Arabic', 'English', 'Malayalam basics']
    },
    {
        id: 'user-devika',
        name: 'Devika Pillai',
        role: 'Temple Arts Archivist & Musician',
        badge: 'Local Culturalist',
        location: 'Trivandrum, Kerala',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bio: 'Recording classical Sopana Sangeetham temple singing traditions, brass bell acoustics, and ancient palm-leaf temple architecture treatises across South Kerala shrines.',
        interests: ['Classical Music', 'Temple Architecture', 'Oral Traditions', 'Rare Manuscripts'],
        status: 'Available for evening heritage walks around Padmanabhaswamy corridor',
        questsCompleted: 17,
        languages: ['Malayalam', 'Sanskrit', 'English']
    },
    {
        id: 'user-leo',
        name: 'Leo Vance',
        role: 'Geologist & Deccan Trap Mineralogist',
        badge: 'Traveller (Canada)',
        location: 'Western Ghats Ridge',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
        bio: 'Field geologist mapping 65-million-year-old volcanic basalt stratigraphy and laterite escarpments along the Western Ghats mountain divide.',
        interests: ['Geology', 'Rock Formations', 'Mountain Hiking', 'Drone Cartography'],
        status: 'Scouting South Cliff laterite escarpment tomorrow',
        questsCompleted: 12,
        languages: ['English', 'French']
    }
];

// Seeded In-App Conversations
const initialConversations = [
    {
        id: 'conv-faizal',
        userId: 'user-faizal',
        userName: 'Faizal Rahman',
        userRole: 'Local Host • Fort Kochi',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        lastMessage: 'Let us meet outside the Dutch Palace at 4:30 PM. I will bring the fresh cardamom pods.',
        timestamp: '15m ago',
        unread: false,
        messages: [
            { sender: 'them', text: 'Namaskaram Arjun! Welcome to Fort Kochi. Did you find the heritage lodge alright?', time: '2:15 PM' },
            { sender: 'me', text: 'Namaskaram Faizal! Yes, the wooden verandah overlooks the boat channel. Beautiful place.', time: '2:18 PM' },
            { sender: 'them', text: 'Wonderful. Claire is joining our food quest too. We\'ll start with Kayees and then go to the spice godowns.', time: '2:25 PM' },
            { sender: 'them', text: 'Let us meet outside the Dutch Palace at 4:30 PM. I will bring the fresh cardamom pods.', time: '2:30 PM' }
        ]
    },
    {
        id: 'conv-claire',
        userId: 'user-claire',
        userName: 'Claire Dubois',
        userRole: 'Traveller • France',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        lastMessage: 'Are you planning to take the mountain train or bus up to Munnar later this week?',
        timestamp: '2h ago',
        unread: true,
        messages: [
            { sender: 'them', text: 'Hi Arjun! Saw you joined the Mattancherry quest! Looking forward to sketching the antique shops.', time: '11:10 AM' },
            { sender: 'me', text: 'Hi Claire! Yes, really excited for the trail. Bring your watercolours!', time: '11:45 AM' },
            { sender: 'them', text: 'Are you planning to take the mountain train or bus up to Munnar later this week?', time: '12:02 PM' }
        ]
    },
    {
        id: 'conv-team-food',
        userId: 'group-food',
        userName: 'Kochi Food Trail Team (3)',
        userRole: 'Quest Group • 3 Members',
        userAvatar: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=150&q=80',
        lastMessage: 'Faizal: Everyone ready for the 4:30 PM trail rendezvous?',
        timestamp: '1h ago',
        unread: false,
        messages: [
            { sender: 'them', author: 'Faizal', text: 'Created the group for our Mattancherry food quest!', time: '10:00 AM' },
            { sender: 'them', author: 'Claire', text: 'Can’t wait to try authentic Sulaimani tea.', time: '10:15 AM' },
            { sender: 'me', text: 'Counting down the hours!', time: '10:30 AM' },
            { sender: 'them', author: 'Faizal', text: 'Everyone ready for the 4:30 PM trail rendezvous?', time: '1:30 PM' }
        ]
    }
];

// Rich Discoveries for Journeys & Quests
const travelDiscoveries = {
    walk: [
        { title: "Old Woodcarver's Workshop", desc: "Found an 80-year-old artisan shaping teak prow ornaments for backwater snake boats." },
        { title: "Fragrant Chai Stall under Banyan", desc: "Shared boiling ginger brew with tea plantation workers recounting grandfather tales." },
        { title: "Secret Courtyard Well", desc: "A moss-covered freshwater spring built in 1720, still quenching neighbours' thirst." }
    ],
    train: [
        { title: "Station Master's Brass Clock", desc: "A rhythmic clockwork survivor from 1898 ticking quietly amidst green hills." },
        { title: "Vendor of Roasted Groundnuts", desc: "Listened to folk songs sung between train compartments through the Western Ghats tunnels." },
        { title: "Misty Viaduct Panorama", desc: "The train curved gently across an ancient stone arched bridge surrounded by waterfalls." }
    ],
    road: [
        { title: "Roadside Spicery Kiln", desc: "Fresh green cardamom drying over charcoal embers, perfuming the entire valley." },
        { title: "Overlooked Valley Viewpoint", desc: "A quiet hairpin bend where cloud shadows dance over tea terraces." },
        { title: "Village Potter's Kiln", desc: "Hand-thrown clay pots cooling beneath banana leaves by the village pond." }
    ],
    flight: [
        { title: "High Altitude Ghat Cloudbreak", desc: "Glimpsed the jagged emerald spine of the Anamudi peak breaking through silver sea fog." },
        { title: "Inter-Ocean Migration Path", desc: "Sighted seasonal migratory hawk flocks riding thermal currents high above the coast." }
    ]
};

// Available Explorer Home Bases for Distance-Weighted Point Calculation
const homeLocations = [
    { id: 'home-kochi', name: 'Fort Kochi, Kerala', lat: 9.9632, lng: 76.2430, desc: 'Coastline heritage port & trading canals' },
    { id: 'home-munnar', name: 'Munnar, Western Ghats', lat: 10.0889, lng: 77.0592, desc: 'High altitude misty tea plantations (~130 km)' },
    { id: 'home-wayanad', name: 'Wayanad, Kerala', lat: 11.6260, lng: 76.1950, desc: 'Neolithic caves & bamboo rainforests (~230 km)' },
    { id: 'home-varkala', name: 'Varkala, Kerala', lat: 8.7370, lng: 76.7020, desc: 'Red laterite ocean cliffs & springs (~170 km)' },
    { id: 'home-calicut', name: 'Kozhikode, Malabar', lat: 11.2588, lng: 75.7804, desc: 'Historic Zamorin port & Halwa bazaars (~190 km)' },
    { id: 'home-trivandrum', name: 'Thiruvananthapuram, Kerala', lat: 8.5241, lng: 76.9366, desc: 'Southern royal capital & Padmanabhaswamy (~205 km)' },
    { id: 'home-bangalore', name: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946, desc: 'Deccan plateau hub (~540 km)' },
    { id: 'home-mumbai', name: 'Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777, desc: 'Arabian Sea colonial metropolis (~1,400 km)' },
    { id: 'home-delhi', name: 'Old Delhi, NCR', lat: 28.6139, lng: 77.2300, desc: 'Mughal walled capital & spice trading gates (~2,600 km)' },
    { id: 'home-kyoto', name: 'Kyoto, Japan', lat: 35.0116, lng: 135.7681, desc: 'Ancient imperial shrines & cedar forests (~6,100 km)' },
    { id: 'home-lisbon', name: 'Lisbon, Portugal', lat: 38.7223, lng: -9.1393, desc: 'Atlantic maritime navigators\' seven hills (~8,400 km)' }
];

// 36 Segments of Land (6x6 Grid centered around origin, 35m x 35m each)
// Range: X [-105, 105], Z [-105, 105]
const initialLandParcels = [
    // Row 0
    { id: 'land-0-0', row: 0, col: 0, name: 'Spice Wharf #01', type: 'Maritime Port', x: -87.5, z: -87.5, basePoints: 120, owner: 'user-arjun', ownerName: 'Arjun K. (You)', ownerPoints: 240, shieldUntil: Date.now() + 18000000, lat: 9.9670, lng: 76.2390 },
    { id: 'land-0-1', row: 0, col: 1, name: 'Portuguese Bastion', type: 'Heritage Fort', x: -52.5, z: -87.5, basePoints: 150, owner: 'user-faizal', ownerName: 'Faizal Rahman', ownerPoints: 310, shieldUntil: null, lat: 9.9665, lng: 76.2405 },
    { id: 'land-0-2', row: 0, col: 2, name: 'Dutch Canal Quarter', type: 'Waterway Basin', x: -17.5, z: -87.5, basePoints: 110, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9660, lng: 76.2420 },
    { id: 'land-0-3', row: 0, col: 3, name: 'Banyan Tea Sanctuary', type: 'Botanical Grove', x: 17.5, z: -87.5, basePoints: 130, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9655, lng: 76.2435 },
    { id: 'land-0-4', row: 0, col: 4, name: 'Chinese Net Terrace', type: 'Coastal Pier', x: 52.5, z: -87.5, basePoints: 160, owner: 'user-claire', ownerName: 'Claire Dubois', ownerPoints: 290, shieldUntil: null, lat: 9.9650, lng: 76.2450 },
    { id: 'land-0-5', row: 0, col: 5, name: 'Synagogue Lane', type: 'Old Quarter', x: 87.5, z: -87.5, basePoints: 140, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9645, lng: 76.2465 },

    // Row 1
    { id: 'land-1-0', row: 1, col: 0, name: 'Pepper Godown Alpha', type: 'Trade Vault', x: -87.5, z: -52.5, basePoints: 115, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9640, lng: 76.2390 },
    { id: 'land-1-1', row: 1, col: 1, name: 'Mattancherry Godown', type: 'Spice Warehouse', x: -52.5, z: -52.5, basePoints: 140, owner: 'user-arjun', ownerName: 'Arjun K. (You)', ownerPoints: 260, shieldUntil: null, lat: 9.9635, lng: 76.2405 },
    { id: 'land-1-2', row: 1, col: 2, name: 'Jew Town Market', type: 'Antique Bazaar', x: -17.5, z: -52.5, basePoints: 175, owner: 'user-faizal', ownerName: 'Faizal Rahman', ownerPoints: 340, shieldUntil: null, lat: 9.9630, lng: 76.2420 },
    { id: 'land-1-3', row: 1, col: 3, name: 'Princess Street Gate', type: 'Colonial Passage', x: 17.5, z: -52.5, basePoints: 125, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9625, lng: 76.2435 },
    { id: 'land-1-4', row: 1, col: 4, name: 'Parade Ground Enclave', type: 'Public Commons', x: 52.5, z: -52.5, basePoints: 150, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9620, lng: 76.2450 },
    { id: 'land-1-5', row: 1, col: 5, name: 'St. Francis Nave', type: 'Historic Shrine', x: 87.5, z: -52.5, basePoints: 180, owner: 'user-sam', ownerName: 'Sam Thorne', ownerPoints: 280, shieldUntil: null, lat: 9.9615, lng: 76.2465 },

    // Row 2
    { id: 'land-2-0', row: 2, col: 0, name: 'Cinnamon Ridge', type: 'Fragrant Terrace', x: -87.5, z: -17.5, basePoints: 130, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9610, lng: 76.2390 },
    { id: 'land-2-1', row: 2, col: 1, name: 'Cardamom Vault', type: 'Dry Goods Basin', x: -52.5, z: -17.5, basePoints: 120, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9605, lng: 76.2405 },
    { id: 'land-2-2', row: 2, col: 2, name: 'Fort Kochi Central', type: 'Town Heart', x: -17.5, z: -17.5, basePoints: 200, owner: 'user-arjun', ownerName: 'Arjun K. (You)', ownerPoints: 420, shieldUntil: null, lat: 9.9632, lng: 76.2430 },
    { id: 'land-2-3', row: 2, col: 3, name: 'Ginger Pier', type: 'Waterfront Dock', x: 17.5, z: -17.5, basePoints: 135, owner: 'user-reshmi', ownerName: 'Reshmi Nair', ownerPoints: 275, shieldUntil: null, lat: 9.9595, lng: 76.2435 },
    { id: 'land-2-4', row: 2, col: 4, name: 'Lighthouse Reach', type: 'Navigational Beacon', x: 52.5, z: -17.5, basePoints: 165, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9590, lng: 76.2450 },
    { id: 'land-2-5', row: 2, col: 5, name: 'Bishop Garden', type: 'Orchard Retreat', x: 87.5, z: -17.5, basePoints: 115, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9585, lng: 76.2465 },

    // Row 3
    { id: 'land-3-0', row: 3, col: 0, name: 'Malabar Anchorage', type: 'Deep Harbor', x: -87.5, z: 17.5, basePoints: 145, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9580, lng: 76.2390 },
    { id: 'land-3-1', row: 3, col: 1, name: 'Sunset Promenade', type: 'Seaside Esplanade', x: -52.5, z: 17.5, basePoints: 155, owner: 'user-arjun', ownerName: 'Arjun K. (You)', ownerPoints: 310, shieldUntil: null, lat: 9.9575, lng: 76.2405 },
    { id: 'land-3-2', row: 3, col: 2, name: 'Ancient Bell Tower', type: 'Monument Site', x: -17.5, z: 17.5, basePoints: 170, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9570, lng: 76.2420 },
    { id: 'land-3-3', row: 3, col: 3, name: 'Colonial Mint', type: 'Coinage Archive', x: 17.5, z: 17.5, basePoints: 190, owner: 'user-faizal', ownerName: 'Faizal Rahman', ownerPoints: 360, shieldUntil: null, lat: 9.9565, lng: 76.2435 },
    { id: 'land-3-4', row: 3, col: 4, name: 'Fisherman Wharf', type: 'Catch Market', x: 52.5, z: 17.5, basePoints: 125, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9560, lng: 76.2450 },
    { id: 'land-3-5', row: 3, col: 5, name: 'Mangrove Creek', type: 'Wetland Fringe', x: 87.5, z: 17.5, basePoints: 105, owner: 'user-reshmi', ownerName: 'Reshmi Nair', ownerPoints: 210, shieldUntil: null, lat: 9.9555, lng: 76.2465 },

    // Row 4
    { id: 'land-4-0', row: 4, col: 0, name: 'Silk Weaver Square', type: 'Artisan Quarter', x: -87.5, z: 52.5, basePoints: 130, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9550, lng: 76.2390 },
    { id: 'land-4-1', row: 4, col: 1, name: 'Fort Rampart North', type: 'Stone Bulwark', x: -52.5, z: 52.5, basePoints: 140, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9545, lng: 76.2405 },
    { id: 'land-4-2', row: 4, col: 2, name: 'Teakwood Yard', type: 'Timber Basin', x: -17.5, z: 52.5, basePoints: 120, owner: 'user-claire', ownerName: 'Claire Dubois', ownerPoints: 220, shieldUntil: null, lat: 9.9540, lng: 76.2420 },
    { id: 'land-4-3', row: 4, col: 3, name: 'Customs House Quay', type: 'Maritime Office', x: 17.5, z: 52.5, basePoints: 150, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9535, lng: 76.2435 },
    { id: 'land-4-4', row: 4, col: 4, name: 'Cochin Shipyard Reach', type: 'Dockyard Bay', x: 52.5, z: 52.5, basePoints: 165, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9530, lng: 76.2450 },
    { id: 'land-4-5', row: 4, col: 5, name: 'Rainforest Edge', type: 'Forest Fringe', x: 87.5, z: 52.5, basePoints: 110, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9525, lng: 76.2465 },

    // Row 5
    { id: 'land-5-0', row: 5, col: 0, name: 'Tea Master Villa', type: 'Heritage Estate', x: -87.5, z: 87.5, basePoints: 150, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9520, lng: 76.2390 },
    { id: 'land-5-1', row: 5, col: 1, name: 'Southern Outpost', type: 'Lookout Tower', x: -52.5, z: 87.5, basePoints: 135, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9515, lng: 76.2405 },
    { id: 'land-5-2', row: 5, col: 2, name: 'Spice Clipper Berth', type: 'Vessel Moorings', x: -17.5, z: 87.5, basePoints: 145, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9510, lng: 76.2420 },
    { id: 'land-5-3', row: 5, col: 3, name: 'Monsoon Watchtower', type: 'Weather Station', x: 17.5, z: 87.5, basePoints: 180, owner: 'user-sam', ownerName: 'Sam Thorne', ownerPoints: 310, shieldUntil: null, lat: 9.9505, lng: 76.2435 },
    { id: 'land-5-4', row: 5, col: 4, name: 'Neelakurinji Crest', type: 'Flowering Crag', x: 52.5, z: 87.5, basePoints: 160, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9500, lng: 76.2450 },
    { id: 'land-5-5', row: 5, col: 5, name: 'Hidden Grotto', type: 'Secluded Sanctuary', x: 87.5, z: 87.5, basePoints: 210, owner: null, ownerName: 'Unclaimed', ownerPoints: 0, shieldUntil: null, lat: 9.9495, lng: 76.2465 }
];

// Explorer Assets & Relics
const initialAssets = [
    { 
        id: 'asset-1', 
        name: 'Spice Route Brass Compass (1894)', 
        type: 'Relic Instrument', 
        points: 350, 
        icon: 'COMPASS', 
        equipped: true, 
        pointsBonus: 50,
        perk: '+15% Distance Point Yield', 
        lore: 'Salvaged from an ancient Dutch brigantine in Kochi harbor; grants +15% distance point yield on all staked territories.' 
    },
    { 
        id: 'asset-2', 
        name: 'Neolithic Ambukuthi Stone Sigil', 
        type: 'Ancient Artifact', 
        points: 420, 
        icon: 'SIGIL', 
        equipped: false, 
        pointsBonus: 80,
        perk: '+25% Territory Claim Yield', 
        lore: 'Petroglyphic amulet inscribed during Edakkal cave expedition; unlocks secret land claims and boosts base point yield.' 
    },
    { 
        id: 'asset-3', 
        name: 'Varkala Tide Pool Mineral Crystal', 
        type: 'Natural Relic', 
        points: 280, 
        icon: 'CRYSTAL', 
        equipped: false, 
        pointsBonus: 40,
        perk: 'Free Aegis Shield Replenish', 
        lore: 'Harvested from freshwater coastal cliff springs; grants 1 free instant Aegis Shield replenishment upon cooldown.' 
    },
    { 
        id: 'asset-4', 
        name: 'Grand Master Tea Estate Deed', 
        type: 'Territorial Charter', 
        points: 500, 
        icon: 'CHARTER', 
        equipped: false, 
        pointsBonus: 100,
        perk: '+500 Territorial Equity', 
        lore: 'Colonial plantation registry certifying sovereign rights to high-range tea parcels in the Western Ghats.' 
    },
    { 
        id: 'asset-5', 
        name: 'Muziris Roman Amphora Shard', 
        type: 'Maritime Relic', 
        points: 390, 
        icon: 'AMPHORA', 
        equipped: false, 
        pointsBonus: 60,
        perk: '+20% Coastal Discovery Lore', 
        lore: 'First-century CE terra sigillata sherd retrieved from the Periyar river bed; provides enhanced discovery bonuses near waterways.' 
    },
    { 
        id: 'asset-6', 
        name: 'Malabar Teak Shipwright Mallet', 
        type: 'Guild Instrument', 
        points: 310, 
        icon: 'MALLET', 
        equipped: false, 
        pointsBonus: 45,
        perk: '-50% Aegis Cooldown', 
        lore: 'Heavy jackwood mallet used by Calvathy dhow builders; fortifies territory barriers in half the standard recharge duration.' 
    },
    { 
        id: 'asset-7', 
        name: 'Cochin Royal Mint Silver Fanam', 
        type: 'Historic Currency', 
        points: 440, 
        icon: 'FANAM', 
        equipped: false, 
        pointsBonus: 75,
        perk: '+180 Trade Lore Equity', 
        lore: 'Tiny stamped silver bullion coin circulated along Malabar trading docks during the Zamorin reign; boosts trade negotiation leverage.' 
    },
    { 
        id: 'asset-8', 
        name: 'Nilgiri Mountain Railway Brass Token (1908)', 
        type: 'Transit Charter', 
        points: 460, 
        icon: 'TOKEN', 
        equipped: false, 
        pointsBonus: 90,
        perk: '+2.0x Rail Distance Multiplier', 
        lore: 'Authentic single-line brass ball token issued for mountain steam trains traversing the Blue Mountain rack-and-pinion pass.' 
    }
];

// Seeded Dispatches Feed
const initialDispatches = [
    { id: 'disp-1', author: 'Faizal Rahman', badge: 'Local Host', time: '10m ago', text: 'Staked ownership over Colonial Mint (+360 pts). The spice market is bustling this afternoon! Ready to guide travellers at Mattancherry.', salutes: 4 },
    { id: 'disp-2', author: 'Arjun K. (You)', badge: 'Wayfarer #1084', time: '25m ago', text: 'Activated 6-Hour Aegis Shield over Spice Wharf #01! Territory fortified against rival claims. Looking to trade with high-range explorers.', salutes: 6 },
    { id: 'disp-3', author: 'Claire Dubois', badge: 'Traveller (France)', time: '1h ago', text: 'Arrived at Chinese Net Terrace after 4,800 km transit! Distance multiplier awarded +290 points. Sketching dhows at sunset.', salutes: 9 },
    { id: 'disp-4', author: 'Ananya Varier', badge: 'Archaeologist', time: '2h ago', text: 'Surveyed newly uncovered Periyar amphora beds near Pattanam! Logged new field discovery: Vienna Papyrus Muziris Ledger.', salutes: 12 },
    { id: 'disp-5', author: 'Reshmi Nair', badge: 'Naturalist', time: '3h ago', text: 'Completed Mangrove Creek expedition with 2 wanderers. New botanical trail mapped on Ashtamudi estuary!', salutes: 7 },
    { id: 'disp-6', author: 'Tariq Al-Hassan', badge: 'Navigator (Oman)', time: '4h ago', text: 'Dhow moored at Calvathy canal after 9-day Arabian Sea voyage under seasonal monsoon winds. Ready to trade Omani frankincense relics.', salutes: 11 },
    { id: 'disp-7', author: 'Sam Thorne', badge: 'Traveller (UK)', time: '5h ago', text: 'Proposing trade: Willing to swap Monsoon Watchtower for a coastal pier in Fort Kochi. Open to fair swaps.', salutes: 3 }
];

