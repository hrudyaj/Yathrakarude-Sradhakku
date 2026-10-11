# Yathrakarude Sradhakku | യാത്രക്കാരുടെ ശ്രദ്ധയ്ക്ക്

Yathrakarude Sradhakku ("Attention, Travellers!") is a collaborative travel exploration web platform and persistent 3D world engine that bridges travellers and local residents. By blending real-world geolocation movement with a shared territory grid, authentic cultural missions, and historical artefacts, the platform turns travel into a living, cooperative canvas.

---

## Concept and Philosophy

Modern travel tools often isolate visitors into spectator roles or commercial tourist bubbles. Yathrakarude Sradhakku reframes exploration as a shared, reciprocal journey:

- Travellers explore physical geography through real walking and transit, transforming distance covered into territorial discovery equity.
- Local historians, artisans, naturalists, and elders craft grounded quests rooted in indigenous ecology, architecture, oral traditions, and folklore.
- A shared 3D spatial canvas reflects the living pulse of community presence: lands claimed, beacons lit, shields erected, and discoveries logged in real time.

---

## Core Systems and Features

### 1. 3D World Engine and Spatial Canvas

The interactive 3D environment is rendered using Three.js with custom procedural geometry and adaptive lighting:

- Segmented Land Parcels (6x6 Grid):
  The territory is divided into 36 distinct 35m x 35m geographic sectors (spanning coordinates from -105 to +105 in world space). Each sector represents historic or cultural landmarks, including spice wharfs, bastions, canal quarters, bazaars, and banyan groves.
- Dynamic Parcel State Visuals:
  - Neutral Gray: Unexplored or unclaimed territory.
  - Radiant Blue Glow: Active sector currently occupied by the traveller.
  - Radiant Gold: Acquired and claimed territory held by an explorer or faction.
- Multi-Perspective Camera System:
  - Map Overview: Tactical top-down and high-angle vantage point with smooth zoom in/out controls for comprehensive territorial analysis.
  - 3D Perspective / First-Person Exploration: Ground-level spatial view aligned with the player's position, oriented for on-foot navigation.
- Environmental Detail:
  Procedural Malabar architectural elements, tiled pitched roofs, waterfront jetties, fishing nets, lighthouses, banyan canopies, and cobblestone pathways.

### 2. Companion Guardian Spirit

Accompanying the explorer is an animated companion spirit designed with a soft, friendly bunny aesthetic:
- Intricate Three.js procedural mesh comprising rounded head, torso, perky articulated ears, soft blush highlights, and expressive eyes.
- Dynamic physics-based idle animations including rhythmic hovering, ear tilts, and responsive directional facing during player transit.

### 3. Geolocation Engine and Movement

Navigation in Yathrakarude Sradhakku is driven strictly by geographic position rather than manual directional buttons:
- Real-Time Geolocation Tracking:
  Integrates the browser Geolocation API with high-accuracy GPS polling to translate real-world coordinates directly into Three.js 3D world coordinates.
- Adaptive Path Simulation:
  When testing in environments without GPS reception or indoors, an integrated coordinate simulator traces realistic walking vectors across historic Fort Kochi coordinates (9.9632 N, 76.2430 E).
- Distance-Weighted Valuation:
  Calculates distance from the traveller's declared home base (spanning regional hubs like Kochi, Munnar, Wayanad, and Calicut to distant international points like Lisbon, Kyoto, and Oaxaca), applying authentic distance multipliers to territorial points.

### 4. Territorial Sovereignty and Sector Defense

- Sector Staking:
  Explorers who arrive within the boundaries of an unclaimed land parcel can stake sovereignty using accrued journey points.
- Aegis Shield Barrier:
  Claimed sectors can be fortified with time-locked shields (such as the 6-Hour Aegis Barrier), preventing rival claims and stabilizing territorial equity for the explorer's group.
- Sector Attribute Tracking:
  Each parcel maintains records of base point yields, historical land classification, geographic coordinates, current proprietor, and active defense status.

### 5. Cultural Quests and Authentic Expeditions

Quests are authentic, culturally grounded missions rather than generic video-game objectives:
- Hidden Kayees and Matthi Curry Trail (Mattancherry): Alleys of Mattancherry exploring 80-year-old culinary lineages and Sulaimani tea heritage.
- Dawn Mist Trek to Chithirapuram Crags (Munnar): Early morning walks with wilderness naturalists identifying endemic Nilgiri flora and traditional tea withering.
- Prehistoric Petroglyph Trail of Edakkal (Wayanad): Neolithic cave shelter expeditions cataloging stone engravings dating back to 6,000 BCE.
- Muziris Roman Papyrus and Pepper Wharf Expedition (Pattanam): Maritime archaeology exploration tracing Roman terra sigillata shards and ancient pepper export contracts recorded in the Vienna Papyrus.
- Twilight Shadows of Shahjahanabad (Old Delhi): Walled city street photography, spice terrace vistas, and traditional kabootarbaazi pigeon keeping.
- Geology and Sunset Drum Circle (Varkala South Cliff): Coastal expeditions studying tertiary laterite fossil beds and freshwater springs discharging into the sea.
- Step-by-Step Milestones:
  Quests include distinct rendezvous checkpoints, participant registries, host profiles, and permanent field ledger discovery rewards upon completion.

### 6. Cultural Assets and Relics

Explorers unearth and equip authentic historical artefacts, each imparting concrete passive benefits and lore:
- Spice Route Brass Compass (1894): Dutch brigantine navigational instrument granting a 15% bonus to distance point yields.
- Neolithic Ambukuthi Stone Sigil: Carved petroglyphic amulet unlocking enhanced territory claim bonuses.
- Varkala Tide Pool Mineral Crystal: Coastal spring deposit offering accelerated Aegis Shield replenishment.
- Grand Master Tea Estate Deed: High-range charter augmenting territorial equity.
- Muziris Roman Amphora Shard: First-century CE maritime relic boosting discoveries along coastal waterways.
- Malabar Teak Shipwright Mallet: Jackwood tool from Calvathy dhow yards reducing defense cooldown durations.
- Cochin Royal Mint Silver Fanam: Historic bullion coin enhancing trade negotiation standing.
- Nilgiri Mountain Railway Brass Token (1908): Meter-gauge railway token doubling rail distance multipliers.

### 7. Community Fabric, Dispatches, and Messaging

- Living Community Profiles:
  Profiles representing varied archetypes: local historians, slow-travel writers, wildlife biologists, epigraphers, dhow navigators, and temple art archivists.
- Real-Time Dispatches Feed:
  Broadcast stream documenting live player movements, territory fortifications, trade requests, and expeditions, complete with interactive community salutes.
- Integrated Communications:
  Interactive inbox and message threads enabling direct contact between solo travellers, hosts, and expedition squads with full reply composition.

### 8. Identity and Onboarding

- Wayfarer Registration:
  New users personalize their explorer persona through an onboarding system:
  - Callsign and Title: Customizable traveler moniker.
  - Biography and Background: Personal travel motivations and observational focus.
  - Home Base Anchor: Origin city selection determining distance metrics.
  - Explorer Archetypes: Alignment with factions including Heritage Chroniclers, Wilderness Naturalists, Slow Wanderers, and Maritime Traders.
- Comprehensive Profile Dashboard:
  Live telemetry displaying distance covered, claimed sectors, active relics, inventory slots, and rank badges.

### 9. Rankings and Leaderboard

- Global Wayfarer Leaderboard:
  Tracks explorer standings based on accumulated discovery points, claimed sectors, and verified journey distance.
- Faction and Cohort Analytics:
  Displays collective contributions between resident hosts and itinerant wanderers.

---

## Design System and Visual Architecture

The visual presentation avoids generic digital aesthetics in favor of a warm, tactile, and culturally grounded interface:

- Color Palette:
  - Terracotta and Warm Ochre: Evoking sun-baked laterite earth, clay pottery, and tiled roofs.
  - Sage Green and Deep Forest: Reflecting plantation slopes, cardamom hills, and coastal palms.
  - Warm Sand and Parchment: Providing paper-like readable surfaces for logbooks, ledgers, and dossiers.
  - Persian Blue and Marine Azure: Denoting oceanic spice routes and active territorial boundaries.
- Typography:
  - Fredoka: Rounded, inviting display typography for headers, metrics, and callouts.
  - Nunito Sans: Highly readable sans-serif for long-form narrative dispatches and quest dossiers.
  - Noto Serif Malayalam: Authentic Malayalam regional script integration.
- Interaction Details:
  - Tactile pill navigation bars with frosted glassmorphism accents.
  - Smooth micro-interactions, responsive hover states, and seamless modal dialogs for maps, quests, dispatches, assets, and profiles.

---

## Architecture and File Organization

```
├── index.html          # Main HTML structure, HUD overlays, modals, and templates
├── index.css           # Design tokens, responsive layouts, color systems, and UI styles
├── app.js              # Three.js 3D world engine, camera controller, GPS tracking, and modal state logic
├── data.js             # Initial state, land parcel grids, quest registries, relics, and community profiles
├── .gitignore          # Version control ignore definitions
└── README.md           # Project documentation and architectural overview
```

### Script Separation

- `data.js`: Houses the state definitions, including the 36-sector land grid, geographic waypoints, cultural artefacts, quest milestones, seeded community dispatches, and initial chat dialogues.
- `app.js`: Coordinates the Three.js scene, procedural geometry generation, companion meshes, coordinate transformations, Geolocation API event listeners, UI event delegation, and reactive data updates.
- `index.css`: Implements the custom design system without external CSS frameworks, enforcing typographic hierarchy, layout containers, and responsive viewports.
- `index.html`: Semantic HTML5 markup structuring the top HUD, primary 3D viewport canvas, quick-access bottom navigation, and detailed modal overlays.
