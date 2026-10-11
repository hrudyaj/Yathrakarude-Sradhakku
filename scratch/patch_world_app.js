const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const replacement = `// 3. Three.js Game Environment & World Overhaul
let scene, camera, renderer;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let questMarkers3D = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Lighting and Env State
let hemiLight, dirLight;
let currentEnvState = 'day';

// Movement
let targetZ = 5;
const WALK_SPEED = 15;

function initGameEnvironment() {
    const container = document.getElementById('game-environment-container');
    const canvas = document.getElementById('game-canvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    // HUD button listeners
    document.getElementById('btn-close-hud').addEventListener('click', () => {
        document.getElementById('hud-quest-panel').classList.add('hide');
    });
    document.getElementById('btn-hud-inspect').addEventListener('click', () => {
        if (currentModalQuest) openQuestModal(currentModalQuest.id);
    });

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5); // Average eye height

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    
    dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    applyDayNightCycle();
    buildWorldRegions();
    renderQuestMarkers();

    // Interaction
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onPointerDown, {passive: false});
    canvas.addEventListener('touchmove', onPointerMove, {passive: false});
    canvas.addEventListener('touchend', onPointerUp);
    canvas.addEventListener('click', onCanvasClick);
    
    window.addEventListener('resize', onWindowResize);
    
    // Movement Controls
    document.getElementById('btn-move-forward')?.addEventListener('click', () => moveCamera(-WALK_SPEED));
    document.getElementById('btn-move-backward')?.addEventListener('click', () => moveCamera(WALK_SPEED));

    renderer.setAnimationLoop(animate);
    checkTerritory();
}

function applyDayNightCycle() {
    const hour = new Date().getHours();
    
    // Day: 7 to 17
    // Sunset: 17 to 19
    // Night: 19 to 7
    if (hour >= 7 && hour < 17) {
        currentEnvState = 'day';
        scene.background = new THREE.Color('#D8D4C6');
        scene.fog = new THREE.FogExp2('#D8D4C6', 0.02);
        hemiLight.intensity = 0.7;
        dirLight.intensity = 0.9;
        dirLight.color = new THREE.Color('#fff5e6');
    } else if (hour >= 17 && hour < 19) {
        currentEnvState = 'sunset';
        scene.background = new THREE.Color('#B98578'); // Clay rose
        scene.fog = new THREE.FogExp2('#B98578', 0.025);
        hemiLight.intensity = 0.4;
        dirLight.intensity = 0.8;
        dirLight.color = new THREE.Color('#ffb380');
    } else {
        currentEnvState = 'night';
        scene.background = new THREE.Color('#1A2B27'); // Pine dark
        scene.fog = new THREE.FogExp2('#1A2B27', 0.035);
        hemiLight.intensity = 0.15;
        dirLight.intensity = 0.2;
        dirLight.color = new THREE.Color('#aaccff');
    }
}

function buildWorldRegions() {
    // Shared Ground
    const groundGeo = new THREE.PlaneGeometry(300, 400);
    const groundMat = new THREE.MeshLambertMaterial({ color: '#A8B9A2' }); // Sage green
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    scene.add(ground);

    // REGION 1: Settlement (z: 0 to -100)
    buildSettlement(0, -100);

    // REGION 2: Nature (z: -100 to -200)
    buildNature(-100, -200);

    // REGION 3: Landmark (z: -200 to -300)
    buildLandmark(-200, -300);
    
    // Ownership Territories
    addTerritoryOverlay('Player-owned', '#C6AA70', 0, -30, 'Your Sanctuary', 'Arjun K.');
    addTerritoryOverlay('Contested', '#B98578', -30, -60, 'Border Market', 'Disputed');
    addTerritoryOverlay('Protected', '#4a90e2', -60, -90, 'Heritage Zone', 'Global Trust');
}

function buildSettlement(zStart, zEnd) {
    const roadGeo = new THREE.PlaneGeometry(8, Math.abs(zEnd - zStart));
    const roadMat = new THREE.MeshLambertMaterial({ color: '#6B7B72' });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.01, (zStart + zEnd) / 2);
    scene.add(road);

    const buildingColors = ['#E9E7DC', '#F5F3ED', '#B98578', '#687D65', '#253B36'];
    for(let z = zStart - 5; z > zEnd + 5; z -= 8) {
        if (Math.random() > 0.2) {
            const h = 2 + Math.random() * 5;
            const w = 3 + Math.random() * 2;
            const geo = new THREE.BoxGeometry(w, h, 4);
            const col = buildingColors[Math.floor(Math.random()*buildingColors.length)];
            const mat = new THREE.MeshLambertMaterial({ color: col });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(5 + Math.random()*2, h/2, z + Math.random()*2);
            scene.add(mesh);
            
            // Add a glowing window if it's night
            if (currentEnvState === 'night' && Math.random() > 0.5) {
                const winGeo = new THREE.PlaneGeometry(1, 1);
                const winMat = new THREE.MeshBasicMaterial({ color: '#ffeaad' });
                const window = new THREE.Mesh(winGeo, winMat);
                window.position.set(mesh.position.x - w/2 - 0.01, mesh.position.y, mesh.position.z);
                window.rotation.y = -Math.PI / 2;
                scene.add(window);
            }
        }
        
        if (Math.random() > 0.2) {
            const h = 2 + Math.random() * 5;
            const w = 3 + Math.random() * 2;
            const geo = new THREE.BoxGeometry(w, h, 4);
            const col = buildingColors[Math.floor(Math.random()*buildingColors.length)];
            const mat = new THREE.MeshLambertMaterial({ color: col });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(-5 - Math.random()*2, h/2, z + Math.random()*2);
            scene.add(mesh);
        }
    }
}

function buildNature(zStart, zEnd) {
    const roadGeo = new THREE.PlaneGeometry(6, Math.abs(zEnd - zStart));
    const roadMat = new THREE.MeshLambertMaterial({ color: '#B98578' }); // Dirt path
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, (zStart + zEnd) / 2);
    scene.add(road);

    // Trees
    for(let z = zStart; z > zEnd; z -= 4) {
        for(let side of [-1, 1]) {
            if (Math.random() > 0.4) {
                const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5);
                const trunkMat = new THREE.MeshLambertMaterial({ color: '#5C4033' });
                const trunk = new THREE.Mesh(trunkGeo, trunkMat);
                
                const leavesGeo = new THREE.SphereGeometry(1.5 + Math.random());
                const leavesMat = new THREE.MeshLambertMaterial({ color: '#253B36' }); // Pine green
                const leaves = new THREE.Mesh(leavesGeo, leavesMat);
                
                const px = side * (4 + Math.random() * 8);
                const pz = z + Math.random() * 3;
                
                trunk.position.set(px, 0.75, pz);
                leaves.position.set(px, 2 + Math.random(), pz);
                
                scene.add(trunk);
                scene.add(leaves);
            }
        }
    }
}

function buildLandmark(zStart, zEnd) {
    const roadGeo = new THREE.PlaneGeometry(10, Math.abs(zEnd - zStart));
    const roadMat = new THREE.MeshLambertMaterial({ color: '#E9E7DC' }); // Stone path
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.01, (zStart + zEnd) / 2);
    scene.add(road);

    // Columns
    for(let z = zStart - 10; z > zEnd + 10; z -= 15) {
        for(let side of [-1, 1]) {
            const colGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 16);
            const colMat = new THREE.MeshLambertMaterial({ color: '#D8D4C6' });
            const column = new THREE.Mesh(colGeo, colMat);
            column.position.set(side * 6, 4, z);
            scene.add(column);
        }
    }
}

const territories = [];
function addTerritoryOverlay(type, colorHex, zStart, zEnd, name, owner) {
    const geo = new THREE.PlaneGeometry(12, Math.abs(zEnd - zStart));
    const mat = new THREE.MeshBasicMaterial({ 
        color: colorHex, 
        transparent: true, 
        opacity: 0.15,
        depthWrite: false
    });
    const plane = new THREE.Mesh(geo, mat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, 0.02, (zStart + zEnd) / 2);
    scene.add(plane);

    territories.push({ zStart, zEnd, type, name, owner, colorHex });
}

function renderQuestMarkers() {
    questMarkers3D.forEach(m => scene.remove(m.mesh));
    questMarkers3D = [];

    appState.quests.forEach((quest, index) => {
        const geo = new THREE.CylinderGeometry(0.3, 0.3, 2.5, 16);
        // Make them glow if night
        const mat = new THREE.MeshStandardMaterial({ 
            color: '#C6AA70',
            emissive: currentEnvState === 'night' ? '#C6AA70' : '#000000',
            emissiveIntensity: currentEnvState === 'night' ? 0.5 : 0
        });
        const mesh = new THREE.Mesh(geo, mat);
        
        // Spread them across the regions
        const zPos = -(index * 15) - 5;
        const side = index % 2 === 0 ? 1 : -1;
        mesh.position.set(side * 3, 1.25, zPos);
        
        scene.add(mesh);
        questMarkers3D.push({ mesh, quest });
    });
}

function moveCamera(deltaZ) {
    targetZ += deltaZ;
    // Bounds check
    if (targetZ > 5) targetZ = 5;
    if (targetZ < -300) targetZ = -300;
    
    // Tween setup
    new TWEEN.Tween(camera.position)
        .to({ z: targetZ }, 800)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            checkTerritory();
        })
        .start();
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

// Interactivity
function onCanvasClick(event) {
    if (isDragging) return;
    
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(questMarkers3D.map(qm => qm.mesh));

    if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const qmData = questMarkers3D.find(qm => qm.mesh === hitMesh);
        if (qmData) {
            const quest = qmData.quest;
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
    const touch = e.touches ? e.touches[0] : e;
    previousMousePosition = { x: touch.clientX, y: touch.clientY };
}

function onPointerMove(e) {
    if (!isDragging) return;
    const touch = e.touches ? e.touches[0] : e;
    const deltaMove = {
        x: touch.clientX - previousMousePosition.x,
        y: touch.clientY - previousMousePosition.y
    };

    const rotationSpeed = 0.005;
    camera.rotation.y += deltaMove.x * rotationSpeed;
    camera.rotation.x += deltaMove.y * rotationSpeed;
    camera.rotation.x = Math.max(-Math.PI/4, Math.min(Math.PI/4, camera.rotation.x));
    previousMousePosition = { x: touch.clientX, y: touch.clientY };
}

function onPointerUp(e) {
    setTimeout(() => { isDragging = false; }, 50);
}

function onWindowResize() {
    if(!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
    if (window.TWEEN) TWEEN.update(time);
    
    questMarkers3D.forEach((qm, i) => {
        qm.mesh.position.y = 1.25 + Math.sin((time * 0.002) + i) * 0.2;
        qm.mesh.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
}
`;

const regex = /\/\/ 3\. Three\.js Game Environment[\s\S]*?\/\/ 5\. Collaborative Quest System/;
appJs = appJs.replace(regex, replacement + '\n// 5. Collaborative Quest System');

fs.writeFileSync('app.js', appJs);
console.log('app.js successfully patched with world overhaul.');
