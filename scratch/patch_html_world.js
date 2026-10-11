const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Add movement controls to the bottom HUD
html = html.replace(/<div class="game-hud-bottom">/, `
        <div class="game-hud-bottom">
            <button id="btn-move-backward" class="hud-nav-btn" title="Go Back" style="padding: 10px; border-radius: 50%;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <button id="btn-move-forward" class="hud-nav-btn" title="Go Forward" style="padding: 10px; border-radius: 50%;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
`);

// Add territory panel inside game-hud-top or below it
html = html.replace(/<div class="game-hud-top">[\s\S]*?<\/div>/, (match) => {
    return match + `
        <!-- Territory Overlay -->
        <div id="hud-territory-panel" class="hide" style="position:absolute; top:80px; left:20px; right:20px; max-width: 300px; padding: 12px; border-radius: 12px; background: rgba(26,43,39,0.85); backdrop-filter: blur(8px); color: var(--fog); pointer-events: none; border-left: 4px solid var(--fog); box-shadow: var(--shadow-md); z-index:90;">
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-dim);" id="territory-status">Unclaimed Territory</div>
            <h4 style="margin: 4px 0; font-family: 'Fredoka', sans-serif;" id="territory-name">Region Name</h4>
            <div style="font-size: 0.85rem; color: var(--sage);" id="territory-owner">No Owner</div>
        </div>
    `;
});

fs.writeFileSync('index.html', html);
console.log('index.html patched with UI controls');
