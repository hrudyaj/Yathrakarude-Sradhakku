const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
// Remove move forward/backward buttons from the hud-bottom
html = html.replace(/<button id="btn-move-backward"[^>]*>[\s\S]*?<\/button>\s*/g, '');
html = html.replace(/<button id="btn-move-forward"[^>]*>[\s\S]*?<\/button>\s*/g, '');
fs.writeFileSync('index.html', html);
console.log('Removed movement buttons from HTML');
