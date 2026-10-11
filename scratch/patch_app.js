const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Replace initNavigation to use the new modal overlays instead of tab switching
appJs = appJs.replace(
    /function initNavigation\(\) \{[\s\S]*?function switchTab\(tabId\) \{[\s\S]*?window.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\s*\}/,
    `function initNavigation() {
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
function switchTab(tabId) { /* Deprecated */ }`
);

// 2. Replace MapLibre logic with Three.js logic
const threeJsLogic = `
// 3. Three.js Game Environment
let scene, camera, renderer;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let questMarkers3D = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

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
    scene.background = new THREE.Color('#D8D4C6'); // Fog dark color for sky
    scene.fog = new THREE.FogExp2('#D8D4C6', 0.03);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5); // Average eye height, slightly back

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xfff5e6, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    buildStylizedEnvironment();
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

    renderer.setAnimationLoop(animate);
}

function buildStylizedEnvironment() {
    // Road
    const roadGeo = new THREE.PlaneGeometry(8, 100);
    const roadMat = new THREE.MeshLambertMaterial({ color: '#6B7B72' }); // Muted text color for road
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshLambertMaterial({ color: '#A8B9A2' }); // Sage green
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    // Generate random buildings
    const buildingColors = ['#E9E7DC', '#F5F3ED', '#B98578', '#687D65'];
    for(let i=0; i<30; i++) {
        const h = 2 + Math.random() * 6;
        const w = 2 + Math.random() * 3;
        const d = 2 + Math.random() * 3;
        const geo = new THREE.BoxGeometry(w, h, d);
        const col = buildingColors[Math.floor(Math.random()*buildingColors.length)];
        const mat = new THREE.MeshLambertMaterial({ color: col });
        const mesh = new THREE.Mesh(geo, mat);
        
        const side = Math.random() > 0.5 ? 1 : -1;
        mesh.position.set(side * (5 + Math.random()*5), h/2, -40 + Math.random()*50);
        scene.add(mesh);
    }
}

function renderQuestMarkers() {
    questMarkers3D.forEach(m => scene.remove(m.mesh));
    questMarkers3D = [];

    // Distribute quests along the road
    appState.quests.forEach((quest, index) => {
        const geo = new THREE.CylinderGeometry(0.3, 0.3, 2.5, 16);
        const mat = new THREE.MeshBasicMaterial({ color: '#C6AA70' }); // Gold
        const mesh = new THREE.Mesh(geo, mat);
        
        // Position them alternately
        const side = index % 2 === 0 ? 1 : -1;
        const zPos = -(index * 8) - 5;
        mesh.position.set(side * 3, 1.25, zPos);
        
        scene.add(mesh);
        questMarkers3D.push({ mesh, quest });
    });
}

function onCanvasClick(event) {
    if (isDragging) return; // Don't trigger click if we were dragging
    
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
    
    // Clamp vertical look
    camera.rotation.x = Math.max(-Math.PI/4, Math.min(Math.PI/4, camera.rotation.x));

    previousMousePosition = { x: touch.clientX, y: touch.clientY };
}

function onPointerUp(e) {
    setTimeout(() => { isDragging = false; }, 50); // slight delay to prevent click firing
}

function onWindowResize() {
    if(!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
    if (window.TWEEN) TWEEN.update(time);
    
    // Add subtle floating animation to quest markers
    questMarkers3D.forEach((qm, i) => {
        qm.mesh.position.y = 1.25 + Math.sin((time * 0.002) + i) * 0.2;
        qm.mesh.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
}
`;

appJs = appJs.replace(/\/\/ 3\. MapLibre GL JS Game Environment[\s\S]*?\/\/ 5\. Collaborative Quest System/, threeJsLogic + '\n\n// 5. Collaborative Quest System');

fs.writeFileSync('app.js', appJs);
console.log('app.js patched successfully');
