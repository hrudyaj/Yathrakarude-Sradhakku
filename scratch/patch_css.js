const fs = require('fs');
const patch = `
/* --- 3D OVERHAUL PATCH --- */
body { font-family: 'Nunito Sans', sans-serif; }
h1, h2, h3, h4, h5, h6, .brand-title, .page-title, .section-heading, .modal-title, .quest-card-title, .cc-name, .convo-name {
    font-family: 'Fredoka', sans-serif;
}

#game-environment-container {
    position: absolute;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
}
#game-canvas {
    width: 100%;
    height: 100%;
    display: block;
    outline: none;
}

/* Hide old structural elements */
.app-header, .desktop-nav, .mobile-bottom-nav, .header-actions { display: none !important; }

/* New HUD Top */
.game-hud-top {
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    z-index: 100;
    pointer-events: none;
}
.hud-location {
    pointer-events: auto;
    background: rgba(26, 43, 39, 0.75);
    backdrop-filter: blur(8px);
    color: var(--fog);
    padding: 8px 16px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    box-shadow: var(--shadow-md);
    border: 1px solid rgba(255,255,255,0.1);
}
.hud-action-btn {
    pointer-events: auto;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(26, 43, 39, 0.75);
    backdrop-filter: blur(8px);
    color: var(--fog);
    border: 1px solid rgba(255,255,255,0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: var(--shadow-md);
    position: relative;
    cursor: pointer;
    transition: var(--transition);
}
.hud-action-btn:hover { background: var(--pine); transform: scale(1.05); }
.hud-action-btn .unread-dot {
    position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; background: var(--clay); border-radius: 50%;
}

/* New HUD Bottom */
.game-hud-bottom {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    z-index: 100;
    pointer-events: none;
}
.hud-nav-btn {
    pointer-events: auto;
    background: rgba(233, 231, 220, 0.9);
    backdrop-filter: blur(8px);
    color: var(--pine);
    border: none;
    border-radius: var(--radius-full);
    padding: 10px 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 0.9rem;
    box-shadow: var(--shadow-md);
    cursor: pointer;
    transition: var(--transition);
}
.hud-nav-btn:hover { background: #fff; transform: translateY(-2px); }

/* Game Modal Overlays */
.game-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(26, 43, 39, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding: 10px;
    transition: opacity 0.3s;
}
@media (min-width: 768px) {
    .game-modal-overlay { align-items: center; padding: 40px; }
}
.game-modal-overlay.hide {
    display: none;
}
.game-modal-content {
    background: var(--fog-light);
    width: 100%;
    max-width: 800px;
    max-height: 85vh;
    border-radius: var(--radius-xl);
    padding: 0;
    overflow-y: auto;
    position: relative;
    box-shadow: var(--shadow-lg);
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

.game-modal-content > .modal-close-btn {
    position: sticky;
    top: 16px;
    right: 16px;
    float: right;
    z-index: 10;
    background: rgba(0,0,0,0.05);
}

/* Ensure #tab-explore behaves as a base layer */
#tab-explore.tab-pane.active {
    display: block;
    height: 100%;
}
#game-hud {
    pointer-events: none; /* Let clicks pass to canvas */
}
#game-hud > * {
    pointer-events: auto; /* Re-enable clicks on HUD elements */
}
#hud-location-banner, .hud-top-right {
    display: none !important; /* Hide old map hud */
}
`;
fs.appendFileSync('index.css', patch);
console.log('CSS patched');
