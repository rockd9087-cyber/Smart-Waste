# SwachhTrack - Track. Dispose. Reward

A Government of India-backed citizen engagement platform that combines **real-time GPS waste truck tracking**, **smart waste segregation**, and **eco-reward redemption** to revolutionize urban waste management.

## 🌍 Project Overview

SwachhTrack digitizes the waste collection experience, enabling citizens to:
- **Track waste trucks** live on an interactive GPS map with accurate ETAs
- **Segregate waste** at smart disposal doors with instant verification
- **Earn eco-credits** redeemable at partnering restaurants and retailers
- **Reduce noise pollution** via live GPS notifications replacing truck horns

**Theme**: Swachh Bharat Mission 2.0 | Ministry of Housing & Urban Affairs (MoHUA)

---

## ✨ Key Features

### 1. **Live GPS Tracking** 📍
- Real-time truck location with distance & ETA calculations
- Interactive canvas-based route radar
- Simulation controls (pause, next stop, proximity trigger)
- Current route stops and progress stepper

### 2. **Smart Disposal Integration** 🚪
- QR code scanning at pneumatic truck doors
- Waste category selection with dynamic point rates:
  - Dry Plastic: +25 pts/kg
  - Raw Kitchen Waste: +20 pts/kg
  - Cardboard: +15 pts/kg
  - Metals & Cans: +35 pts/kg
  - E-Waste: +50 pts/kg
- Weighing sensor simulation with payload tracking
- Instant credit allocation

### 3. **Rewards & Redemption** 🎁
- Swachh Green Wallet with eco-rank badges
- Partner restaurant vouchers (Haldiram's, etc.)
- CO₂ offset tracking and environmental impact stats
- Transaction history with real-time updates

### 4. **Route Schedule** ⏱️
- Ward-level waste collection timetables
- Truck shift timings and status indicators
- Historical schedule analytics

### 5. **Accessibility & UX** 
- Dark/Light theme toggle
- Audio alerts for proximity notifications (Web Audio API)
- Mobile-responsive design with zero-horn silent zones
- ARIA-compliant modals for auth & vouchers

---

## 🛠️ Technologies Used

### Frontend Stack
| Layer | Technology |
|-------|-----------|
| **Markup** | HTML5 (semantic, accessible) |
| **Styling** | CSS3 (custom properties, animations, Flexbox/Grid) |
| **Logic** | Vanilla JavaScript (no frameworks) |
| **Fonts** | Google Fonts (Plus Jakarta Sans, Space Grotesk) |
| **Graphics** | Canvas API (GPS map rendering) |
| **Media** | Web Audio API (chime synthesis), Webcam API (QR scanning) |

### Architecture
- **Single-Page Application (SPA)** with tabbed navigation
- **Client-side state management** (localStorage for wallet/auth)
- **Simulation engine** for realistic truck movement & timing
- **Responsive breakpoints** for mobile-first design

---

## 🤖 AI Tools & Models Used

| Tool/Model | Purpose | Integration |
|-----------|---------|-------------|
| **Google Fonts API** | Typography optimization | CSS link |
| **Canvas 2D Rendering** | Geospatial visualization of GPS routes | script.js visualization engine |
| **Web Audio API** | Proximity alert chime synthesis | Real-time audio notifications |
| **Webcam API (getUserMedia)** | QR code camera input for waste scanning | Camera viewfinder module |

*Note: Current implementation uses **simulation data**. Production would integrate:*
- Backend APIs (Node.js/Django) for real truck telemetry
- ML models for ETA prediction (TensorFlow/PyTorch)
- QR recognition (OpenCV or Firebase ML Kit)
- Payment gateway APIs (Razorpay/PayU for reward redemption)

---

## 📦 Project Structure

```
Waste-Management-2/
├── index.html          # Main SPA shell with modal dialogs
├── style.css           # 44KB comprehensive styling
│                       #   - Layout & responsiveness
│                       #   - Animations (floating items, pulses)
│                       #   - Theme system (light/dark)
│                       #   - Component styles
├── script.js           # 41KB application logic
│                       #   - Tab navigation & state
│                       #   - GPS simulation engine
│                       #   - Reward wallet mechanics
│                       #   - QR & auth handling
│                       #   - Audio/theme toggles
└── .github/            # GitHub meta configs
```

### Key HTML Sections
- **Header**: Logo, theme toggle, user auth button, sound alerts
- **Navigation Tabs**: 4 main views (GPS, Disposal, Rewards, Schedule)
- **Tab 1 - Tracking**: Live status card, capacity gauge, interactive map
- **Tab 2 - Disposal**: Smart door simulator, QR display, waste type selector
- **Tab 3 - Rewards**: Wallet summary, partner vouchers, transaction history
- **Tab 4 - Schedule**: Stops timeline with ETAs

### Key JavaScript Modules
- `initTabs()` — Tab switching logic
- `updateGPSSimulation()` — Truck movement & distance calculations
- `handleWasteDeposit()` — QR scan & points allocation
- `toggleTheme()` / `toggleAudio()` — UI preferences
- `redeemVoucher()` — Wallet deduction & modal display
- `initMap()` — Canvas-based GPS visualization

---

## 🚀 Setup & Installation

### Prerequisites
- Modern browser with ES6 support (Chrome, Firefox, Safari, Edge)
- Webcam access (for QR scanning feature)
- Local file server (for CORS compliance)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/rockd9087-cyber/Waste-Management-2.git
   cd Waste-Management-2
   ```

2. **Run a local server** (pick one)
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (http-server)
   npx http-server
   
   # VS Code Live Server
   # Right-click index.html → "Open with Live Server"
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

4. **Demo Login**
   - Click "Sign In" → "⚡ Quick Demo Citizen Login"
   - Or enter any credentials (no backend validation)

---

## 💡 Usage Guide

### 1. **Track a Truck**
   - Go to **"Live GPS"** tab
   - See truck #DL-04-SW-2024 position on the map
   - Use controls: "🎯 Focus Truck", "⏩ Speed", "📍 Move Near My Home"
   - Monitor ETA and current stop progress

### 2. **Dispose & Earn**
   - Navigate to **"Smart Door & QR"** tab
   - Select waste category (e.g., "E-Waste" for 50 pts/kg)
   - Adjust weight with slider
   - Click "📷 Scan Door QR & Deposit"
   - See instant points credited

### 3. **Redeem Rewards**
   - Go to **"Points & Discounts"** tab
   - View wallet balance and eco-rank
   - Click any partner voucher (e.g., Haldiram's)
   - Copy promo code and redeem at restaurant

### 4. **View Schedule**
   - Check **"Stops Schedule"** tab
   - See all Ward 14 collection stops with ETAs
   - Plan waste disposal around truck timings

### 5. **Customize Experience**
   - 🌙 Toggle dark mode (header button)
   - 🔔 Enable/disable audio alerts
   - 👤 Sign in with citizen account

---

## 🎨 Design Highlights

- **Color Palette**: Green (#10b981, #059669) for eco-conscious branding, Navy (#0f172a) for contrast
- **Typography**: Modern sans-serif (Plus Jakarta Sans for body, Space Grotesk for headings)
- **Animations**: 
  - Floating waste items in background
  - Truck movement along roads
  - Capacity gauge fill
  - Radar ping effect on map
  - QR scan laser animation
- **Responsiveness**: Mobile-first, tested on screens 320px–1920px

---

## 📊 Data Models

### User Wallet
```javascript
{
  citizenId: "C123",
  name: "Rajesh Sharma",
  ward: "Ward 14 - Green Enclave",
  balance: 450, // eco-credits
  rank: "Eco Champion",
  wasteDisposed: 32.5, // kg
  co2Saved: 19.2, // kg
  vouchersClaimed: 3
}
```

### Truck Telemetry
```javascript
{
  truckId: "DL-04-SW-2024",
  location: { lat, lng },
  speed: 22, // km/h
  capacity: 2.9, // tons / 5.0 max
  eta: 240, // seconds
  currentStop: "Sector 4, Green Market"
}
```

---

## 🔐 Authentication

- **Current**: Demo mode (no backend)
- **Sign In Form**: Mobile/Email + Password
- **Sign Up Form**: Name, Phone, Ward, Password + Pledge
- **Future**: OAuth2 with Aadhaar/Government ID

---

## 🌱 Environmental Impact

- **CO₂ Offset Tracking**: Calculates emissions prevented per kg recycled
- **Waste Segregation**: Reduces landfill burden through categorized disposal
- **Gamification**: Eco-credits incentivize responsible waste management
- **Silent Zones**: GPS reduces noise pollution from truck horns

---

## 🔄 Integration Points (Future)

- **Backend API**: REST/GraphQL for truck telemetry & user data
- **Payment Gateway**: Razorpay/PayU for voucher redemption
- **QR Recognition**: Firebase ML Kit or OpenCV
- **Maps**: Google Maps API for real geolocation
- **SMS/Push**: Firebase Cloud Messaging for notifications
- **Database**: PostgreSQL for citizen accounts & transactions

---

## 🐛 Known Limitations

- **Simulation-based**: Truck positions are hardcoded, not live
- **No persistence**: Wallet data resets on page refresh
- **Webcam access**: QR scanning uses simulated camera stream
- **Offline**: Requires internet only for initial font load

---

## 📝 License

Open-source project for Swachh Bharat Mission. Government of India Initiative.

---

## 👨‍💻 Contributors

- **Created by**: rockd9087-cyber
- **Repository**: https://github.com/rockd9087-cyber/Waste-Management-2

---

## 📧 Support & Feedback

For issues, suggestions, or collaboration:
- Open an issue on GitHub
- Email: [contact details]
- Join Swachh Bharat Discord community

---

**Built with ♻️ for a cleaner India!**
