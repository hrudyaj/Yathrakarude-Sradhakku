const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Update fonts and add Three.js
html = html.replace(
    /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Fraunces[^>]+>/,
    `<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700&family=Noto+Serif+Malayalam:wght@400;600;700&display=swap" rel="stylesheet">\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js"></script>`
);

// 2. Remove the app-header completely
html = html.replace(/<header class="app-header">[\s\S]*?<\/header>/, `
        <!-- Game HUD Overlays -->
        <div class="game-hud-top">
            <div class="hud-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span id="hud-location-label">Fort Kochi (Demo Region)</span>
            </div>
            <button id="btn-open-messages" class="hud-action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span class="unread-dot" id="messages-unread-dot"></span>
            </button>
        </div>
`);

// 3. Replace game environment container inside explore tab to be just a canvas
html = html.replace(/<div id="game-map"><\/div>/, `<canvas id="game-canvas"></canvas>`);

// 4. Change main tabs into modal overlays
html = html.replace(/<section id="tab-explore" class="tab-pane active">/, `<section id="tab-explore" class="tab-pane active">`); // Keep explore active, but make others modals
html = html.replace(/<section id="tab-quests" class="tab-pane">/, `<section id="tab-quests" class="game-modal-overlay hide"><div class="game-modal-content"><button class="modal-close-btn" data-close-modal="tab-quests">&times;</button>`);
html = html.replace(/<\/section>\s*<!-- TAB 3/, `</div></section>\n\n            <!-- TAB 3`); // close modal-content for quests

html = html.replace(/<section id="tab-community" class="tab-pane">/, `<section id="tab-community" class="game-modal-overlay hide"><div class="game-modal-content"><button class="modal-close-btn" data-close-modal="tab-community">&times;</button>`);
html = html.replace(/<\/section>\s*<!-- TAB 4/, `</div></section>\n\n            <!-- TAB 4`); // close modal-content for community

html = html.replace(/<section id="tab-profile" class="tab-pane">/, `<section id="tab-profile" class="game-modal-overlay hide"><div class="game-modal-content"><button class="modal-close-btn" data-close-modal="tab-profile">&times;</button>`);
html = html.replace(/<\/section>\s*<\/main>/, `</div></section>\n        </main>`); // close modal-content for profile

// 5. Replace mobile bottom nav with HUD bottom actions
html = html.replace(/<nav class="mobile-bottom-nav">[\s\S]*?<\/nav>/, `
        <div class="game-hud-bottom">
            <button class="hud-nav-btn" data-modal="tab-quests">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <span>Quests</span>
            </button>
            <button class="hud-nav-btn" data-modal="tab-community">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>People</span>
            </button>
            <button class="hud-nav-btn" data-modal="tab-profile">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                <span>Journal</span>
            </button>
        </div>
`);

fs.writeFileSync('index.html', html);
console.log('index.html transformed successfully');
