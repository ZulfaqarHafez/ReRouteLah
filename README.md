# 🧭 RerouteLah - Navigation Webapp for Persons with Intellectual Disabilities (PWIDs)

A Next.js-based navigation application designed to help Persons with Intellectual Disabilities (PWIDs) navigate Singapore's public transport system safely and independently.

---

## 🎯 Project Vision

RerouteLah provides an accessible, AR-enhanced navigation experience with features specifically designed for users who may need additional support, including:

- **AR Visual Guide** with directional arrows
- **Audible alerts** for boarding/alighting MRT/bus
- **Crowd density alerts** to avoid overwhelming situations
- **Caregiver notifications** when users deviate from route
- **"Lost" button** that guides users to the nearest Dementia Go-To Point (safe location)
- **Real-time monitoring** for caregivers

---

## 🏗️ Project Structure

```
reroutelah/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── find-safe-point/    # Emergency reroute to nearest safe point
│   │   ├── lta/                # LTA DataMall integrations
│   │   │   ├── bus-arrival/    # Real-time bus arrival times
│   │   │   ├── bus-routes/     # Bus route information
│   │   │   ├── bus-services/   # Bus service details
│   │   │   ├── bus-stops/      # Bus stop locations
│   │   │   ├── crowd-density/  # MRT crowd density (real-time)
│   │   │   ├── crowd-forecast/ # Crowd forecasting
│   │   │   ├── facilities/     # Lift/escalator maintenance status
│   │   │   └── train-alerts/   # MRT service alerts
│   │   ├── navigation/         # Turn-by-turn walking directions
│   │   ├── route-planner/      # Bus route planning (A to B)
│   │   └── search/             # Location search (OneMap)
│   ├── components/
│   │   └── MapDisplay.tsx      # Leaflet map component
│   ├── data/
│   │   └── dementiaPoints.js   # 200+ safe locations (MRT stations, NTUC, etc.)
│   ├── page.tsx                # Main AR navigation interface
│   └── test-api/               # API testing page
├── .env.local                  # Environment variables (API keys)
└── package.json
```

---

## 🔑 API Keys Required

Create a `.env.local` file in the root directory:

```env
# LTA DataMall API Key (Get from: https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html)
LTA_API_KEY=your_lta_api_key_here

# OneMap API Token (Get from: https://www.onemap.gov.sg/apidocs/)
ONEMAP_TOKEN=your_onemap_token_here
```

### How to get API keys:

1. **LTA DataMall**: Register at [datamall.lta.gov.sg](https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html) - approval is usually instant
2. **OneMap**: Register at [onemap.gov.sg](https://www.onemap.gov.sg/apidocs/) - tokens expire after 3 days, need to refresh

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 📱 Main Features

### 1. AR Navigation View (`page.tsx`)
The main interface with two view modes:

| Feature | Description |
|---------|-------------|
| **AR Camera Mode** | Shows camera feed with directional arrow overlay |
| **Map Mode** | Shows Leaflet map with route polyline |
| **Search Bar** | OneMap-powered location search |
| **Bus HUD** | Real-time bus arrival + crowd level indicator |
| **Emergency Button** | Red shield button - reroutes to nearest safe point |

### 2. Crowd Level Indicators
Based on LTA's Load codes:
- 🟢 **SEA** (Seats Available) - Green, safe to board
- 🟡 **SDA** (Standing Available) - Orange, manageable
- 🔴 **LSD** (Limited Standing) - Red, vibrates phone, suggests waiting

### 3. Navigation Providers
The app tries multiple routing providers in order:
1. **OneMap** (Best for Singapore, has walkways)
2. **OSRM** (Fallback, global coverage)
3. **Straight Line** (Last resort if both fail)

### 4. Emergency Safe Points
200+ pre-loaded "Dementia Go-To Points" including:
- All MRT stations
- NTUC FairPrice outlets
- Community Clubs
- Bus Interchanges

---

## 🔌 API Endpoints

### Navigation APIs

| Endpoint | Method | Params | Description |
|----------|--------|--------|-------------|
| `/api/navigation` | GET | `startLat, startLng, destLat, destLng` | Get walking directions |
| `/api/search` | GET | `q` (search query) | Search for locations |
| `/api/route-planner` | GET | `startLat, startLng, destLat, destLng` | Find direct bus route |
| `/api/find-safe-point` | GET | `lat, lng` | Find nearest safe point |

### LTA APIs

| Endpoint | Method | Params | Description |
|----------|--------|--------|-------------|
| `/api/lta/bus-arrival` | GET | `code` (bus stop code) | Real-time bus arrivals |
| `/api/lta/bus-stops` | GET | - | List of bus stops |
| `/api/lta/bus-routes` | GET | - | Bus route data |
| `/api/lta/crowd-density` | GET | `line` (e.g., EWL, NSL) | MRT crowd density |
| `/api/lta/train-alerts` | GET | - | MRT service disruptions |
| `/api/lta/facilities` | GET | - | Lift/escalator status |

---

## 🧪 Testing

Visit `/test-api` to test the LTA Bus Arrival API with any bus stop code.

Example bus stop codes to test:
- `83139` - Default test stop
- `46211` - Clementi area
- `17171` - Orchard area

---

## 🐛 Known Issues & TODOs

### Current Issues:
1. **Routing fallback to straight line** - OneMap token may expire (3-day validity), OSRM sometimes rate-limits
   - **Fix**: Add console logging to debug, refresh OneMap token

2. **Bus route planner limited** - Only checks first 500 bus stops from LTA (pagination not implemented)

### Future Enhancements:
- [ ] Caregiver dashboard with live location tracking
- [ ] Voice instructions (Text-to-Speech)
- [ ] Haptic feedback for turns
- [ ] Offline mode with cached routes
- [ ] Multi-language support (Chinese, Malay, Tamil)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **Leaflet** | Interactive maps |
| **OneMap API** | Singapore location search & routing |
| **LTA DataMall** | Real-time bus/MRT data |
| **OSRM** | Fallback routing engine |

---

## 👥 Team Notes

### For Frontend Work:
- Main UI is in `app/page.tsx`
- Map component is in `app/components/MapDisplay.tsx`
- Styling uses inline styles (can migrate to Tailwind)

### For Backend Work:
- All APIs are in `app/api/` folder
- Each folder = one endpoint (Next.js App Router convention)
- LTA APIs need the `AccountKey` header

### For Data Work:
- Safe points list is in `app/data/dementiaPoints.js`
- Can add more locations or categories (hospitals, police stations, etc.)

---

## 📚 Useful Links

- [LTA DataMall Documentation](https://datamall.lta.gov.sg/content/datamall/en/static-data.html)
- [OneMap API Docs](https://www.onemap.gov.sg/apidocs/)
- [OSRM API](http://project-osrm.org/docs/v5.24.0/api/)
- [Leaflet Documentation](https://leafletjs.com/reference.html)

---

## 🏆 Hackathon Context

This project addresses the challenge of helping PWIDs navigate independently using:
1. **Visual simplicity** - Large arrows, clear colors
2. **Sensory alerts** - Vibration for crowded buses
3. **Safety net** - One-tap access to safe locations
4. **Caregiver peace of mind** - Route deviation alerts (planned)

---

*Built with ❤️ for Singapore's inclusive transport future*
