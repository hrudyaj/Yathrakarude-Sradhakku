// YATHRAKARUDE SRADHAKKU (യാത്രക്കാരുടെ ശ്രദ്ധയ്ക്ക്)
// Core Application Logic & State Management

let appState = {
    revealedRoutes: ['loc-kochi_loc-munnar', 'loc-kochi_loc-varkala'],
    connectedNodes: ['loc-kochi', 'loc-munnar', 'loc-varkala'],
    quests: [],
    userJoinedQuests: ['quest-wayanad-cave'],
    completedQuests: ['quest-varkala-cliff'],
    milestoneProgress: {}, // { 'quest-id': [true, false, true] }
    discoveries: [
        {
            title: "The Spice Merchant's Notebook",
            desc: "Discovered handwritten Malabar garam masala ratio from 1947 inscribed inside an old Dutch warehouse tea room.",
            location: "Fort Kochi",
            mode: "walk",
            timestamp: "Yesterday"
        },
        {
            title: "The Hidden Freshwater Tide Pool",
            desc: "Found a crystal natural mineral spring cascading into the seawater, revered by local fishermen.",
            location: "Varkala Beach",
            mode: "walk",
            timestamp: "2 days ago"
        }
    ],
    conversations: [],
    activeConversationId: 'conv-faizal',
    landParcels: [],
    playerHomeId: 'home-kochi',
    playerScore: 1480,
    dispatches: [],
    assets: [],
    currentUser: {
        id: 'user-arjun',
        name: 'Arjun K. (You)',
        role: 'Solo Wayfarer',
        avatar: 'AK',
        bio: 'Curious slow traveller documenting spice maritime trails, railway station master clocks, and roadside chai wisdom across South Asia.',
        homeBase: 'Fort Kochi, Kerala'
    }
};

// Global References for Active Expedition & Audio
let currentExpedition = null;
let expeditionTimer = null;
let currentModalQuest = null;

// Voice Call WebRTC / WebAudio State
let audioContext = null;
let audioStream = null;
let analyserNode = null;
let audioAnimId = null;
let isMicMuted = false;
let isSpeakerOn = true;

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
    initPersistentState();
    initNavigation();
    initGameEnvironment();
    initQuests();
    initCommunity();
    initConversations();
    initVoiceCallRoom();
    initLandParcelsSystem();
    initLeaderboardUI();
    initAssetsUI();
    initDispatchesUI();
    initOnboardingUI();
    initTradeModalUI();
    updateGlobalMetrics();
    renderJournal();
    bindActionEvents();
});

// 1. Persistent State Management
function initPersistentState() {
    const saved = localStorage.getItem('yathrakarude_state_v2');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            appState = { ...appState, ...parsed };
        } catch (e) {
            console.error("Could not parse saved state:", e);
        }
    }

    // Default quests & conversations fallback
    if (!appState.quests || appState.quests.length === 0) {
        appState.quests = JSON.parse(JSON.stringify(initialQuests));
    }
    if (!appState.conversations || appState.conversations.length === 0) {
        appState.conversations = JSON.parse(JSON.stringify(initialConversations));
    }
    if (!appState.landParcels || appState.landParcels.length === 0) {
        appState.landParcels = JSON.parse(JSON.stringify(initialLandParcels));
    }
    if (!appState.dispatches || appState.dispatches.length === 0) {
        appState.dispatches = JSON.parse(JSON.stringify(initialDispatches));
    }
    if (!appState.assets || appState.assets.length === 0) {
        appState.assets = JSON.parse(JSON.stringify(initialAssets));
    }

    saveState();
}

function saveState() {
    localStorage.setItem('yathrakarude_state_v2', JSON.stringify({
        revealedRoutes: appState.revealedRoutes,
        connectedNodes: appState.connectedNodes,
        quests: appState.quests,
        userJoinedQuests: appState.userJoinedQuests,
        completedQuests: appState.completedQuests,
        milestoneProgress: appState.milestoneProgress || {},
        discoveries: appState.discoveries,
        conversations: appState.conversations,
        landParcels: appState.landParcels,
        playerHomeId: appState.playerHomeId,
        playerScore: appState.playerScore,
        dispatches: appState.dispatches,
        currentUser: appState.currentUser
    }));
}

function getRouteKey(loc1, loc2) {
    return [loc1, loc2].sort().join('_');
}

// 2. Navigation Handling
function initNavigation() {
    // Top HUD
    const msgBtn = document.getElementById('btn-open-messages');
    if (msgBtn) msgBtn.addEventListener('click', openMessagesDrawer);

    // Bottom HUD overlay toggles
    document.querySelectorAll('.hud-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-modal');
            const modal = document.getElementById(target);
            if (modal) modal.classList.remove('hide');
        });
    });

    // Modal Close Buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-close-modal');
            const modal = document.getElementById(target);
            if (modal) modal.classList.add('hide');
        });
    });
}
function switchTab(tabId) { /* Deprecated */ }


// 3. Three.js Game Environment — GPS + OSM Buildings + Monster Creatures
let scene, camera, renderer;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let questMarkers3D = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Lighting
let hemiLight, dirLight;
let currentEnvState = 'day';

// GPS tracking state
let gpsOrigin = null; // { lat, lng } — first fix becomes world origin (0,0,0)
let gpsWatchId = null;

// Meters-per-unit scale (1 unit = 1 metre in scene)
const SCALE = 1; // 1:1

// Coordinate conversion helpers
function lngLatToXZ(lng, lat) {
    if (!gpsOrigin) return { x: 0, z: 0 };
    const R = 6371000; // Earth radius metres
    const dLat = (lat - gpsOrigin.lat) * Math.PI / 180;
    const dLng = (lng - gpsOrigin.lng) * Math.PI / 180;
    const x = dLng * R * Math.cos(gpsOrigin.lat * Math.PI / 180) * SCALE;
    const z = -dLat * R * SCALE; // Negative because Three.js Z is into screen
    return { x, z };
}

// OSM building fetch
let osmBuildingsLoaded = false;
let osmBuildingMeshes = [];

async function fetchOSMBuildings(lat, lng) {
    const delta = 0.003; // ~330m radius
    const bbox = `${lat - delta},${lng - delta},${lat + delta},${lng + delta}`;
    const query = `[out:json][timeout:15];(way[building](${bbox});relation[building](${bbox}););out body;>;out skel qt;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Overpass HTTP ' + res.status);
        const data = await res.json();
        buildOSMScene(data, lat, lng);
        document.getElementById('hud-location-label').textContent = 'Your Real Location (OSM Buildings)';
    } catch (err) {
        console.warn('OSM fetch failed, using stylised fallback:', err);
        buildFallbackEnvironment();
        document.getElementById('hud-location-label').textContent = 'Fort Kochi — Stylised Demo World';
    }
}

// Nodes lookup from Overpass response
function buildOSMScene(data, originLat, originLng) {
    // Clear old fallback meshes
    osmBuildingMeshes.forEach(m => scene.remove(m));
    osmBuildingMeshes = [];

    // Build node map
    const nodes = {};
    data.elements.filter(e => e.type === 'node').forEach(n => { nodes[n.id] = n; });

    const ways = data.elements.filter(e => e.type === 'way' && e.tags && e.tags.building);
    
    const buildingPalette = ['#FDF6E3','#F9DF74','#F4A261','#5BA4CF','#A8D5B5','#C8593A','#EDE9D8'];
    const isNight = currentEnvState === 'night';

    ways.forEach(way => {
        if (!way.nodes || way.nodes.length < 3) return;
        const shape = new THREE.Shape();
        let firstPoint = true;

        way.nodes.forEach(nid => {
            const node = nodes[nid];
            if (!node) return;
            const { x, z } = lngLatToXZ(node.lon, node.lat);
            if (firstPoint) { shape.moveTo(x, z); firstPoint = false; }
            else shape.lineTo(x, z);
        });

        // Building height: use tag or random fallback (2–10m)
        let floors = parseInt(way.tags['building:levels'] || '0');
        if (!floors) floors = 1 + Math.floor(Math.random() * 4);
        const h = floors * 3;

        const extrudeSettings = { depth: h, bevelEnabled: false };
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        // Rotate so extrusion goes up (default extrudes along Z, we need Y)
        geo.rotateX(-Math.PI / 2);

        const col = buildingPalette[Math.floor(Math.random() * buildingPalette.length)];
        const mat = new THREE.MeshLambertMaterial({
            color: col,
            // Slight emissive glow at night from windows
            emissive: isNight ? new THREE.Color(col).multiplyScalar(0.08) : new THREE.Color(0x000000)
        });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        osmBuildingMeshes.push(mesh);
    });

    console.log(`OSM: rendered ${ways.length} building footprints`);
    osmBuildingsLoaded = true;
}

// Fallback if GPS/OSM unavailable
function buildFallbackEnvironment() {
    // Ground
    const groundGeo = new THREE.PlaneGeometry(400, 400);
    const groundMat = new THREE.MeshLambertMaterial({ color: '#C8E6C0' }); // light green grass
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    scene.add(ground);
    osmBuildingMeshes.push(ground);

    // Road
    const roadGeo = new THREE.PlaneGeometry(8, 400);
    const roadMat = new THREE.MeshLambertMaterial({ color: '#8D8D8D' }); // asphalt gray
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);
    osmBuildingMeshes.push(road);

    // Road center markings
    for (let i = 0; i < 30; i++) {
        const markGeo = new THREE.PlaneGeometry(0.25, 2.5);
        const markMat = new THREE.MeshLambertMaterial({ color: '#FFF176' });
        const mark = new THREE.Mesh(markGeo, markMat);
        mark.rotation.x = -Math.PI / 2;
        mark.position.set(0, 0.02, -i * 8);
        scene.add(mark);
        osmBuildingMeshes.push(mark);
    }

    // Sidewalks
    [-5.5, 5.5].forEach(sx => {
        const swGeo = new THREE.PlaneGeometry(2, 400);
        const swMat = new THREE.MeshLambertMaterial({ color: '#EDE9D8' }); // warm beige sidewalk
        const sw = new THREE.Mesh(swGeo, swMat);
        sw.rotation.x = -Math.PI / 2;
        sw.position.set(sx, 0.01, 0);
        scene.add(sw);
        osmBuildingMeshes.push(sw);
    });

    // Buildings — varied shapes with colorful palette
    const buildingStyles = [
        { wall: '#FDF6E3', roof: '#C8593A' },   // cream + terracotta
        { wall: '#5BA4CF', roof: '#2D5DA1' },   // light blue + persian blue
        { wall: '#F9DF74', roof: '#D4880A' },   // yellow + ochre
        { wall: '#F4A261', roof: '#C8593A' },   // peach + terracotta
        { wall: '#A8D5B5', roof: '#5B8A3C' },   // mint + sage
    ];
    const ROWS = 16;
    for (let i = 0; i < ROWS; i++) {
        for (let side of [-1, 1]) {
            const style = buildingStyles[Math.floor(Math.random() * buildingStyles.length)];
            const w = 4 + Math.random() * 3;
            const d = 4 + Math.random() * 2;
            const h = 3 + Math.random() * 7;
            const gap = 1.5 + Math.random();
            const bx = side * (7.5 + w / 2 + Math.random() * 2);
            const bz = -i * (d + gap);

            // Wall
            const wallGeo = new THREE.BoxGeometry(w, h, d);
            const wallMat = new THREE.MeshLambertMaterial({ color: style.wall });
            const wall = new THREE.Mesh(wallGeo, wallMat);
            wall.position.set(bx, h / 2, bz);
            scene.add(wall);
            osmBuildingMeshes.push(wall);

            // Windows (little planes on facade)
            const windowRows = Math.ceil(h / 3);
            for (let wr = 0; wr < windowRows; wr++) {
                const winW = 0.8, winH = 0.9;
                const winGeo = new THREE.PlaneGeometry(winW, winH);
                const winCol = currentEnvState === 'night' ? '#ffeaad' : '#aaccee';
                const winMat = new THREE.MeshBasicMaterial({ color: winCol });
                const win = new THREE.Mesh(winGeo, winMat);
                win.position.set(
                    bx - side * (w / 2 + 0.01),
                    1.5 + wr * 3,
                    bz
                );
                win.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
                scene.add(win);
                osmBuildingMeshes.push(win);
            }

            // Pitched roof using cone
            const roofGeo = new THREE.ConeGeometry(w * 0.75, 2.5, 4);
            const roofMat = new THREE.MeshLambertMaterial({ color: style.roof });
            const roof = new THREE.Mesh(roofGeo, roofMat);
            roof.position.set(bx, h + 1.25, bz);
            roof.rotation.y = Math.PI / 4;
            scene.add(roof);
            osmBuildingMeshes.push(roof);

            // Shop awning on ground floor
            if (Math.random() > 0.5) {
                const awningGeo = new THREE.BoxGeometry(w, 0.15, 1.5);
                const awningMat = new THREE.MeshLambertMaterial({ color: '#B98578' });
                const awning = new THREE.Mesh(awningGeo, awningMat);
                awning.position.set(bx, 2.2, bz + side * (d / 2 + 0.75));
                scene.add(awning);
                osmBuildingMeshes.push(awning);
            }
        }
    }

    // Trees along sidewalk
    for (let i = 0; i < 20; i++) {
        for (let side of [-1, 1]) {
            if (Math.random() > 0.4) {
                const trunkH = 2 + Math.random() * 1.5;
                const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, trunkH, 8);
                const trunkMat = new THREE.MeshLambertMaterial({ color: '#8B5E3C' });
                const trunk = new THREE.Mesh(trunkGeo, trunkMat);

                const leavesR = 1 + Math.random() * 0.8;
                const leavesGeo = new THREE.SphereGeometry(leavesR, 8, 6);
                const leavesColors = ['#5B8A3C', '#8FBB6A', '#2D8A44', '#4CAF50'];
                const leavesMat = new THREE.MeshLambertMaterial({ color: leavesColors[Math.floor(Math.random() * leavesColors.length)] });
                const leaves = new THREE.Mesh(leavesGeo, leavesMat);

                const tx = side * 6.2;
                const tz = -i * 8 - 2;
                trunk.position.set(tx, trunkH / 2, tz);
                leaves.position.set(tx, trunkH + leavesR * 0.7, tz);

                scene.add(trunk);
                scene.add(leaves);
                osmBuildingMeshes.push(trunk, leaves);
            }
        }
    }
}

// =============================================
// CUTE BUNNY CREATURE BUILDER
// Quest markers are adorable bunny avatars with personality
// =============================================
function buildMonsterCreature(questIndex, palette) {
    const group = new THREE.Group();

    // Bunny colour variants
    const bunnyColors = [
        { body: '#F9E4D4', inner: '#FADADD', eye: '#1C2B4A', accent: '#F4A261' }, // peach bunny
        { body: '#E8D5F5', inner: '#F0C8D8', eye: '#1C2B4A', accent: '#9B59B6' }, // lavender bunny
        { body: '#D5EAF5', inner: '#C8E6FF', eye: '#1C2B4A', accent: '#5BA4CF' }, // sky blue bunny
        { body: '#D5F5E3', inner: '#C8F0DA', eye: '#1C2B4A', accent: '#5B8A3C' }, // mint bunny
    ];
    const bCol = bunnyColors[questIndex % bunnyColors.length];

    const bodyMat = new THREE.MeshLambertMaterial({ color: bCol.body });
    const innerMat = new THREE.MeshLambertMaterial({ color: bCol.inner });
    const eyeMat = new THREE.MeshBasicMaterial({ color: bCol.eye });
    const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const accentMat = new THREE.MeshLambertMaterial({ color: bCol.accent });
    const noseMat = new THREE.MeshBasicMaterial({ color: '#E07A9F' });

    // Body (round, plump)
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), bodyMat);
    body.scale.y = 1.1;
    body.position.y = 0.55;
    group.add(body);

    // Belly patch (inner color)
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), innerMat);
    belly.scale.z = 0.3;
    belly.position.set(0, 0.55, 0.48);
    group.add(belly);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10), bodyMat);
    head.position.y = 1.38;
    group.add(head);

    // Cheeks (chubby)
    [-0.28, 0.28].forEach(cx => {
        const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 7), innerMat);
        cheek.position.set(cx, 1.32, 0.34);
        group.add(cheek);
    });

    // Eyes (big round cute eyes)
    [-0.16, 0.16].forEach(ex => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 8), eyeMat);
        eye.position.set(ex, 1.42, 0.38);
        group.add(eye);
        // Highlight sparkle
        const spark = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), eyeHighlightMat);
        spark.position.set(ex + 0.04, 1.46, 0.47);
        group.add(spark);
    });

    // Nose (tiny round pink)
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), noseMat);
    nose.position.set(0, 1.35, 0.44);
    group.add(nose);

    // Ears (tall elongated ovals)
    [-0.2, 0.2].forEach(ex => {
        const earOuterGeo = new THREE.SphereGeometry(0.12, 10, 8);
        const earOuter = new THREE.Mesh(earOuterGeo, bodyMat);
        earOuter.scale.set(0.9, 3.0, 0.5);
        earOuter.position.set(ex, 1.95, 0.05);
        earOuter.rotation.z = ex < 0 ? 0.15 : -0.15;
        group.add(earOuter);
        // Inner ear
        const earInnerGeo = new THREE.SphereGeometry(0.08, 8, 6);
        const earInner = new THREE.Mesh(earInnerGeo, innerMat);
        earInner.scale.set(0.8, 2.5, 0.4);
        earInner.position.set(ex, 1.95, 0.1);
        earInner.rotation.z = ex < 0 ? 0.15 : -0.15;
        group.add(earInner);
    });

    // Tail (fluffy pom-pom)
    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), innerMat);
    tail.position.set(0, 0.6, -0.55);
    group.add(tail);

    // Feet (round)
    [-0.28, 0.28].forEach(fx => {
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 7), bodyMat);
        foot.scale.set(1, 0.55, 1.4);
        foot.position.set(fx, 0.1, 0.12);
        group.add(foot);
    });

    // Arms (small stubby)
    [-0.6, 0.6].forEach(ax => {
        const arm = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), bodyMat);
        arm.scale.set(0.7, 1, 0.7);
        arm.position.set(ax, 0.75, 0.1);
        group.add(arm);
    });

    // Small item variant — each bunny holds something cute
    const itemType = questIndex % 4;
    if (itemType === 0) {
        // Flower
        const stemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 6);
        const stem = new THREE.Mesh(stemGeo, new THREE.MeshLambertMaterial({ color: '#5B8A3C' }));
        stem.position.set(0.6, 1.0, 0.05);
        stem.rotation.z = -0.4;
        group.add(stem);
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), accentMat);
        flower.position.set(0.8, 1.22, 0.05);
        group.add(flower);
    } else if (itemType === 1) {
        // Little lantern
        const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.25, 8),
            new THREE.MeshStandardMaterial({ color: '#F9DF74', emissive: '#D4880A', emissiveIntensity: 0.8 }));
        lantern.position.set(0.62, 0.95, 0.05);
        group.add(lantern);
    } else if (itemType === 2) {
        // Little backpack
        const pack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.18),
            new THREE.MeshLambertMaterial({ color: bCol.accent }));
        pack.position.set(0, 0.62, -0.4);
        group.add(pack);
    } else {
        // Little flag
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 6),
            new THREE.MeshLambertMaterial({ color: '#8B5E3C' }));
        pole.position.set(0.6, 1.05, 0.05);
        group.add(pole);
        const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2),
            new THREE.MeshLambertMaterial({ color: bCol.accent, side: THREE.DoubleSide }));
        flag.position.set(0.75, 1.25, 0.05);
        group.add(flag);
    }

    return group;
}

function renderQuestMarkers() {
    questMarkers3D.forEach(m => { scene.remove(m.group); });
    questMarkers3D = [];

    const creaturePalettes = [
        ['#253B36', '#C6AA70'],  // Pine + Gold
        ['#687D65', '#B98578'],  // Moss + Clay
        ['#B98578', '#253B36'],  // Clay + Pine
        ['#1A2B27', '#A8B9A2'],  // Dark + Sage
    ];

    appState.quests.forEach((quest, index) => {
        const palette = creaturePalettes[index % creaturePalettes.length];
        const group = buildMonsterCreature(index, palette);

        // Spread along street — GPS buildings will be around Z=0 origin so put creatures nearby
        const zPos = -(index * 18) - 6;
        const side = index % 2 === 0 ? 1 : -1;
        group.position.set(side * 4.5, 0, zPos);

        // Small point light around wisp type
        if (index % 4 === 2) {
            const light = new THREE.PointLight(palette[1], 1.2, 8);
            light.position.set(side * 4.5, 1.8, zPos);
            scene.add(light);
        }

        scene.add(group);

        // For raycasting, collect all meshes in group
        const meshes = [];
        group.traverse(child => { if (child.isMesh) meshes.push(child); });
        questMarkers3D.push({ group, meshes, quest });
    });
}

// GPS Positioning
function startGPSTracking() {
    if (!('geolocation' in navigator)) {
        console.warn('Geolocation not available; using Fort Kochi demo origin.');
        useDefaultOrigin();
        return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
        initWorldFromGPS(pos.coords.latitude, pos.coords.longitude);

        // Watch for live movement
        gpsWatchId = navigator.geolocation.watchPosition(pos => {
            updateCameraFromGPS(pos.coords.latitude, pos.coords.longitude);
        }, err => {
            console.warn('GPS watch error:', err.message);
        }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 });

    }, err => {
        console.warn('GPS denied/error:', err.message, '— using Fort Kochi fallback');
        useDefaultOrigin();
    }, { enableHighAccuracy: true, timeout: 8000 });
}

function initWorldFromGPS(lat, lng) {
    gpsOrigin = { lat, lng };
    document.getElementById('hud-location-label').textContent = 'Locating your world…';

    // Add ground plane centred on user
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshLambertMaterial({ color: '#A8B9A2' });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    scene.add(ground);
    osmBuildingMeshes.push(ground);

    // Fetch real buildings
    fetchOSMBuildings(lat, lng);
}

// ============================================================
// GAME ENVIRONMENT: DUAL VIEW MODES, GLOWING PARCELS, & GPS
// ============================================================

let currentViewMode = '3d'; // '3d' (first-person) or 'overview' (whole-world map)
let overviewAltitude = 135;
let playerPos = { x: 0, z: 0 };
let playerYaw = 0;
let currentParcel = null;
let parcel3DMeshes = [];
let playerMarkerGroup = null;

// Distance calculation: Haversine Formula
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}

// Distance multiplier tiers: travellers from farther away get exponentially higher points!
function getDistanceMultiplier(distKm) {
    if (distKm < 25) return 1.0;
    if (distKm < 100) return 1.25;
    if (distKm < 500) return 1.75;
    if (distKm < 2000) return 2.5;
    if (distKm < 5000) return 4.0;
    return 6.0;
}

function getPlayerHomeCoords() {
    const homeLoc = homeLocations.find(h => h.id === appState.playerHomeId);
    if (homeLoc) return { lat: homeLoc.lat, lng: homeLoc.lng, name: homeLoc.name };
    return { lat: 9.9632, lng: 76.2430, name: 'Fort Kochi, Kerala' };
}

function updateCameraFromGPS(lat, lng) {
    const { x, z } = lngLatToXZ(lng, lat);
    playerPos.x = x;
    playerPos.z = z;
    updatePlayerPositionInWorld();
}

function updatePlayerPositionInWorld() {
    if (playerMarkerGroup) {
        playerMarkerGroup.position.set(playerPos.x, 0.4, playerPos.z);
    }

    if (currentViewMode === '3d') {
        camera.position.x = playerPos.x;
        camera.position.z = playerPos.z;
        camera.position.y = 1.65;
    } else {
        // Map Overview: elevated looking at player & surroundings
        camera.position.x = playerPos.x;
        camera.position.y = overviewAltitude;
        camera.position.z = playerPos.z + 0.1;
        camera.lookAt(playerPos.x, 0, playerPos.z);
    }

    checkCurrentLandParcel();
}

// Determine active parcel based on 35m bounding box
function checkCurrentLandParcel() {
    if (!appState.landParcels || appState.landParcels.length === 0) return;

    // Find parcel containing playerPos
    let active = null;
    let minD = Infinity;

    appState.landParcels.forEach(p => {
        const dx = playerPos.x - p.x;
        const dz = playerPos.z - p.z;
        const d = Math.sqrt(dx*dx + dz*dz);
        if (Math.abs(dx) <= 17.5 && Math.abs(dz) <= 17.5) {
            active = p;
        }
        if (d < minD) {
            minD = d;
            if (!active) active = p; // Closest parcel fallback
        }
    });

    if (active) {
        currentParcel = active;
        updateLandParcelVisuals();
        renderParcelInspector(active);

        // Update top banner
        const tag = document.getElementById('hud-current-parcel-tag');
        if (tag) tag.textContent = `• Standing in ${active.name}`;
    }
}

// 3D Land Parcel Visuals: Blue (standing), Gold (owned), Gray (unknown), Coral (rival)
function updateLandParcelVisuals() {
    const isArjun = appState.currentUser.id;

    parcel3DMeshes.forEach(item => {
        const p = item.parcel;
        const isCurrent = currentParcel && currentParcel.id === p.id;
        const isOwnedByMe = p.owner === isArjun;
        const isShielded = p.shieldUntil && p.shieldUntil > Date.now();

        let planeColor = '#1e293b';
        let edgeColor = '#475569';
        let emissiveColor = '#0f172a';
        let emissiveIntensity = 0.1;

        if (isCurrent) {
            // CURRENT STANDING BLOCK: ELECTRIC BLUE GLOW
            planeColor = '#0284c7';
            edgeColor = '#38bdf8';
            emissiveColor = '#00b4d8';
            emissiveIntensity = 0.85;
        } else if (isOwnedByMe) {
            // OWNED BY ARJUN: RADIANT GOLDEN GLOW
            planeColor = '#d97706';
            edgeColor = '#fbbf24';
            emissiveColor = '#f59e0b';
            emissiveIntensity = 0.7;
        } else if (p.owner && p.owner !== 'unclaimed') {
            // RIVAL PLAYERS: CORAL / AMBER
            planeColor = '#9f1239';
            edgeColor = '#f43f5e';
            emissiveColor = '#e11d48';
            emissiveIntensity = 0.5;
        } else {
            // UNKNOWN / UNCLAIMED: SLATE GRAY
            planeColor = '#1e293b';
            edgeColor = '#64748b';
            emissiveColor = '#334155';
            emissiveIntensity = 0.15;
        }

        item.planeMesh.material.color.set(planeColor);
        item.planeMesh.material.emissive.set(emissiveColor);
        item.planeMesh.material.emissiveIntensity = emissiveIntensity;
        item.edgeLines.material.color.set(edgeColor);

        // Shield dome visibility
        if (item.shieldMesh) {
            item.shieldMesh.visible = isShielded;
        }
    });
}

function renderParcelInspector(parcel) {
    const card = document.getElementById('hud-parcel-card');
    if (!card) return;
    card.classList.remove('hide');

    const home = getPlayerHomeCoords();
    const distKm = calculateDistanceKm(home.lat, home.lng, parcel.lat, parcel.lng);
    const multiplier = getDistanceMultiplier(distKm);
    const potentialPoints = Math.round(parcel.basePoints * multiplier);
    const isMine = parcel.owner === appState.currentUser.id;
    const isShielded = parcel.shieldUntil && parcel.shieldUntil > Date.now();

    // Elements
    document.getElementById('parcel-inspector-name').textContent = parcel.name;
    document.getElementById('parcel-inspector-type').textContent = parcel.type;
    document.getElementById('parcel-inspector-coords').textContent = `${parcel.lat.toFixed(4)}°N, ${parcel.lng.toFixed(4)}°E`;
    document.getElementById('parcel-inspector-dist').textContent = `${distKm} km (${home.name})`;
    document.getElementById('parcel-inspector-mult').textContent = `${multiplier}x`;
    document.getElementById('parcel-inspector-yield').textContent = `${potentialPoints} PTS`;

    const statePill = document.getElementById('parcel-inspector-state');
    const shieldBadge = document.getElementById('parcel-inspector-shield');
    const ownerVal = document.getElementById('parcel-inspector-owner');
    const claimBtn = document.getElementById('btn-claim-parcel');
    const shieldBtn = document.getElementById('btn-shield-parcel');

    if (isMine) {
        statePill.textContent = 'Territory Owned';
        statePill.className = 'parcel-state-pill state-gold';
        ownerVal.textContent = 'You (Arjun K.)';
        claimBtn.disabled = true;
        claimBtn.textContent = 'Already Secured';
        claimBtn.style.opacity = '0.6';
    } else if (parcel.owner && parcel.owner !== 'unclaimed') {
        statePill.textContent = 'Rival Outpost';
        statePill.className = 'parcel-state-pill state-coral';
        ownerVal.textContent = parcel.ownerName || 'Rival Explorer';
        claimBtn.disabled = isShielded;
        claimBtn.textContent = isShielded ? 'Shielded by Rival' : `Conquer (+${potentialPoints} PTS)`;
        claimBtn.style.opacity = isShielded ? '0.5' : '1';
    } else {
        statePill.textContent = 'Unclaimed Land';
        statePill.className = 'parcel-state-pill state-blue';
        ownerVal.textContent = 'Unclaimed / Open';
        claimBtn.disabled = false;
        claimBtn.textContent = `Stake Claim (+${potentialPoints} PTS)`;
        claimBtn.style.opacity = '1';
    }

    if (isShielded) {
        shieldBadge.classList.remove('hide');
        shieldBtn.textContent = 'Shield Active';
        shieldBtn.disabled = true;
    } else {
        shieldBadge.classList.add('hide');
        shieldBtn.textContent = 'Activate Aegis (6h)';
        shieldBtn.disabled = !isMine;
    }
}

// Atmosphere & Sky Cycle
currentEnvState = 'night';
function applyDayNightCycle() {
    const hour = new Date().getHours();
    if (!scene) return;
    if (hour >= 6 && hour < 17) {
        currentEnvState = 'day';
        scene.background = new THREE.Color('#87CEEB'); // sky blue
        scene.fog = new THREE.FogExp2('#C9E8F5', 0.003);
        if (hemiLight) { hemiLight.intensity = 1.0; hemiLight.color.set('#fef3c7'); }
        if (dirLight) { dirLight.intensity = 1.3; dirLight.color.set('#FFF9E3'); }
    } else if (hour >= 17 && hour < 19) {
        currentEnvState = 'sunset';
        scene.background = new THREE.Color('#F9A86C'); // warm orange sunset
        scene.fog = new THREE.FogExp2('#F4C57E', 0.004);
        if (hemiLight) { hemiLight.intensity = 0.85; hemiLight.color.set('#fed7aa'); }
        if (dirLight) { dirLight.intensity = 1.1; dirLight.color.set('#fb923c'); }
    } else {
        currentEnvState = 'night';
        scene.background = new THREE.Color('#1a2d5a'); // deep navy blue (not pitch black)
        scene.fog = new THREE.FogExp2('#1a2d5a', 0.004);
        if (hemiLight) { hemiLight.intensity = 0.55; hemiLight.color.set('#93c5fd'); }
        if (dirLight) { dirLight.intensity = 0.75; dirLight.color.set('#bfdbfe'); }
    }
}

// 4. Three.js Game Environment Setup
function initGameEnvironment() {
    const container = document.getElementById('game-environment-container');
    const canvas = document.getElementById('game-canvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    // Quest inspect & close hud
    const btnCloseHud = document.getElementById('btn-close-hud');
    if (btnCloseHud) btnCloseHud.addEventListener('click', () =>
        document.getElementById('hud-quest-panel').classList.add('hide'));
    const btnInspect = document.getElementById('btn-hud-inspect');
    if (btnInspect) btnInspect.addEventListener('click', () => {
        if (currentModalQuest) openQuestModal(currentModalQuest.id);
    });

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.65, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    scene.add(hemiLight);
    dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 20, 7);
    scene.add(dirLight);

    applyDayNightCycle();

    // Build the 36 separated land parcel segments
    buildLandParcels3D();

    // Build player beacon marker
    buildPlayerMarker3D();

    // Start GPS Tracking
    startGPSTracking();

    // Build monster creatures
    renderQuestMarkers();

    // Wire HUD Controls: View Toggle, Zoom, D-Pad, Claims, Shield
    bindHUDGameControls();

    // Canvas pointer rotation
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    canvas.addEventListener('touchmove', onPointerMove, { passive: false });
    canvas.addEventListener('touchend', onPointerUp);
    canvas.addEventListener('click', onCanvasClick);
    window.addEventListener('resize', onWindowResize);

    // Keyboard navigation (WASD / Arrows)
    window.addEventListener('keydown', onKeyDown);

    renderer.setAnimationLoop(animate);

    // Initial parcel detection
    updatePlayerPositionInWorld();
}

// Build 36 Land Parcels in 3D scene (separated by 2m road corridors)
function buildLandParcels3D() {
    parcel3DMeshes.forEach(m => {
        scene.remove(m.group);
    });
    parcel3DMeshes = [];

    const parcels = appState.landParcels;
    if (!parcels) return;

    parcels.forEach(p => {
        const group = new THREE.Group();
        group.position.set(p.x, 0, p.z);

        // Ground Tile (33m x 33m plane)
        const planeGeo = new THREE.PlaneGeometry(33, 33);
        const planeMat = new THREE.MeshLambertMaterial({
            color: '#1e293b',
            emissive: '#0f172a',
            emissiveIntensity: 0.1,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
        });
        const planeMesh = new THREE.Mesh(planeGeo, planeMat);
        planeMesh.rotation.x = -Math.PI / 2;
        group.add(planeMesh);

        // Glowing boundary wireframe edges
        const edgeGeo = new THREE.EdgesGeometry(planeGeo);
        const edgeMat = new THREE.LineBasicMaterial({ color: '#475569', linewidth: 2 });
        const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
        edgeLines.rotation.x = -Math.PI / 2;
        edgeLines.position.y = 0.05;
        group.add(edgeLines);

        // Four corner boundary pillars
        const pillarGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.8, 6);
        const pillarMat = new THREE.MeshLambertMaterial({ color: '#cbd5e1' });
        [[-16.5, -16.5], [16.5, -16.5], [-16.5, 16.5], [16.5, 16.5]].forEach(([cx, cz]) => {
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(cx, 0.9, cz);
            group.add(pillar);

            // Pillar top glow beacon
            const orbGeo = new THREE.SphereGeometry(0.2, 8, 6);
            const orbMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
            const orb = new THREE.Mesh(orbGeo, orbMat);
            orb.position.set(cx, 1.9, cz);
            group.add(orb);
        });

        // Center Territory Beacon Crystal
        const crystalGeo = new THREE.OctahedronGeometry(1.1);
        const crystalMat = new THREE.MeshStandardMaterial({
            color: '#38bdf8',
            emissive: '#0284c7',
            emissiveIntensity: 0.5,
            wireframe: false
        });
        const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
        crystalMesh.position.set(0, 2.5, 0);
        group.add(crystalMesh);

        // Shield Dome (transparent hemisphere)
        const shieldGeo = new THREE.SphereGeometry(18, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const shieldMat = new THREE.MeshStandardMaterial({
            color: '#22d3ee',
            emissive: '#0891b2',
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.22,
            wireframe: true
        });
        const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
        shieldMesh.visible = false;
        group.add(shieldMesh);

        scene.add(group);

        parcel3DMeshes.push({
            parcel: p,
            group,
            planeMesh,
            edgeLines,
            crystalMesh,
            shieldMesh
        });
    });

    updateLandParcelVisuals();
}

// 3D Player Marker (diamond beacon that floats above player's location)
function buildPlayerMarker3D() {
    if (playerMarkerGroup) scene.remove(playerMarkerGroup);

    playerMarkerGroup = new THREE.Group();

    // Diamond pointer
    const diamondGeo = new THREE.OctahedronGeometry(0.8);
    const diamondMat = new THREE.MeshStandardMaterial({
        color: '#fbbf24',
        emissive: '#d97706',
        emissiveIntensity: 0.8
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.position.y = 2.4;
    playerMarkerGroup.add(diamond);

    // Floor pulse ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.6, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: '#38bdf8', side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    playerMarkerGroup.add(ring);

    scene.add(playerMarkerGroup);
}

// Wire HUD Controls: View Toggle, Zoom, D-Pad, Claims, Shield
function bindHUDGameControls() {
    // 1. Dual View Mode Switcher (3D vs Map Overview)
    const btnViewMode = document.getElementById('btn-view-mode');
    if (btnViewMode) {
        btnViewMode.addEventListener('click', () => {
            if (currentViewMode === '3d') {
                currentViewMode = 'overview';
                btnViewMode.textContent = 'Map View';
                btnViewMode.classList.add('active-view');
            } else {
                currentViewMode = '3d';
                btnViewMode.textContent = '3D View';
                btnViewMode.classList.remove('active-view');
            }
            updatePlayerPositionInWorld();
        });
    }

    // 2. Zoom Controls
    const btnZoomIn = document.getElementById('btn-zoom-in');
    if (btnZoomIn) {
        btnZoomIn.addEventListener('click', () => {
            if (currentViewMode === 'overview') {
                overviewAltitude = Math.max(45, overviewAltitude - 20);
                camera.position.y = overviewAltitude;
            } else {
                camera.fov = Math.max(40, camera.fov - 8);
                camera.updateProjectionMatrix();
            }
        });
    }

    const btnZoomOut = document.getElementById('btn-zoom-out');
    if (btnZoomOut) {
        btnZoomOut.addEventListener('click', () => {
            if (currentViewMode === 'overview') {
                overviewAltitude = Math.min(260, overviewAltitude + 25);
                camera.position.y = overviewAltitude;
            } else {
                camera.fov = Math.min(85, camera.fov + 8);
                camera.updateProjectionMatrix();
            }
        });
    }

    // 3. Virtual D-Pad
    const moveStep = (dx, dz) => {
        const rad = camera.rotation.y;
        const forwardX = -Math.sin(rad);
        const forwardZ = -Math.cos(rad);
        const rightX = Math.cos(rad);
        const rightZ = -Math.sin(rad);

        playerPos.x += (forwardX * -dz + rightX * dx) * 7;
        playerPos.z += (forwardZ * -dz + rightZ * dx) * 7;
        updatePlayerPositionInWorld();
    };

    const dpadUp = document.getElementById('btn-dpad-up');
    if (dpadUp) dpadUp.addEventListener('click', () => moveStep(0, -1));
    const dpadDown = document.getElementById('btn-dpad-down');
    if (dpadDown) dpadDown.addEventListener('click', () => moveStep(0, 1));
    const dpadLeft = document.getElementById('btn-dpad-left');
    if (dpadLeft) dpadLeft.addEventListener('click', () => {
        camera.rotation.y += 0.25;
        moveStep(-0.4, 0);
    });
    const dpadRight = document.getElementById('btn-dpad-right');
    if (dpadRight) dpadRight.addEventListener('click', () => {
        camera.rotation.y -= 0.25;
        moveStep(0.4, 0);
    });

    // 4. Claim Land Action
    const claimBtn = document.getElementById('btn-claim-parcel');
    if (claimBtn) {
        claimBtn.addEventListener('click', () => {
            if (!currentParcel) return;
            stakeClaimOnParcel(currentParcel);
        });
    }

    // 5. Shield Land Action
    const shieldBtn = document.getElementById('btn-shield-parcel');
    if (shieldBtn) {
        shieldBtn.addEventListener('click', () => {
            if (!currentParcel) return;
            activateShieldOnParcel(currentParcel);
        });
    }

    // 6. Propose Trade Action
    const tradeBtn = document.getElementById('btn-trade-parcel');
    if (tradeBtn) {
        tradeBtn.addEventListener('click', () => {
            openTradeModalWithParcel(currentParcel);
        });
    }

    // 7. Identity Button -> Onboarding Profile Modal
    const btnIdentity = document.getElementById('btn-player-identity');
    if (btnIdentity) {
        btnIdentity.addEventListener('click', () => {
            const modal = document.getElementById('onboarding-modal');
            if (modal) modal.classList.remove('hide');
        });
    }
}

// Keyboard controls (WASD & Arrows)
function onKeyDown(e) {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    const key = e.key.toLowerCase();
    const rad = camera.rotation.y;
    const forwardX = -Math.sin(rad);
    const forwardZ = -Math.cos(rad);
    const rightX = Math.cos(rad);
    const rightZ = -Math.sin(rad);

    if (key === 'w' || key === 'arrowup') {
        playerPos.x += forwardX * 6;
        playerPos.z += forwardZ * 6;
        updatePlayerPositionInWorld();
    } else if (key === 's' || key === 'arrowdown') {
        playerPos.x -= forwardX * 6;
        playerPos.z -= forwardZ * 6;
        updatePlayerPositionInWorld();
    } else if (key === 'a' || key === 'arrowleft') {
        camera.rotation.y += 0.15;
        playerPos.x -= rightX * 3;
        playerPos.z -= rightZ * 3;
        updatePlayerPositionInWorld();
    } else if (key === 'd' || key === 'arrowright') {
        camera.rotation.y -= 0.15;
        playerPos.x += rightX * 3;
        playerPos.z += rightZ * 3;
        updatePlayerPositionInWorld();
    }
}

// Stake Claim on Parcel (+Distance Multiplier Points)
function stakeClaimOnParcel(parcel) {
    if (parcel.shieldUntil && parcel.shieldUntil > Date.now() && parcel.owner !== appState.currentUser.id) {
        alert("This parcel is defended by an active Aegis Forcefield!");
        return;
    }

    const home = getPlayerHomeCoords();
    const distKm = calculateDistanceKm(home.lat, home.lng, parcel.lat, parcel.lng);
    const multiplier = getDistanceMultiplier(distKm);
    const pointsGained = Math.round(parcel.basePoints * multiplier);

    parcel.owner = appState.currentUser.id;
    parcel.ownerName = appState.currentUser.name;
    parcel.ownerPoints = pointsGained;

    appState.playerScore = (appState.playerScore || 0) + pointsGained;

    // Send dispatch notice to Shared World stream
    const newDispatch = {
        id: `disp-${Date.now()}`,
        author: appState.currentUser.name,
        role: 'Wayfarer Conqueror',
        time: 'Just now',
        text: `Claimed territory: [${parcel.name}]! Journeyed ${distKm} km from ${home.name} for a ${multiplier}x distance bonus (+${pointsGained} PTS)!`
    };
    appState.dispatches.unshift(newDispatch);

    saveState();
    updateGlobalMetrics();
    updateLandParcelVisuals();
    renderParcelInspector(parcel);
    renderLeaderboard();
    renderAssetsVault();
    renderDispatchesStream();
}

// Activate Aegis Shield on Parcel
function activateShieldOnParcel(parcel) {
    if (parcel.owner !== appState.currentUser.id) {
        alert("You can only shield territory you personally own.");
        return;
    }

    parcel.shieldUntil = Date.now() + 6 * 3600 * 1000; // 6 hours

    const newDispatch = {
        id: `disp-${Date.now()}`,
        author: appState.currentUser.name,
        role: 'Guardian',
        time: 'Just now',
        text: `Activated a 6-Hour Aegis Forcefield over [${parcel.name}]! Rival claims are repelled.`
    };
    appState.dispatches.unshift(newDispatch);

    saveState();
    updateLandParcelVisuals();
    renderParcelInspector(parcel);
    renderAssetsVault();
    renderDispatchesStream();
}

// Click on parcel in 3D scene to inspect
function checkParcelRaycast(clientX, clientY) {
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const planes = parcel3DMeshes.map(m => m.planeMesh);
    const intersects = raycaster.intersectObjects(planes);

    if (intersects.length > 0) {
        const hitPlane = intersects[0].object;
        const found = parcel3DMeshes.find(m => m.planeMesh === hitPlane);
        if (found) {
            currentParcel = found.parcel;
            updateLandParcelVisuals();
            renderParcelInspector(found.parcel);
            return true;
        }
    }
    return false;
}

function onCanvasClick(event) {
    if (isDragging) return;

    // First check creature raycast
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const allMeshes = [];
    const meshToQM = new Map();
    questMarkers3D.forEach(qm => {
        qm.meshes.forEach(m => { allMeshes.push(m); meshToQM.set(m, qm); });
    });

    const intersects = raycaster.intersectObjects(allMeshes);
    if (intersects.length > 0) {
        const qm = meshToQM.get(intersects[0].object);
        if (qm) {
            const quest = qm.quest;
            currentModalQuest = quest;
            document.getElementById('hud-category').innerText = quest.category;
            document.getElementById('hud-title').innerText = quest.title;
            document.getElementById('hud-location').innerText = quest.locationName;
            document.getElementById('hud-desc').innerText = quest.subtitle;
            document.getElementById('hud-quest-panel').classList.remove('hide');
            return;
        }
    } else {
        document.getElementById('hud-quest-panel').classList.add('hide');
    }

    // Check land parcel raycast
    checkParcelRaycast(event.clientX, event.clientY);
}

function onPointerDown(e) {
    isDragging = true;
    const t = e.touches ? e.touches[0] : e;
    previousMousePosition = { x: t.clientX, y: t.clientY };
}

function onPointerMove(e) {
    if (!isDragging) return;
    const t = e.touches ? e.touches[0] : e;
    const dx = t.clientX - previousMousePosition.x;
    const dy = t.clientY - previousMousePosition.y;

    if (currentViewMode === '3d') {
        camera.rotation.y += dx * 0.005;
        camera.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, camera.rotation.x + dy * 0.005));
    } else {
        // Overview drag pans world
        playerPos.x -= dx * 0.3;
        playerPos.z -= dy * 0.3;
        updatePlayerPositionInWorld();
    }
    previousMousePosition = { x: t.clientX, y: t.clientY };
}

function onPointerUp() { setTimeout(() => { isDragging = false; }, 50); }

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
    // Creature animations
    questMarkers3D.forEach((qm, i) => {
        qm.group.position.y = Math.sin(time * 0.001 + i * 1.3) * 0.12;
        qm.group.rotation.y += 0.007;
    });

    // Parcel crystal rotations
    parcel3DMeshes.forEach((item, i) => {
        if (item.crystalMesh) {
            item.crystalMesh.rotation.y += 0.012;
            item.crystalMesh.position.y = 2.5 + Math.sin(time * 0.0015 + i) * 0.15;
        }
        if (item.shieldMesh && item.shieldMesh.visible) {
            item.shieldMesh.rotation.y += 0.005;
        }
    });

    // Player marker spin
    if (playerMarkerGroup) {
        playerMarkerGroup.children[0].rotation.y += 0.02;
    }

    renderer.render(scene, camera);
}


// 5. Collaborative Quest System
function initQuests() {
    renderQuestsGrid('all', 'all', 'all');
    renderExploreQuestsPreview();
    renderMyActiveQuests();

    // Filter Chips
    const filterChips = document.querySelectorAll('#quest-category-filters .filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            const category = chip.getAttribute('data-filter');
            const locationFilter = document.getElementById('quest-location-filter').value;
            const teamFilter = document.getElementById('quest-team-filter').value;
            renderQuestsGrid(category, locationFilter, teamFilter);
        });
    });

    // Location Dropdown Filter
    const locFilter = document.getElementById('quest-location-filter');
    const teamFilter = document.getElementById('quest-team-filter');
    
    const triggerFilters = () => {
        const activeChip = document.querySelector('#quest-category-filters .filter-chip.active');
        const cat = activeChip ? activeChip.getAttribute('data-filter') : 'all';
        renderQuestsGrid(cat, locFilter.value, teamFilter.value);
    };

    if (locFilter) locFilter.addEventListener('change', triggerFilters);
    if (teamFilter) teamFilter.addEventListener('change', triggerFilters);
}

function renderMyActiveQuests() {
    const container = document.getElementById('my-active-quests-container');
    const grid = document.getElementById('my-active-quests-grid');
    if (!container || !grid) return;

    const active = appState.quests.filter(q => 
        appState.userJoinedQuests.includes(q.id) && !appState.completedQuests.includes(q.id)
    );

    if (active.length > 0) {
        container.classList.remove('hide');
        grid.innerHTML = '';
        active.forEach(q => grid.appendChild(createQuestCardElement(q)));
    } else {
        container.classList.add('hide');
    }
}

function renderExploreQuestsPreview() {
    const container = document.getElementById('explore-quests-preview');
    if (!container) return;

    container.innerHTML = '';
    // Show top 3 quests
    const previewQuests = appState.quests.slice(0, 3);
    previewQuests.forEach(q => {
        container.appendChild(createQuestCardElement(q));
    });
}

function renderQuestsGrid(categoryFilter, locationFilter, teamFilter = 'all') {
    const grid = document.getElementById('quests-full-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = appState.quests.filter(q => {
        const matchesCategory = categoryFilter === 'all' || q.category === categoryFilter;
        const matchesLocation = locationFilter === 'all' || q.locationId === locationFilter;
        
        let matchesTeam = true;
        if (teamFilter === 'individual') matchesTeam = q.teamSize <= 2;
        if (teamFilter === 'group') matchesTeam = q.teamSize > 2;

        return matchesCategory && matchesLocation && matchesTeam;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-muted);">
            No expeditions found for this criteria. Try selecting another destination or category.
        </div>`;
        return;
    }

    filtered.forEach(q => {
        grid.appendChild(createQuestCardElement(q));
    });
}

function createQuestCardElement(q) {
    const card = document.createElement('div');
    card.className = 'quest-card';

    const isJoined = appState.userJoinedQuests.includes(q.id);
    const isCompleted = appState.completedQuests.includes(q.id);

    const gradient = isCompleted ? 'linear-gradient(135deg,#687D65,#A8B9A2)' : 'linear-gradient(135deg,#253B36,#687D65)';

    card.innerHTML = `
        <div class="quest-card-image" style="background:${gradient}">
            <div class="quest-card-badges">
                <span class="badge-pill">${q.category}</span>
                ${isCompleted ? '<span class="badge-pill" style="background:rgba(198,170,112,0.3)">Fulfilled</span>' : isJoined ? '<span class="badge-pill" style="background:rgba(185,133,120,0.35)">Joined</span>' : ''}
            </div>
        </div>
        <div class="quest-card-body">
            <span style="font-size:0.73rem;color:var(--moss);font-weight:700;letter-spacing:0.05em">${q.locationName}</span>
            <h3 class="quest-card-title">${q.title}</h3>
            <p class="quest-card-desc">${q.subtitle}</p>
            <div class="quest-card-meta">
                <span>${q.duration}</span>
                <span>${q.difficulty}</span>
                <span>${q.participants.length}/${q.teamSize} travellers</span>
            </div>
        </div>
        <div class="quest-card-footer">
            <div class="quest-progress-bar"><div class="quest-progress-fill" style="width:${Math.round((q.participants.length/q.teamSize)*100)}%"></div></div>
            <button class="quest-card-action ${isJoined ? 'joined' : ''}">${isCompleted ? 'Fulfilled' : isJoined ? 'Active' : 'Explore'}</button>
        </div>
    `;

    card.addEventListener('click', () => openQuestModal(q.id));
    return card;
}

function openQuestModal(questId) {
    const quest = appState.quests.find(q => q.id === questId);
    if (!quest) return;
    currentModalQuest = quest;

    const modal = document.getElementById('quest-modal');
    // image element removed from new modal-hero-band; skip
    document.getElementById('qm-category').innerText = quest.category;
    document.getElementById('qm-difficulty').innerText = quest.difficulty;
    document.getElementById('qm-duration').innerText = quest.duration;
    document.getElementById('qm-location').innerText = `${quest.locationName} — created by ${quest.creator.name}`;
    document.getElementById('qm-title').innerText = quest.title;
    document.getElementById('qm-subtitle').innerText = quest.subtitle;
    document.getElementById('qm-desc').innerText = quest.description;
    document.getElementById('qm-suitable').innerText = `Suitable for: ${quest.suitableFor}`;
    document.getElementById('qm-team-count').innerText = `${quest.participants.length}/${quest.teamSize}`;

    const isJoined = appState.userJoinedQuests.includes(quest.id);
    const isCompleted = appState.completedQuests.includes(quest.id);

    // Ensure milestone progress array exists
    if (!appState.milestoneProgress[quest.id]) {
        appState.milestoneProgress[quest.id] = new Array(quest.milestones.length).fill(false);
    }

    // Milestones Checklist
    const milestonesList = document.getElementById('qm-milestones');
    milestonesList.innerHTML = '';
    
    let checkedCount = 0;
    quest.milestones.forEach((m, idx) => {
        const isChecked = appState.milestoneProgress[quest.id][idx];
        if (isChecked) checkedCount++;
        
        const li = document.createElement('li');
        li.innerHTML = `
            <label class="milestone-label ${isChecked ? 'completed' : ''}">
                <input type="checkbox" class="milestone-check" ${isChecked ? 'checked' : ''} ${!isJoined || isCompleted ? 'disabled' : ''}>
                <span>${m}</span>
            </label>
        `;
        
        const checkbox = li.querySelector('input');
        checkbox.addEventListener('change', (e) => {
            appState.milestoneProgress[quest.id][idx] = e.target.checked;
            saveState();
            
            if (e.target.checked) li.querySelector('.milestone-label').classList.add('completed');
            else li.querySelector('.milestone-label').classList.remove('completed');
            
            checkQuestCompletionReadiness(quest.id, quest.milestones.length);
        });
        
        milestonesList.appendChild(li);
    });

    // Team Status
    const teamStatusEl = document.getElementById('qm-team-status');
    const slotsOpen = quest.teamSize - quest.participants.length;
    if (quest.participants.length >= quest.teamSize) {
        teamStatusEl.innerHTML = `<span style="color:var(--moss);font-weight:700">Team is ready to begin!</span>`;
    } else {
        teamStatusEl.innerHTML = `<span style="color:var(--clay);font-weight:700">Recruiting — ${slotsOpen} slot${slotsOpen !== 1 ? 's' : ''} open</span>`;
    }

    // Suggested Community (Demo Data)
    const suggestedBox = document.getElementById('qm-suggested-users');
    suggestedBox.innerHTML = '';
    
    // Pick 2 random users that aren't already participating
    const pIds = quest.participants.map(p => p.id);
    const availableUsers = communityUsers.filter(u => !pIds.includes(u.id) && u.id !== appState.currentUser.id);
    const shuffled = availableUsers.sort(() => 0.5 - Math.random());
    const suggested = shuffled.slice(0, 2);
    
    if (suggested.length > 0) {
        suggested.forEach(u => {
            suggestedBox.innerHTML += `
                <div class="suggested-user-row">
                    <img src="${u.avatar}" class="su-avatar" alt="${u.name}">
                    <div class="su-info">
                        <strong>${u.name}</strong> 
                        <span class="su-badge ${u.badge.toLowerCase().includes('local') ? 'local' : 'traveller'}">${u.badge}</span>
                    </div>
                    <button class="btn-icon-round-sm" title="View Profile" onclick="openUserProfileModal('${u.id}')">Profile</button>
                </div>
            `;
        });
    } else {
        document.querySelector('.quest-suggested-community').classList.add('hide');
    }

    // Participants
    const partList = document.getElementById('qm-participants');
    partList.innerHTML = '';
    quest.participants.forEach(p => {
        partList.innerHTML += `
            <div class="team-member-row">
                <img src="${p.avatar}" alt="${p.name}">
                <div class="member-info">
                    <strong>${p.name}</strong>
                    <span>${p.role}</span>
                </div>
            </div>
        `;
    });

    // Join Button State
    const joinBtn = document.getElementById('btn-quest-join-toggle');
    const completeBtn = document.getElementById('btn-quest-complete');
    
    if (isCompleted) {
        joinBtn.style.display = 'none';
        completeBtn.style.display = 'none';
        document.getElementById('qm-reward-desc').innerText = "You have already claimed this discovery.";
    } else {
        joinBtn.style.display = 'block';
        completeBtn.style.display = 'block';
        
        if (isJoined) {
            joinBtn.innerText = 'Leave Expedition Team';
            joinBtn.style.backgroundColor = 'var(--moss)';
            checkQuestCompletionReadiness(quest.id, quest.milestones.length);
        } else {
            joinBtn.innerText = 'Join Expedition Team';
            joinBtn.style.backgroundColor = 'var(--pine)';
            completeBtn.disabled = true;
            completeBtn.innerText = 'Finish Quest & Claim Discovery';
        }
    }

    modal.classList.remove('hide');
}

function toggleJoinQuest() {
    if (!currentModalQuest) return;

    const qIndex = appState.quests.findIndex(q => q.id === currentModalQuest.id);
    if (qIndex === -1) return;

    const isJoined = appState.userJoinedQuests.includes(currentModalQuest.id);

    if (isJoined) {
        // Leave
        appState.userJoinedQuests = appState.userJoinedQuests.filter(id => id !== currentModalQuest.id);
        appState.quests[qIndex].participants = appState.quests[qIndex].participants.filter(p => p.id !== appState.currentUser.id);
    } else {
        // Join
        if (appState.quests[qIndex].participants.length >= appState.quests[qIndex].teamSize) {
            alert("This expedition team has reached its capacity limit.");
            return;
        }
        appState.userJoinedQuests.push(currentModalQuest.id);
        appState.quests[qIndex].participants.push(appState.currentUser);
    }

    currentModalQuest = appState.quests[qIndex];
    saveState();
    openQuestModal(currentModalQuest.id);
    renderQuestsGrid('all', 'all', 'all');
    renderExploreQuestsPreview();
    renderMyActiveQuests();
    updateGlobalMetrics();
}

function checkQuestCompletionReadiness(questId, totalMilestones) {
    const progress = appState.milestoneProgress[questId] || [];
    const checkedCount = progress.filter(Boolean).length;
    const completeBtn = document.getElementById('btn-quest-complete');
    
    if (checkedCount === totalMilestones) {
        completeBtn.disabled = false;
        completeBtn.innerText = 'Record Final Discovery';
        completeBtn.classList.add('ready-glow');
    } else {
        completeBtn.disabled = true;
        completeBtn.innerText = `Complete all objectives (${checkedCount}/${totalMilestones})`;
        completeBtn.classList.remove('ready-glow');
    }
}

function completeModalQuest() {
    if (!currentModalQuest) return;

    if (!appState.completedQuests.includes(currentModalQuest.id)) {
        appState.completedQuests.push(currentModalQuest.id);
    }

    // Add reward discovery to discoveries journal
    if (currentModalQuest.discoveryReward) {
        appState.discoveries.unshift({
            title: currentModalQuest.discoveryReward.title,
            desc: currentModalQuest.discoveryReward.note,
            location: currentModalQuest.locationName,
            mode: currentModalQuest.mode || 'walk',
            timestamp: 'Just now'
        });
    }

    // Connect node to map if not already connected
    if (!appState.connectedNodes.includes(currentModalQuest.locationId)) {
        appState.connectedNodes.push(currentModalQuest.locationId);
    }

    saveState();
    document.getElementById('quest-modal').classList.add('hide');

    initQuests();
    updateGlobalMetrics();
    renderJournal();

    // Show beautiful completion summary modal
    const compModal = document.getElementById('quest-completion-modal');
    document.getElementById('comp-discovery-title').innerText = currentModalQuest.discoveryReward.title;
    document.getElementById('comp-discovery-note').innerText = currentModalQuest.discoveryReward.note;
    document.getElementById('comp-map-route').innerText = currentModalQuest.locationName;
    compModal.classList.remove('hide');
}

// 6. Community Screen
function initCommunity() {
    renderCommunityGrid('all', 'all');
    renderExploreCommunityPreview();

    // Role filter chips
    const roleChips = document.querySelectorAll('#community-role-filters .filter-chip');
    roleChips.forEach(chip => {
        chip.addEventListener('click', () => {
            roleChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const role = chip.getAttribute('data-role');
            const interest = document.getElementById('community-interest-filter').value;
            renderCommunityGrid(role, interest);
        });
    });

    const intFilter = document.getElementById('community-interest-filter');
    if (intFilter) {
        intFilter.addEventListener('change', () => {
            const activeChip = document.querySelector('#community-role-filters .filter-chip.active');
            const role = activeChip ? activeChip.getAttribute('data-role') : 'all';
            renderCommunityGrid(role, intFilter.value);
        });
    }
}

function renderExploreCommunityPreview() {
    const preview = document.getElementById('explore-community-preview');
    if (!preview) return;

    preview.innerHTML = '';
    communityUsers.slice(0, 3).forEach(u => {
        preview.appendChild(createCommunityCardElement(u));
    });
}

function renderCommunityGrid(roleFilter, interestFilter) {
    const grid = document.getElementById('community-full-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = communityUsers.filter(u => {
        const matchesRole = roleFilter === 'all' || 
            (roleFilter === 'local' && u.badge.toLowerCase().includes('local')) ||
            (roleFilter === 'traveller' && u.badge.toLowerCase().includes('traveller'));

        const matchesInterest = interestFilter === 'all' || 
            u.interests.some(i => i.toLowerCase().includes(interestFilter.toLowerCase()));

        return matchesRole && matchesInterest;
    });

    filtered.forEach(u => {
        grid.appendChild(createCommunityCardElement(u));
    });
}

function createCommunityCardElement(user) {
    const card = document.createElement('div');
    card.className = 'community-card';

    const isLocal = user.badge.toLowerCase().includes('local');
    const badgeClass = isLocal ? 'local' : 'traveller';

    let tagsHtml = '';
    user.interests.forEach(i => {
        tagsHtml += `<span class="interest-tag">${i}</span>`;
    });

    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0,2);
    card.innerHTML = `
        <div class="cc-header">
            <div class="cc-avatar">${initials}</div>
            <div class="cc-info">
                <div class="cc-name">${user.name}</div>
                <div class="cc-role">${user.badge}</div>
                <div class="cc-location">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    ${user.location}
                </div>
            </div>
        </div>
        <p class="cc-bio">${user.bio}</p>
        <div class="cc-tags">${tagsHtml}</div>
        <div class="cc-actions">
            <button class="btn-secondary-sm" onclick="openChatWithUser('${user.id}')">Dispatch</button>
            <button class="btn-secondary-sm" onclick="openUserProfileModal('${user.id}')">Profile</button>
        </div>
    `;

    return card;
}

window.openUserProfileModal = function(userId) {
    const user = communityUsers.find(u => u.id === userId);
    if (!user) return;

    const modal = document.getElementById('user-profile-modal');
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0,2);
    const avatarEl = document.getElementById('upm-avatar-placeholder');
    if (avatarEl) avatarEl.textContent = initials;
    document.getElementById('upm-badge').innerText = user.badge;
    document.getElementById('upm-location').innerText = user.location;
    document.getElementById('upm-name').innerText = user.name;
    document.getElementById('upm-role').innerText = user.role;
    document.getElementById('upm-status').innerText = user.status;
    document.getElementById('upm-bio').innerText = user.bio;

    const interestsDiv = document.getElementById('upm-interests');
    interestsDiv.innerHTML = '';
    user.interests.forEach(i => {
        interestsDiv.innerHTML += `<span>${i}</span>`;
    });

    const langDiv = document.getElementById('upm-languages');
    langDiv.innerHTML = '';
    (user.languages || ['English', 'Local Dialect']).forEach(l => {
        langDiv.innerHTML += `<span>${l}</span>`;
    });

    document.getElementById('btn-upm-message').onclick = () => {
        modal.classList.add('hide');
        openChatWithUser(user.id);
    };

    document.getElementById('btn-upm-invite').onclick = () => {
        alert(`Teaming invitation sent to ${user.name}! They will receive your dispatch.`);
    };

    modal.classList.remove('hide');
};

// 7. In-App Messaging & Dispatches
function initConversations() {
    // Don't auto-select a conversation; show list with empty state
    appState.activeConversationId = null;
    renderConversationsList();
    renderActiveChat();

    const form = document.getElementById('chat-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('chat-input-text');
            const text = input.value.trim();
            if (!text) return;

            sendMessage(text);
            input.value = '';
        });
    }

    document.getElementById('btn-open-messages').addEventListener('click', openMessagesDrawer);
    document.getElementById('mobile-btn-dispatches').addEventListener('click', openMessagesDrawer);
    document.getElementById('btn-close-messages').addEventListener('click', closeMessagesDrawer);
    const chatVoiceBtn = document.getElementById('btn-chat-voice-call');
    if (chatVoiceBtn) chatVoiceBtn.addEventListener('click', () => openVoiceCallRoom());
}

function openMessagesDrawer() {
    document.getElementById('messages-modal').classList.remove('hide');
}

function closeMessagesDrawer() {
    document.getElementById('messages-modal').classList.add('hide');
}

window.openChatWithUser = function(userId) {
    let conv = appState.conversations.find(c => c.userId === userId);
    if (!conv) {
        // Create conversation
        const targetUser = communityUsers.find(u => u.id === userId);
        if (targetUser) {
            conv = {
                id: `conv-${userId}`,
                userId: userId,
                userName: targetUser.name,
                userRole: `${targetUser.badge} • ${targetUser.location}`,
                userAvatar: targetUser.avatar,
                lastMessage: 'Conversation opened.',
                timestamp: 'Just now',
                messages: [
                    { sender: 'them', text: `Namaskaram! How can I assist with your journey in ${targetUser.location}?`, time: 'Now' }
                ]
            };
            appState.conversations.unshift(conv);
            saveState();
        }
    }

    if (conv) {
        appState.activeConversationId = conv.id;
        renderConversationsList();
        renderActiveChat();
        openMessagesDrawer();
    }
};

function renderConversationsList() {
    const list = document.getElementById('conversations-list');
    if (!list) return;

    list.innerHTML = '';

    if (appState.conversations.length === 0) {
        list.innerHTML = '<div style="padding:20px;font-size:0.8rem;color:var(--text-dim);text-align:center">No dispatches yet. Connect with someone from People.</div>';
        return;
    }

    appState.conversations.forEach(c => {
        const item = document.createElement('div');
        item.className = `convo-item ${c.id === appState.activeConversationId ? 'active' : ''}`;
        const initials = c.userName.split(' ').map(n => n[0]).join('').substring(0,2);
        item.innerHTML = `
            <div class="convo-avatar">${initials}</div>
            <div class="convo-info">
                <div class="convo-name">${c.userName}</div>
                <div class="convo-preview">${c.lastMessage}</div>
            </div>
        `;
        item.addEventListener('click', () => {
            appState.activeConversationId = c.id;
            renderConversationsList();
            renderActiveChat();
        });
        list.appendChild(item);
    });
}

function renderActiveChat() {
    const conv = appState.activeConversationId 
        ? appState.conversations.find(c => c.id === appState.activeConversationId)
        : null;

    const emptyState = document.getElementById('chat-empty-state');
    const contactBar = document.getElementById('chat-contact-bar');
    const chatForm = document.getElementById('chat-form');
    if (!emptyState) return;

    if (!conv) {
        emptyState.classList.remove('hide');
        if (contactBar) contactBar.classList.add('hide');
        if (chatForm) chatForm.classList.add('hide');
        const scrollBox = document.getElementById('chat-messages-scroll');
        if (scrollBox) scrollBox.innerHTML = '';
        return;
    }

    emptyState.classList.add('hide');
    if (contactBar) contactBar.classList.remove('hide');
    if (chatForm) chatForm.classList.remove('hide');

    const avatarEl = document.getElementById('chat-contact-avatar-placeholder');
    if (avatarEl) {
        const initials = conv.userName.split(' ').map(n => n[0]).join('').substring(0,2);
        avatarEl.textContent = initials;
    }
    document.getElementById('chat-contact-name').innerText = conv.userName;
    document.getElementById('chat-contact-status').innerText = conv.userRole;

    const scrollBox = document.getElementById('chat-messages-scroll');
    scrollBox.innerHTML = '';

    conv.messages.forEach(m => {
        const bubble = document.createElement('div');
        bubble.className = `msg-bubble ${m.sender}`;
        bubble.innerHTML = `
            ${m.author ? `<div style="font-size:0.7rem;font-weight:700;margin-bottom:3px;opacity:0.7">${m.author}</div>` : ''}
            <div>${m.text}</div>
            <span style="font-size:0.65rem;opacity:0.5;display:block;margin-top:4px">${m.time || 'Now'}</span>
        `;
        scrollBox.appendChild(bubble);
    });

    scrollBox.scrollTop = scrollBox.scrollHeight;
}

function sendMessage(text) {
    const convIndex = appState.conversations.findIndex(c => c.id === appState.activeConversationId);
    if (convIndex === -1) return;

    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg = {
        sender: 'me',
        text: text,
        time: timeStr
    };

    appState.conversations[convIndex].messages.push(newMsg);
    appState.conversations[convIndex].lastMessage = `You: ${text}`;
    appState.conversations[convIndex].timestamp = 'Just now';

    saveState();
    renderConversationsList();
    renderActiveChat();

    // Companion simulated contextual reply after 1.5 seconds
    setTimeout(() => {
        const replies = [
            "Splendid! I have marked this down in our expedition log.",
            "Understood! Let's rendezvous near the tea stall as planned.",
            "Wonderful finding. The locals speak highly of that path too.",
            "Received loud and clear! Travelling onwards now."
        ];
        const replyText = replies[Math.floor(Math.random() * replies.length)];
        appState.conversations[convIndex].messages.push({
            sender: 'them',
            text: replyText,
            time: 'Just now'
        });
        appState.conversations[convIndex].lastMessage = replyText;
        saveState();
        renderConversationsList();
        renderActiveChat();
    }, 1500);
}

// 8. Voice Call Room (WebRTC Audio Stream & Visualizer)
function initVoiceCallRoom() {
    const startBtn = document.getElementById('btn-start-voice-room');
    if (!startBtn) return; // Voice call not active in this demo version

    startBtn.addEventListener('click', openVoiceCallRoom);
    document.getElementById('btn-close-voice-room').addEventListener('click', closeVoiceCallRoom);
    document.getElementById('btn-hangup-voice').addEventListener('click', closeVoiceCallRoom);

    // Mute toggle
    document.getElementById('btn-toggle-mic').addEventListener('click', () => {
        isMicMuted = !isMicMuted;
        if (audioStream) {
            audioStream.getAudioTracks().forEach(track => {
                track.enabled = !isMicMuted;
            });
        }
        const btn = document.getElementById('btn-toggle-mic');
        const icon = document.getElementById('mic-icon');
        const label = document.getElementById('mic-label');

        if (isMicMuted) {
            btn.classList.remove('active');
            if (icon) icon.innerText = 'OFF';
            if (label) label.innerText = 'Unmute Mic';
            const statusEl = document.getElementById('peer-you-status');
            if (statusEl) statusEl.innerText = 'Muted';
            const youEl = document.getElementById('peer-you');
            if (youEl) youEl.classList.remove('speaking');
        } else {
            btn.classList.add('active');
            if (icon) icon.innerText = 'ON';
            label.innerText = 'Mute Mic';
            document.getElementById('peer-you-status').innerText = 'Active';
        }
    });

    // Speaker toggle
    document.getElementById('btn-toggle-speaker').addEventListener('click', () => {
        isSpeakerOn = !isSpeakerOn;
        const btn = document.getElementById('btn-toggle-speaker');
        btn.querySelector('span:last-child').innerText = isSpeakerOn ? 'Speaker On' : 'Speaker Muted';
    });
}

async function openVoiceCallRoom() {
    document.getElementById('voice-call-modal').classList.remove('hide');
    const label = document.getElementById('audio-status-label');
    label.innerText = "Requesting microphone input...";

    try {
        // Request actual user microphone stream
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        label.innerText = "Live Microphone Stream Connected • Speak to Animate";

        // Connect WebAudio API
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();
        const source = audioContext.createMediaStreamSource(audioStream);
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 64;
        source.connect(analyserNode);

        startWaveformAnimation(true);
    } catch (err) {
        console.warn("Microphone access unavailable or denied, falling back to simulated voice room:", err);
        label.innerText = "Voice Room Active (Simulated Audio Channel)";
        document.getElementById('voice-tech-explainer').innerHTML = `
            <strong>Voice Room Connected:</strong> Microphone permission was not granted, so the room is operating in demonstration simulated audio state with participant telemetry active.
        `;
        startWaveformAnimation(false);
    }
}

function startWaveformAnimation(hasRealAudio) {
    const canvas = document.getElementById('audio-waveform-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        audioAnimId = requestAnimationFrame(draw);

        if (hasRealAudio && analyserNode && !isMicMuted) {
            analyserNode.getByteFrequencyData(dataArray);
        } else {
            // Simulated rhythmic audio waveform
            for (let i = 0; i < bufferLength; i++) {
                dataArray[i] = isMicMuted ? 0 : Math.sin(Date.now() / 200 + i) * 30 + 35;
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.8;
        let x = 0;

        let totalVolume = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
            totalVolume += dataArray[i];

            // Warm green gradient for voice
            ctx.fillStyle = `rgba(74, 222, 128, ${Math.max(0.3, dataArray[i] / 255)})`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

            x += barWidth;
        }

        const avgVolume = totalVolume / bufferLength;
        const youPeer = document.getElementById('peer-you');
        if (avgVolume > 15 && !isMicMuted) {
            youPeer.classList.add('speaking');
            document.getElementById('peer-you-status').innerText = 'Speaking';
        } else {
            youPeer.classList.remove('speaking');
            if (!isMicMuted) document.getElementById('peer-you-status').innerText = 'Listening';
        }
    }

    draw();
}

function closeVoiceCallRoom() {
    if (audioAnimId) cancelAnimationFrame(audioAnimId);
    if (audioStream) {
        audioStream.getTracks().forEach(t => t.stop());
        audioStream = null;
    }
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
        audioContext = null;
    }
    document.getElementById('voice-call-modal').classList.add('hide');
}

// 9. Metrics & Field Journal
function updateGlobalMetrics() {
    const connEl = document.getElementById('stats-connections-count');
    const discEl = document.getElementById('stats-discoveries-count');
    const questEl = document.getElementById('stats-quests-completed');

    if (connEl) connEl.innerText = appState.revealedRoutes.length;
    if (discEl) discEl.innerText = appState.discoveries.length;
    if (questEl) questEl.innerText = appState.completedQuests.length;

    // Profile counts
    const myQ = document.getElementById('profile-my-quests');
    const myD = document.getElementById('profile-my-discoveries');
    const myR = document.getElementById('profile-my-routes');

    if (myQ) myQ.innerText = appState.userJoinedQuests.length;
    if (myD) myD.innerText = appState.discoveries.length;
    if (myR) myR.innerText = appState.revealedRoutes.length;

    // Quests badge
    const badge = document.getElementById('quests-count-badge');
    if (badge) badge.innerText = appState.quests.length;

    // Top HUD Badges
    const pointsEl = document.getElementById('hud-player-points');
    if (pointsEl) pointsEl.textContent = `${appState.playerScore || 1480} PTS`;

    const ownedCount = (appState.landParcels || []).filter(p => p.owner === appState.currentUser.id).length;
    const landsEl = document.getElementById('hud-player-lands-count');
    if (landsEl) landsEl.textContent = `${ownedCount} Lands`;

    const nameSigilEl = document.getElementById('hud-player-name-sigil');
    if (nameSigilEl) nameSigilEl.textContent = `${appState.currentUser.avatar || 'AK'} • ${appState.currentUser.name}`;

    // Profile Header Elements
    const profName = document.getElementById('profile-user-name');
    if (profName) profName.textContent = appState.currentUser.name;
    const profRole = document.getElementById('profile-user-role');
    if (profRole) profRole.textContent = `${appState.currentUser.role} • Home: ${appState.currentUser.homeBase || 'Fort Kochi'}`;
    const profBio = document.getElementById('profile-user-bio');
    if (profBio) profBio.textContent = appState.currentUser.bio;
}

function renderJournal() {
    const list = document.getElementById('my-discoveries-list');
    if (!list) return;

    list.innerHTML = '';
    if (appState.discoveries.length === 0) {
        list.innerHTML = '<div style="color: var(--color-charcoal-muted); font-style: italic;">No field discoveries logged yet. Complete a quest or embark on an expedition to uncover ancient lore.</div>';
        return;
    }

    const modeIcons = { walk: 'WALK', train: 'TRAIN', road: 'ROAD', flight: 'FLIGHT' };

    appState.discoveries.forEach(d => {
        const card = document.createElement('div');
        card.className = 'discovery-journal-card';
        card.innerHTML = `
            <div class="djc-icon">${modeIcons[d.mode] || 'LOG'}</div>
            <div class="djc-content">
                <div class="djc-meta">${d.location} • ${d.timestamp}</div>
                <h4>${d.title}</h4>
                <p class="djc-desc">${d.desc}</p>
            </div>
        `;
        list.appendChild(card);
    });
}

// ============================================================
// 10. LAND PARCELS SYSTEM INITIALIZATION
// ============================================================
function initLandParcelsSystem() {
    updateGlobalMetrics();
    checkCurrentLandParcel();
}

// ============================================================
// 11. LEADERBOARD SYSTEM (POINTS & DISTANCE-WEIGHTED RANKINGS)
// ============================================================
function initLeaderboardUI() {
    renderLeaderboard();
}

function renderLeaderboard() {
    const tableBody = document.getElementById('leaderboard-rows');
    if (!tableBody) return;

    // Calculate Arjun's owned count & bonus
    const arjunOwnedParcels = (appState.landParcels || []).filter(p => p.owner === appState.currentUser.id);
    const arjunLandPoints = arjunOwnedParcels.reduce((acc, p) => acc + (p.ownerPoints || p.basePoints), 0);
    const arjunTotalScore = Math.max(appState.playerScore || 0, 1480 + arjunLandPoints);

    // Build dynamic leaderboard list
    const travelers = [
        {
            id: appState.currentUser.id,
            name: appState.currentUser.name,
            avatar: appState.currentUser.avatar || 'AK',
            home: appState.currentUser.homeBase || 'Fort Kochi, Kerala',
            landsCount: arjunOwnedParcels.length,
            distBonus: '1.75x',
            score: arjunTotalScore,
            isMe: true
        },
        {
            id: 'user-faizal',
            name: 'Faizal Rahman',
            avatar: 'FR',
            home: 'Calicut, Kerala',
            landsCount: 6,
            distBonus: '1.25x',
            score: 2150,
            isMe: false
        },
        {
            id: 'user-claire',
            name: 'Claire Dubois',
            avatar: 'CD',
            home: 'Lisbon, Portugal',
            landsCount: 4,
            distBonus: '6.0x',
            score: 1980,
            isMe: false
        },
        {
            id: 'user-reshmi',
            name: 'Reshmi Nair',
            avatar: 'RN',
            home: 'Wayanad, Kerala',
            landsCount: 5,
            distBonus: '1.5x',
            score: 1640,
            isMe: false
        },
        {
            id: 'user-sam',
            name: 'Sam Thorne',
            avatar: 'ST',
            home: 'Cornwall, UK',
            landsCount: 3,
            distBonus: '6.0x',
            score: 1420,
            isMe: false
        },
        {
            id: 'user-maya',
            name: 'Maya Menon',
            avatar: 'MM',
            home: 'Trivandrum, Kerala',
            landsCount: 4,
            distBonus: '1.25x',
            score: 1290,
            isMe: false
        }
    ];

    // Sort by score descending
    travelers.sort((a, b) => b.score - a.score);

    // Update Arjun's current rank
    const myRank = travelers.findIndex(t => t.isMe) + 1;
    appState.playerRank = myRank;

    const rankEl = document.getElementById('lb-player-rank');
    if (rankEl) rankEl.textContent = `#${myRank}`;
    const scoreEl = document.getElementById('lb-player-score');
    if (scoreEl) scoreEl.textContent = `${arjunTotalScore} PTS`;
    const landsEl = document.getElementById('lb-player-lands');
    if (landsEl) landsEl.textContent = `${arjunOwnedParcels.length} Parcels`;

    // Render table rows
    tableBody.innerHTML = '';
    const medals = ['#1', '#2', '#3'];

    travelers.forEach((t, idx) => {
        const rank = idx + 1;
        const medalOrNum = medals[idx] ? `<span class="medal">${medals[idx]}</span>` : `#${rank}`;
        const row = document.createElement('div');
        row.className = `leaderboard-row ${t.isMe ? 'highlight-player' : ''}`;
        row.innerHTML = `
            <div class="col-rank">${medalOrNum}</div>
            <div class="col-user">
                <span class="user-avatar">${t.avatar}</span>
                <span><strong>${t.name}</strong></span>
            </div>
            <div class="col-home">${t.home}</div>
            <div class="col-lands"><strong>${t.landsCount}</strong></div>
            <div class="col-dist">${t.distBonus}</div>
            <div class="col-score">${t.score} PTS</div>
        `;
        tableBody.appendChild(row);
    });
}

// ============================================================
// 12. ASSETS VAULT SYSTEM
// ============================================================
function initAssetsUI() {
    renderAssetsVault();
}

function renderAssetsVault() {
    const ownedGrid = document.getElementById('my-owned-parcels-grid');
    const relicsGrid = document.getElementById('relics-assets-grid');
    if (!ownedGrid || !relicsGrid) return;

    const owned = (appState.landParcels || []).filter(p => p.owner === appState.currentUser.id);
    const totalVal = owned.reduce((acc, p) => acc + (p.ownerPoints || p.basePoints), 0);
    const shieldedCount = owned.filter(p => p.shieldUntil && p.shieldUntil > Date.now()).length;

    // Metrics
    const valEl = document.getElementById('vault-territory-val');
    if (valEl) valEl.textContent = `${totalVal} PTS`;
    const heldEl = document.getElementById('vault-lands-held');
    if (heldEl) heldEl.textContent = `${owned.length} Parcels`;
    const shldEl = document.getElementById('vault-active-shields');
    if (shldEl) shldEl.textContent = `${shieldedCount} Active`;

    // Owned Parcels Cards
    ownedGrid.innerHTML = '';
    if (owned.length === 0) {
        ownedGrid.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted); font-style: italic; padding: 16px;">You haven't claimed any territory yet. Explore the 3D map or GPS environment and click "Stake Claim" on any parcel!</div>`;
    } else {
        owned.forEach(p => {
            const isShielded = p.shieldUntil && p.shieldUntil > Date.now();
            const card = document.createElement('div');
            card.className = 'owned-parcel-card';
            card.innerHTML = `
                <div>
                    <div class="opc-header">
                        <span class="opc-title">${p.name}</span>
                        <span class="parcel-state-pill ${isShielded ? 'parcel-shield-badge' : 'state-gold'}">
                            ${isShielded ? 'Shielded' : 'Gold Land'}
                        </span>
                    </div>
                    <div class="opc-type">${p.type}</div>
                    <div class="opc-meta-row">
                        <span>Coordinates: ${p.lat.toFixed(3)}°N, ${p.lng.toFixed(3)}°E</span>
                        <span><strong>${p.ownerPoints || p.basePoints} PTS</strong></span>
                    </div>
                </div>
                <div class="opc-actions">
                    <button class="btn-action-shield" style="flex:1;" onclick="activateShieldOnParcelById('${p.id}')">
                        ${isShielded ? 'Renew Shield' : 'Activate Shield'}
                    </button>
                    <button class="btn-action-secondary" style="flex:1;" onclick="openTradeModalWithParcelById('${p.id}')">
                        Trade
                    </button>
                </div>
            `;
            ownedGrid.appendChild(card);
        });
    }

    // Relics Cards
    relicsGrid.innerHTML = '';
    const relics = appState.assets || initialAssets;
    relics.forEach(r => {
        const card = document.createElement('div');
        card.className = 'relic-card';
        card.innerHTML = `
            <div class="relic-icon">${r.icon || 'RELIC'}</div>
            <div>
                <h4>${r.name}</h4>
                <p>${r.lore}</p>
                <span class="relic-points-tag">+${r.pointsBonus} Travel Lore</span>
            </div>
        `;
        relicsGrid.appendChild(card);
    });
}

function activateShieldOnParcelById(parcelId) {
    const p = appState.landParcels.find(x => x.id === parcelId);
    if (p) activateShieldOnParcel(p);
}

function openTradeModalWithParcelById(parcelId) {
    const p = appState.landParcels.find(x => x.id === parcelId);
    openTradeModalWithParcel(p);
}

// ============================================================
// 13. LIVE DISPATCHES FEED SYSTEM
// ============================================================
function initDispatchesUI() {
    renderDispatchesStream();

    const form = document.getElementById('broadcast-dispatch-form');
    const input = document.getElementById('dispatch-input-text');
    if (form && input) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;

            const newDisp = {
                id: `disp-${Date.now()}`,
                author: appState.currentUser.name,
                role: 'Wayfarer',
                time: 'Just now',
                text: text
            };

            appState.dispatches.unshift(newDisp);
            saveState();
            input.value = '';
            renderDispatchesStream();
        });
    }
}

function renderDispatchesStream() {
    const container = document.getElementById('dispatches-stream-container');
    if (!container) return;

    container.innerHTML = '';
    const disps = appState.dispatches || initialDispatches;

    disps.forEach(d => {
        const item = document.createElement('div');
        item.className = 'dispatch-item';
        item.innerHTML = `
            <div class="dispatch-header">
                <div>
                    <span class="dispatch-author">${d.author}</span>
                    <span class="dispatch-badge">${d.role || 'Traveller'}</span>
                </div>
                <span class="dispatch-time">${d.time}</span>
            </div>
            <div class="dispatch-text">${d.text}</div>
        `;
        container.appendChild(item);
    });
}

// ============================================================
// 14. ONBOARDING & REGISTRATION SYSTEM
// ============================================================
function initOnboardingUI() {
    const nameInput = document.getElementById('onboard-player-name');
    const bioInput = document.getElementById('onboard-player-bio');
    const homeSelect = document.getElementById('onboard-player-home');
    const avatarGrid = document.getElementById('avatar-selection-grid');
    const form = document.getElementById('onboarding-registration-form');

    // Populate Home Bases from homeLocations
    if (homeSelect) {
        homeSelect.innerHTML = '';
        homeLocations.forEach(h => {
            const opt = document.createElement('option');
            opt.value = h.id;
            opt.textContent = `${h.name} (${h.multiplier} baseline)`;
            if (h.id === appState.playerHomeId) opt.selected = true;
            homeSelect.appendChild(opt);
        });
    }

    // Set existing values
    if (nameInput) nameInput.value = appState.currentUser.name.replace(' (You)', '');
    if (bioInput) bioInput.value = appState.currentUser.bio;

    // Avatar options
    if (avatarGrid) {
        const avatars = ['AK', 'EXP', 'NAV', 'TRV', 'WAY', 'ARC'];
        avatarGrid.innerHTML = '';
        avatars.forEach(av => {
            const div = document.createElement('div');
            div.className = `avatar-option ${appState.currentUser.avatar === av ? 'active' : ''}`;
            div.textContent = av;
            div.addEventListener('click', () => {
                avatarGrid.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('active'));
                div.classList.add('active');
                appState.currentUser.avatar = av;
            });
            avatarGrid.appendChild(div);
        });
    }

    // Form Submit
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const chosenName = nameInput.value.trim() || 'Arjun K.';
            const chosenBio = bioInput.value.trim() || 'Wayfarer';
            const chosenHomeId = homeSelect.value;
            const chosenHome = homeLocations.find(h => h.id === chosenHomeId);

            appState.currentUser.name = `${chosenName} (You)`;
            appState.currentUser.bio = chosenBio;
            appState.playerHomeId = chosenHomeId;
            if (chosenHome) appState.currentUser.homeBase = chosenHome.name;

            saveState();
            updateGlobalMetrics();
            checkCurrentLandParcel();
            renderLeaderboard();
            renderAssetsVault();

            document.getElementById('onboarding-modal').classList.add('hide');
            alert(`Identity updated! Your locked home base is now set to ${chosenHome.name}. Distance bonuses will calculate from here!`);
        });
    }
}

// ============================================================
// 15. TERRITORY TRADE MODAL SYSTEM
// ============================================================
function initTradeModalUI() {
    const form = document.getElementById('territory-trade-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const parcelSelect = document.getElementById('trade-my-parcel-select');
        const partnerSelect = document.getElementById('trade-partner-select');
        const termsInput = document.getElementById('trade-terms-input');

        const parcelId = parcelSelect.value;
        const partnerName = partnerSelect.options[partnerSelect.selectedIndex].text;
        const terms = termsInput.value.trim() || 'Even land swap';

        const parcel = appState.landParcels.find(p => p.id === parcelId);
        if (!parcel) {
            alert("Please select a valid territory to trade.");
            return;
        }

        // Execute trade transfer
        const pointsGained = Math.round(parcel.ownerPoints || parcel.basePoints);
        parcel.owner = partnerSelect.value;
        parcel.ownerName = partnerName;

        const tradeDispatch = {
            id: `disp-${Date.now()}`,
            author: 'Yathra Exchange',
            role: 'Territory Ledger',
            time: 'Just now',
            text: `TRADE EXECUTED: [${parcel.name}] transferred to ${partnerName}. Arjun K. credited +${pointsGained} PTS lore equity! Terms: ${terms}`
        };

        appState.dispatches.unshift(tradeDispatch);
        appState.playerScore = (appState.playerScore || 0) + Math.round(pointsGained * 0.4);

        saveState();
        updateGlobalMetrics();
        updateLandParcelVisuals();
        renderParcelInspector(parcel);
        renderLeaderboard();
        renderAssetsVault();
        renderDispatchesStream();

        document.getElementById('trade-modal').classList.add('hide');
        alert(`Trade complete! [${parcel.name}] transferred to ${partnerName}.`);
    });
}

function openTradeModalWithParcel(parcel) {
    const modal = document.getElementById('trade-modal');
    const select = document.getElementById('trade-my-parcel-select');
    if (!modal || !select) return;

    select.innerHTML = '';
    const owned = (appState.landParcels || []).filter(p => p.owner === appState.currentUser.id);

    if (owned.length === 0) {
        alert("You must own at least one piece of land to initiate a territory trade.");
        return;
    }

    owned.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} (${p.ownerPoints || p.basePoints} PTS)`;
        if (parcel && p.id === parcel.id) opt.selected = true;
        select.appendChild(opt);
    });

    modal.classList.remove('hide');
}

// 16. General Event Bindings
function bindActionEvents() {
    // Header Quick Embark — fly to first joined quest on map
    const quickExpBtn = document.getElementById('btn-quick-expedition');
    if (quickExpBtn) {
        quickExpBtn.addEventListener('click', () => {
            switchTab('explore');
            if (gameMap && appState.userJoinedQuests.length > 0) {
                const questId = appState.userJoinedQuests[0];
                const quest = appState.quests.find(q => q.id === questId);
                const loc = quest && locations.find(l => l.id === quest.locationId);
                if (loc && loc.lng && loc.lat) {
                    gameMap.flyTo({ center: [loc.lng, loc.lat], zoom: 16, pitch: 60, essential: true });
                }
            }
        });
    }

    // Quest Modal actions
    document.getElementById('btn-close-quest-modal').addEventListener('click', () => {
        document.getElementById('quest-modal').classList.add('hide');
    });
    document.getElementById('btn-quest-join-toggle').addEventListener('click', toggleJoinQuest);
    document.getElementById('btn-quest-complete').addEventListener('click', completeModalQuest);
    document.getElementById('btn-quest-teammates').addEventListener('click', () => {
        document.getElementById('quest-modal').classList.add('hide');
        openChatWithUser('user-faizal');
    });

    // Quest Completion Summary close
    const compCloseBtn = document.getElementById('btn-close-completion');
    if (compCloseBtn) {
        compCloseBtn.addEventListener('click', () => {
            document.getElementById('quest-completion-modal').classList.add('hide');
            switchTab('profile');
        });
    }

    // Expedition overlay finish & abort
    document.getElementById('btn-finish-expedition').addEventListener('click', completeExpedition);
    document.getElementById('btn-abort-expedition').addEventListener('click', () => {
        if (expeditionTimer) clearInterval(expeditionTimer);
        document.getElementById('expedition-view').classList.add('hide');
        currentExpedition = null;
    });

    // User Profile Modal close
    document.getElementById('btn-close-user-modal').addEventListener('click', () => {
        document.getElementById('user-profile-modal').classList.add('hide');
    });

    // Journal Export
    const exportBtn = document.getElementById('btn-export-journal');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState.discoveries, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "yathrakarude_field_journal.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }
}

