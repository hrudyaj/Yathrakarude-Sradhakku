# Yathrakarude Sradhakku | യാത്രക്കാരുടെ ശ്രദ്ധയ്ക്ക്

> **"Attention, Travellers!"** — A collaborative travel exploration game connecting travellers and locals to complete quests, claim land sectors, unlock cultural relics, and shape a shared persistent 3D world.

---

## 🌟 Key Features

- **Interactive 3D / Perspective World**:
  - Built with Three.js featuring dynamic terrain grids, segmented land plots, buildings, and procedural landmark elements.
  - Land plots dynamically change colors: Gray for unexplored territories, Blue glow for active sectors, and Gold for acquired lands.
  - Multi-view cameras: Seamless toggle between Full Map Overview, Isometric/Tactical Angle, and 3D Perspective exploration.

- **Cute Spirit Companion & Creatures**:
  - Interactive companion (cute bunny-style guardian spirit) navigating the world alongside you.

- **GPS & Location-Based Movement**:
  - Real-time GPS movement tracker with high-accuracy geolocation sync and adaptive mock-path simulation fallback.

- **Full Collaborative Game Systems**:
  - **Quests & Missions**: Authentic cultural & local quests with objectives, step progress tracking, and reward claims.
  - **Travel Dispatches Stream**: Live real-time community feed with message dispatches, sector tagging, and salute interactions.
  - **Cultural Assets & Relics**: Collection of cultural artefacts and relics with equipped perks and stat bonuses.
  - **Rankings & Leaderboard**: Explorer tiers, faction standings, and competitive rank brackets.
  - **Onboarding & Profile Setup**: Custom persona onboarding with bio, faction selection, and stats profile management.

---

## 🚀 Getting Started

This project is a standalone web application built with HTML5, CSS3, and modern JavaScript (ES6+) with Three.js via CDN.

### Run Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/hrudyaj/Yathrakarude-Sradhakku.git
   cd Yathrakarude-Sradhakku
   ```

2. Start a local HTTP server:
   - Using Python:
     ```bash
     python -m http.server 8080
     ```
   - Using Node.js / `npx`:
     ```bash
     npx serve .
     ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

---

## 🛠️ Tech Stack

- **HTML5 & Vanilla CSS**: Custom responsive design system with a vibrant, warm terracotta, sage green, and ocean palette.
- **Three.js (r128)**: 3D scene rendering, dynamic sector lighting, meshes, and interactive camera controllers.
- **Geolocation API**: Live GPS position tracking and route simulation.
