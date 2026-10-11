const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const newSection = `// 3. Three.js Game Environment — GPS + OSM Buildings + Monster Creatures
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
    const bbox = \`\${lat - delta},\${lng - delta},\${lat + delta},\${lng + delta}\`;
    const query = \`[out:json][timeout:15];(way[building](\${bbox});relation[building](\${bbox}););out body;>;out skel qt;\`;
    const url = \`https://overpass-api.de/api/interpreter?data=\${encodeURIComponent(query)}\`;

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
    
    const buildingPalette = ['#E9E7DC','#F5F3ED','#B98578','#687D65','#253B36','#C6AA70','#9DAE9A'];
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

    console.log(\`OSM: rendered \${ways.length} building footprints\`);
    osmBuildingsLoaded = true;
}

// Fallback if GPS/OSM unavailable
function buildFallbackEnvironment() {
    // Ground
    const groundGeo = new THREE.PlaneGeometry(400, 400);
    const groundMat = new THREE.MeshLambertMaterial({ color: '#A8B9A2' });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    scene.add(ground);
    osmBuildingMeshes.push(ground);

    // Road
    const roadGeo = new THREE.PlaneGeometry(8, 400);
    const roadMat = new THREE.MeshLambertMaterial({ color: '#6B7B72' });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);
    osmBuildingMeshes.push(road);

    // Sidewalks
    [-5.5, 5.5].forEach(sx => {
        const swGeo = new THREE.PlaneGeometry(2, 400);
        const swMat = new THREE.MeshLambertMaterial({ color: '#D8D4C6' });
        const sw = new THREE.Mesh(swGeo, swMat);
        sw.rotation.x = -Math.PI / 2;
        sw.position.set(sx, 0.01, 0);
        scene.add(sw);
        osmBuildingMeshes.push(sw);
    });

    // Buildings — varied shapes (box + pitched roof)
    const buildingStyles = [
        { wall: '#E9E7DC', roof: '#B98578' },
        { wall: '#687D65', roof: '#253B36' },
        { wall: '#F5F3ED', roof: '#C6AA70' },
        { wall: '#B98578', roof: '#253B36' },
        { wall: '#253B36', roof: '#687D65' },
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
                const trunkMat = new THREE.MeshLambertMaterial({ color: '#5C4033' });
                const trunk = new THREE.Mesh(trunkGeo, trunkMat);

                const leavesR = 1 + Math.random() * 0.8;
                const leavesGeo = new THREE.SphereGeometry(leavesR, 8, 6);
                const leavesMat = new THREE.MeshLambertMaterial({ color: Math.random() > 0.5 ? '#253B36' : '#687D65' });
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
// MONSTER CREATURE BUILDER
// Quest markers are now intricate creature avatars
// =============================================
function buildMonsterCreature(questIndex, palette) {
    const group = new THREE.Group();

    // Body types cycle per quest index
    const type = questIndex % 4;

    // --- Shared palette ---
    const bodyCol = palette[0] || '#253B36';
    const accentCol = palette[1] || '#B98578';
    const eyeCol = '#ffeaad';
    const darkCol = '#1A2B27';

    const bodyMat = new THREE.MeshLambertMaterial({ color: bodyCol });
    const accentMat = new THREE.MeshLambertMaterial({ color: accentCol });
    const eyeMat = new THREE.MeshBasicMaterial({ color: eyeCol });
    const darkMat = new THREE.MeshLambertMaterial({ color: darkCol });

    if (type === 0) {
        // ---- TYPE A: Lanky Forest Watcher ----
        // Torso (elongated capsule-like)
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.4, 10), bodyMat);
        torso.position.y = 1.2;
        group.add(torso);

        // Head (rounded)
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 8), bodyMat);
        head.position.y = 2.15;
        group.add(head);

        // Eyes
        [[-0.14, 0.06], [0.14, 0.06]].forEach(([ex, ey]) => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), eyeMat);
            eye.position.set(ex, 2.15 + ey, 0.34);
            group.add(eye);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), darkMat);
            pupil.position.set(ex, 2.15 + ey, 0.41);
            group.add(pupil);
        });

        // Antlers (two branching pairs)
        for (let side of [-1, 1]) {
            const antler1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.7, 6), accentMat);
            antler1.position.set(side * 0.25, 2.65, 0);
            antler1.rotation.z = side * 0.4;
            group.add(antler1);
            const antler2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.45, 6), accentMat);
            antler2.position.set(side * 0.48, 2.88, 0);
            antler2.rotation.z = side * 0.9;
            group.add(antler2);
            const antler3 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.35, 6), accentMat);
            antler3.position.set(side * 0.32, 3.05, 0.1);
            antler3.rotation.z = side * 0.3;
            antler3.rotation.x = -0.3;
            group.add(antler3);
        }

        // Legs
        [-0.18, 0.18].forEach(lx => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.9, 8), bodyMat);
            leg.position.set(lx, 0.45, 0);
            group.add(leg);
            // Foot
            const foot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), accentMat);
            foot.position.set(lx, 0.05, 0.08);
            group.add(foot);
        });

    } else if (type === 1) {
        // ---- TYPE B: Stone Crab Familiar ----
        // Shell / carapace
        const shell = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 7), bodyMat);
        shell.scale.y = 0.6;
        shell.position.y = 0.55;
        group.add(shell);

        // Ridge bumps on shell
        for (let b = 0; b < 5; b++) {
            const bump = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), accentMat);
            const angle = (b / 5) * Math.PI * 2;
            bump.position.set(Math.cos(angle) * 0.3, 0.8, Math.sin(angle) * 0.3);
            group.add(bump);
        }

        // Eyes on stalks
        [[-0.25, 0], [0.25, 0]].forEach(([ex]) => {
            const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6), bodyMat);
            stalk.position.set(ex, 1.05, 0.4);
            group.add(stalk);
            const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), eyeMat);
            eyeball.position.set(ex, 1.3, 0.4);
            group.add(eyeball);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), darkMat);
            pupil.position.set(ex, 1.3, 0.51);
            group.add(pupil);
        });

        // Claws
        [[-1, 0.3], [1, 0.3]].forEach(([cx, cz]) => {
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 8), bodyMat);
            arm.position.set(cx * 0.7, 0.45, cz);
            arm.rotation.z = cx * 1.1;
            group.add(arm);
            const claw1 = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.35, 6), accentMat);
            claw1.position.set(cx * 1.1, 0.5, cz + 0.2);
            group.add(claw1);
            const claw2 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 6), accentMat);
            claw2.position.set(cx * 1.15, 0.3, cz - 0.1);
            claw2.rotation.x = 0.4;
            group.add(claw2);
        });

        // Legs (3 per side)
        for (let side of [-1, 1]) {
            for (let l = 0; l < 3; l++) {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 6), darkMat);
                leg.position.set(side * (0.55 + l * 0.1), 0.2, -0.2 + l * 0.2);
                leg.rotation.z = side * (0.5 + l * 0.15);
                group.add(leg);
            }
        }

    } else if (type === 2) {
        // ---- TYPE C: Wisp Lantern Spirit ----
        // Floating orb core
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 8),
            new THREE.MeshStandardMaterial({ color: accentCol, emissive: accentCol, emissiveIntensity: 0.7, transparent: true, opacity: 0.9 }));
        core.position.y = 1.5;
        group.add(core);

        // Outer glow shell
        const glow = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8),
            new THREE.MeshBasicMaterial({ color: accentCol, transparent: true, opacity: 0.18, side: THREE.BackSide }));
        glow.position.y = 1.5;
        group.add(glow);

        // Eyes (slit-like, floating)
        [[-0.12, 0], [0.12, 0]].forEach(([ex]) => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 4), darkMat);
            eye.scale.y = 0.4;
            eye.position.set(ex, 1.54, 0.38);
            group.add(eye);
        });

        // Trailing tail wisps
        for (let w = 0; w < 5; w++) {
            const wispGeo = new THREE.CylinderGeometry(0.06, 0.01, 0.7, 6);
            const wisp = new THREE.Mesh(wispGeo,
                new THREE.MeshStandardMaterial({ color: accentCol, emissive: accentCol, emissiveIntensity: 0.4, transparent: true, opacity: 0.6 }));
            const angle = (w / 5) * Math.PI * 2;
            wisp.position.set(Math.cos(angle) * 0.25, 0.8, Math.sin(angle) * 0.25);
            wisp.rotation.x = 0.5;
            wisp.rotation.z = angle;
            group.add(wisp);
        }

        // Crown spikes
        for (let s = 0; s < 6; s++) {
            const spikeGeo = new THREE.ConeGeometry(0.05, 0.35, 5);
            const spike = new THREE.Mesh(spikeGeo, accentMat);
            const sAngle = (s / 6) * Math.PI * 2;
            spike.position.set(Math.cos(sAngle) * 0.38, 1.9, Math.sin(sAngle) * 0.38);
            spike.rotation.z = Math.atan2(Math.cos(sAngle) * 0.38, 0.4);
            group.add(spike);
        }

    } else {
        // ---- TYPE D: Ancient Stone Golem ----
        // Big blocky torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.7), bodyMat);
        torso.position.y = 1.1;
        group.add(torso);

        // Head (cubic)
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.7, 0.65), bodyMat);
        head.position.y = 2.05;
        group.add(head);

        // Glowing cracks / rune lines (flat planes)
        const runeGeo = new THREE.PlaneGeometry(0.7, 0.08);
        const runeMat = new THREE.MeshBasicMaterial({ color: accentCol });
        [0, 0.25, 0.5].forEach(ry => {
            const rune = new THREE.Mesh(runeGeo, runeMat);
            rune.position.set(0, 0.85 + ry, 0.36);
            group.add(rune);
        });

        // Glowing eyes
        [[-0.18, 0.08], [0.18, 0.08]].forEach(([ex, ey]) => {
            const eye = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.05),
                new THREE.MeshBasicMaterial({ color: accentCol }));
            eye.position.set(ex, 2.05 + ey, 0.33);
            group.add(eye);
        });

        // Shoulder rocks
        [[-0.72, 1.5], [0.72, 1.5]].forEach(([sx, sy]) => {
            const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.4), darkMat);
            shoulder.position.set(sx, sy, 0);
            shoulder.rotation.z = sx < 0 ? 0.2 : -0.2;
            group.add(shoulder);
            const spikeG = new THREE.ConeGeometry(0.1, 0.4, 5);
            const sp = new THREE.Mesh(spikeG, accentMat);
            sp.position.set(sx, sy + 0.4, 0);
            sp.rotation.z = sx < 0 ? 0.3 : -0.3;
            group.add(sp);
        });

        // Legs (big blocks)
        [-0.3, 0.3].forEach(lx => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.85, 0.38), darkMat);
            leg.position.set(lx, 0.42, 0);
            group.add(leg);
            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.5), bodyMat);
            foot.position.set(lx, 0.1, 0.06);
            group.add(foot);
        });
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

function useDefaultOrigin() {
    // Fort Kochi, Kerala
    gpsOrigin = { lat: 9.9632, lng: 76.2430 };
    buildFallbackEnvironment();
    document.getElementById('hud-location-label').textContent = 'Fort Kochi — Stylised Demo World';
}

function updateCameraFromGPS(lat, lng) {
    const { x, z } = lngLatToXZ(lng, lat);
    // Smoothly move camera to match real position
    camera.position.x = x;
    camera.position.z = z;
    checkTerritory();
}

const territories = [];
function addTerritoryOverlay(type, colorHex, zStart, zEnd, name, owner) {
    const geo = new THREE.PlaneGeometry(20, Math.abs(zEnd - zStart));
    const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.14,
        depthWrite: false
    });
    const plane = new THREE.Mesh(geo, mat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, 0.02, (zStart + zEnd) / 2);
    scene.add(plane);
    territories.push({ zStart, zEnd, type, name, owner, colorHex });
}

function checkTerritory() {
    const z = camera.position.z;
    const active = territories.find(t => z <= t.zStart && z >= t.zEnd);
    const panel = document.getElementById('hud-territory-panel');
    if (!panel) return;
    if (active) {
        panel.classList.remove('hide');
        document.getElementById('territory-status').innerText = active.type;
        document.getElementById('territory-name').innerText = active.name;
        document.getElementById('territory-owner').innerText = 'Owner: ' + active.owner;
        panel.style.borderLeftColor = active.colorHex;
    } else {
        panel.classList.add('hide');
    }
}

function applyDayNightCycle() {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 17) {
        currentEnvState = 'day';
        scene.background = new THREE.Color('#D8D4C6');
        scene.fog = new THREE.FogExp2('#D8D4C6', 0.018);
        hemiLight.intensity = 0.75; dirLight.intensity = 0.95;
        dirLight.color.set('#fff5e6');
    } else if (hour >= 17 && hour < 19) {
        currentEnvState = 'sunset';
        scene.background = new THREE.Color('#B98578');
        scene.fog = new THREE.FogExp2('#B98578', 0.022);
        hemiLight.intensity = 0.45; dirLight.intensity = 0.8;
        dirLight.color.set('#ffb380');
    } else {
        currentEnvState = 'night';
        scene.background = new THREE.Color('#1A2B27');
        scene.fog = new THREE.FogExp2('#1A2B27', 0.03);
        hemiLight.intensity = 0.18; dirLight.intensity = 0.25;
        dirLight.color.set('#aaccff');
    }
}

function initGameEnvironment() {
    const container = document.getElementById('game-environment-container');
    const canvas = document.getElementById('game-canvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    document.getElementById('btn-close-hud').addEventListener('click', () =>
        document.getElementById('hud-quest-panel').classList.add('hide'));
    document.getElementById('btn-hud-inspect').addEventListener('click', () => {
        if (currentModalQuest) openQuestModal(currentModalQuest.id);
    });

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 800);
    camera.position.set(0, 1.65, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;

    hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    scene.add(hemiLight);
    dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 12, 7);
    scene.add(dirLight);

    applyDayNightCycle();

    // Territory sample data
    addTerritoryOverlay('Your Sanctuary', '#C6AA70', 5, -30, 'Your Sanctuary', 'Arjun K.');
    addTerritoryOverlay('Contested', '#B98578', -30, -65, 'Border Market', 'Disputed');
    addTerritoryOverlay('Protected', '#4a90e2', -65, -100, 'Heritage Zone', 'Global Trust');

    startGPSTracking();
    renderQuestMarkers();

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    canvas.addEventListener('touchmove', onPointerMove, { passive: false });
    canvas.addEventListener('touchend', onPointerUp);
    canvas.addEventListener('click', onCanvasClick);
    window.addEventListener('resize', onWindowResize);

    renderer.setAnimationLoop(animate);
    checkTerritory();
}

function onCanvasClick(event) {
    if (isDragging) return;
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
        }
    } else {
        document.getElementById('hud-quest-panel').classList.add('hide');
    }
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
    camera.rotation.y += dx * 0.005;
    camera.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, camera.rotation.x + dy * 0.005));
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
        // Float + rotate the whole creature
        qm.group.position.y = Math.sin(time * 0.001 + i * 1.3) * 0.12;
        qm.group.rotation.y += 0.007;
    });
    renderer.render(scene, camera);
}
`;

const regex = /\/\/ 3\. Three\.js Game Environment[\s\S]*?\/\/ 5\. Collaborative Quest System/;
const match = appJs.match(regex);
if (!match) {
    console.error('Could not find section to replace!');
    process.exit(1);
}
appJs = appJs.replace(regex, newSection + '\n\n// 5. Collaborative Quest System');
fs.writeFileSync('app.js', appJs);
console.log('DONE: GPS + OSM Buildings + Intricate Creatures patched into app.js');
