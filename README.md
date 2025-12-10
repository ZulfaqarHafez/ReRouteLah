# 🗺️ GuideMeSG - Safe Navigation for Everyone

<div align="center">

![ReRouteLah Banner](https://img.shields.io/badge/ReRouteLah-Safe%20Navigation-2DD4BF?style=for-the-badge&logo=map&logoColor=white)

**Empowering Persons with Intellectual Disabilities to navigate Singapore's public transport independently with AR guidance, real-time alerts, and emergency support.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 🌟 Overview

**GuideMeSG** is an accessibility-first navigation application designed specifically for Persons with Intellectual Disabilities (PwID) in Singapore. Built during a hackathon, the app bridges the gap between independence and safety, enabling travelers to navigate public transport confidently while giving caregivers peace of mind through real-time monitoring.

### ✨ Key Features

#### 👤 For Travelers (Persons with Intellectual Disabilities)
- **📍 Simple Destination Selection**: Visual, icon-based interface for selecting saved destinations
- **🎯 AR Navigation**: Real-time augmented reality guidance using device compass and camera
- **🗣️ Voice Instructions**: Step-by-step audio guidance with text-to-speech support
- **🚌 Real-Time Transit Info**: Live bus and MRT arrival times with crowd level indicators
- **🚨 Emergency "I'm Lost" Button**: One-tap access to nearest Dementia Go-To Points
- **📱 Large, Clear UI**: Accessibility-optimized design with high contrast and large buttons

#### 👨‍👩‍👧 For Caregivers
- **🔴 Live Location Tracking**: Real-time GPS monitoring of travelers on an interactive map
- **⚠️ Route Deviation Alerts**: Instant notifications when travelers go off-course
- **📹 Live Camera Feed**: View traveler's AR camera perspective remotely (prototype)
- **📞 Quick Call**: One-tap emergency calling directly from the app
- **🎯 Destination Management**: Remotely add, edit, and manage saved destinations
- **🔗 Multi-Patient Support**: Link and monitor multiple travelers simultaneously

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- React Leaflet (Maps)
- Device Orientation API (AR Compass)

**Backend & Real-Time**
- Supabase (PostgreSQL + Real-time subscriptions)
- NextJS API Routes (Route planning, LTA integration)

**APIs & Services**
- LTA DataMall API (Bus/MRT real-time data)
- OneMap Singapore API (Route planning)
- OSRM (Fallback routing)
- Browser Geolocation & DeviceOrientation APIs

### Database Schema

```sql
-- Caregivers
caregivers (
  id, name, phone, created_at
)

-- Patients (Travelers)
patients (
  id, name, avatar, caregiver_id, pairing_code,
  current_location POINT, is_navigating, is_deviated,
  deviation_distance, last_location_update
)

-- Saved Destinations
saved_destinations (
  id, patient_id, name, address, 
  coordinates POINT, category
)

-- Route Deviations (Audit Log)
route_deviations (
  id, patient_id, deviation_distance,
  location POINT, acknowledged_at, resolved_at
)

-- Caregiver Notifications
caregiver_notifications (
  id, caregiver_id, patient_id,
  notification_type, message, is_read
)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- LTA DataMall API key
- OneMap API token

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/GuideMeSG.git
cd reroutelah
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
LTA_API_KEY=your_lta_api_key
ONEMAP_TOKEN=your_onemap_token
```

4. **Set up Supabase database**
Run the SQL migrations in `supabase/migrations/` to create the required tables.

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🎮 How It Works

### 1️⃣ Onboarding
- **Travelers**: Create account → Get unique 6-digit pairing code → Add destinations
- **Caregivers**: Create account → Enter traveler's pairing code → Linked!

### 2️⃣ Navigation Flow
1. Traveler selects destination from saved places
2. App generates multi-modal route (walking + bus/MRT)
3. Real-time turn-by-turn voice guidance begins
4. Caregiver receives notification of journey start
5. Live location updates every 3 seconds via Supabase real-time

### 3️⃣ Safety Features
- **Deviation Detection**: If traveler goes >50m off-route, caregiver gets instant alert
- **Emergency Mode**: "I'm Lost" button finds nearest Dementia Go-To Point and auto-navigates
- **Real-time Sync**: All location/status updates pushed via Supabase subscriptions

---

## 🎯 Key Technical Highlights

### AR Navigation System
```typescript
// Uses device compass + GPS for real-time arrow rotation
const rotation = (bearing - deviceHeading + 360) % 360;
```

### Route Deviation Algorithm
```typescript
// Haversine distance to detect off-route travelers
const distanceFromRoute = Math.min(
  ...routePoints.map(point => 
    haversineDistance(currentLocation, point)
  )
);
if (distanceFromRoute > THRESHOLD) triggerAlert();
```

### Real-Time Subscriptions
```typescript
// Caregivers receive instant updates when patient status changes
supabase
  .channel('patient-updates')
  .on('postgres_changes', 
    { event: 'UPDATE', table: 'patients' },
    handlePatientUpdate
  )
  .subscribe();
```

---

## 🛠️ API Routes

| Endpoint | Description |
|----------|-------------|
| `/api/multi-modal-route` | Generate walking + MRT + bus routes |
| `/api/lta/bus-arrival` | Real-time bus arrival times |
| `/api/lta/train-arrival` | Estimated MRT arrivals |
| `/api/find-safe-point` | Find nearest Dementia Go-To Point |
| `/api/navigation` | Turn-by-turn walking directions |

---

## 🎨 Design Philosophy

**Accessibility First**
- High contrast color palette (WCAG AAA compliant)
- Large touch targets (minimum 48x48px)
- Clear visual hierarchy with minimal cognitive load
- Icon-based navigation for language independence

**Mobile-Optimized**
- Progressive Web App capabilities
- Offline-ready core features
- Battery-efficient GPS tracking
- Responsive design (mobile-first)

---

## 🤝 Team

<table>
  <tr>
    <td align="center">
      <a href="https://www.linkedin.com/in/olivialam-xe/">
        <img src="https://github.com/user-attachments/assets/55e3ef28-fa9e-4d6a-a49c-17ba10f19eb2" width="100px;" alt="Olivia Lam"/><br />
        <sub><b>Olivia Lam</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://www.linkedin.com/in/tayweilin/">
        <img src="https://github.com/user-attachments/assets/a0e14ee2-ef7b-4d2d-9a44-1d80b56e9ad7" width="100px;" alt="Tay Wei Lin"/><br />
        <sub><b>Tay Wei Lin</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://www.linkedin.com/in/genisa-lee-98a847260/">
        <img src="https://github.com/user-attachments/assets/97fc89f5-2ec7-4eb5-878f-a86e8fa6bcbb" width="100px;" alt="Genisa Lee"/><br />
        <sub><b>Genisa Lee</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://www.linkedin.com/in/tan-chun-yuan/">
        <img src="https://github.com/user-attachments/assets/a43efa76-f1dc-44cf-8e7f-ab80f85e29df" width="100px;" alt="Tan Chun Yuan"/><br />
        <sub><b>Tan Chun Yuan</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://www.linkedin.com/in/zulfaqar-hafez/">
        <img src="https://github.com/user-attachments/assets/a19bdc62-d7d3-4f77-a024-a1a5ceb78bfa" width="100px;" alt="Zulfaqar Hafez"/><br />
        <sub><b>Zulfaqar Hafez</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## 🏆 Hackathon Recognition

Built during **HackRift** with a mission to make Singapore's public transport accessible to everyone.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Land Transport Authority (LTA)** for providing real-time transit data
- **Singapore Land Authority** for OneMap API
- **Dementia Singapore** for Go-To Point locations
- **Anthropic's Claude** for code assistance and pair programming
- **Open Source Community** for the amazing libraries and tools

---

## 📞 Contact & Support

For questions, feedback, or collaboration opportunities, reach out to the team via LinkedIn above.

---

<div align="center">

**Made with ❤️ for a more inclusive Singapore**

</div>
