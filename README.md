# DMA Web App

React + TypeScript web app built with **Vite** for DMA Technologies smart farming ecosystems:
**More Fish**, **Pharma Care**, **Cattle Care**, and **Poultry Care** — all in one unified platform.

---

## Requirements

- Node.js 18+
- npm 9+

Check versions:

```bash
node -v
npm -v
```

---

## Install Dependencies

Run once after cloning/downloading the project:

```bash
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in Firebase values for push notifications:

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_*` | Firebase Cloud Messaging (FCM) for real-time alerts (`morefish-2026` project) |
| `VITE_FIREBASE_VAPID_KEY` | Web Push certificate from Firebase Console → Cloud Messaging |
| `VITE_API_URL` | Backend API base URL (empty = Vite dev proxy to `66.29.151.40:8004`) |

`public/firebase-messaging-sw.js` is auto-synced from `.env` on every `npm run dev` or `npm run build`.

---

## Run Development Server

```bash
npm run dev
```

Open: `http://localhost:5173/`

---

## Build For Production

```bash
npm run build
```

Output goes to the `dist/` folder.

## Preview Production Build

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

> Lint may report strict TypeScript/React rule warnings even when the app builds successfully.

---

## Windows Terminal Note

This project sets the default terminal to **Command Prompt** (`.vscode/settings.json`) so `npm run dev` works without PowerShell script restrictions.

If you see `npm.ps1 cannot be loaded`, run once in PowerShell:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## Project Architecture — Feature → File Map

### App Shell & Routing

| Layer | File | Role |
|---|---|---|
| Entry | `src/main.tsx` | React root mount |
| App router | `src/App.tsx` | Ecosystem routing (fish/pharma/cattle/poultry), page rendering, auth gates |
| Navigation types | `src/types/navigation.ts` | `Page`, `Ecosystem`, auth/ecosystem helpers |
| Aquaculture types | `src/types/aquaculture.ts` | `AquacultureFlow` (`fish` \| `pharma`), `AuthFlow` |
| Sidebar | `src/components/Sidebar.tsx` | Full menu for all ecosystems, switcher, logos, notification badge |
| Header | `src/components/Header.tsx` | Live clock, weather widget (OpenWeather + device API), language toggle, ecosystem branding |
| Styles | `src/index.css` | Global Tailwind theme variables, custom keyframes |

---

### Authentication & User Session

| Feature | UI | Logic | Backend API |
|---|---|---|---|
| Login / Register / Forgot Password | `src/components/Auth.tsx` | `src/context/AuthContext.tsx` | `POST /auth/login/`, `/auth/registration/`, `/auth/user/forgot/password/`, OTP, reset |
| Profile View | `src/App.tsx` | `AuthContext.loadProfile()` | `GET /auth/user/details/{userId}` |
| Change Password | `src/components/Settings.tsx` | `api.changePassword()` with per-profile token override | `POST /auth/user/password/change/` |
| Multi-Account Sessions | `AuthContext.allProfiles` | `ProfileSession[]` per flow stored in localStorage | N/A |
| Token storage | — | `more_fish_token`, `pharma_token`, `cattle_token`, `poultry_token` | Bearer header on all API calls |

---

### More Fish & Pharma Care (Shared Aquaculture Stack)

Pharma Care uses the **same API and components** as More Fish with `flow="pharma"`, separate auth token, and relabelled UI (Pond → Asset). Logo: `src/assets/dma_pharmaceutical.png`.

| Sidebar Feature | UI Component | Logic / State | Backend API (`api.ts`) |
|---|---|---|---|
| Home / Dashboard | `src/components/Dashboard.tsx` | Bilingual banner carousel, feature grid, emergency shortcuts | — |
| Live Data Monitoring | `src/components/IoTMonitoring.tsx` | Pond/asset list, live sensors, Recharts graphs, aerator controls | `GET /devices/data/pond/list`, `/devices/data/pond/data`, `/devices/sensor/list`, `/devices/data/graph` |
| Fish Disease Detector | `src/components/DiseaseDetector.tsx` | Image upload, AI diagnosis scan | `POST /devices/fish-disease/detect/` |
| Pond / Asset Management | `src/components/FarmManagement.tsx` | Water quality parameters dashboard, preparation guides, farming cycle steps | — |
| Feed Management | `src/components/FeedManagement.tsx` | Feed selection guidelines, daily body weight calculator | — |
| Fish Disease Treatment | `src/components/DiseaseDetector.tsx` | Fish pathogen catalog & treatment guide | — |
| Live Consultancy | `src/components/LiveConsultancy.tsx` | Expert panel, hotline call, WhatsApp link | — |
| Marketplace (Equipment / Fish / Feed / Medicine) | `src/components/Marketplace.tsx` | Product catalog browser, company logos | `GET /product/category/list/`, companies, products, details |
| FCR Calculator | `src/components/FCRCalculator.tsx` | FCR + feed requirement calculator | `POST /devices/fcr/calculate/` |
| Nano Bubble Aeration | `src/components/NanoBubble.tsx` | DO sensor data, individual switch overrides | `GET /devices/data/pond/data` |
| Training & Workshop | `src/components/Training.tsx` | Training content cards | — |
| Auto Aerator | `src/components/AutoAerator.tsx` | Hardware status, safety overrides, manual start/stop | `GET /devices/data/pond/data`, `POST /devices/aerators/command/` |
| Auto Feeder | `src/components/AutoFeeder.tsx` | Manual feed triggers, scheduled timers | — |
| Weather Forecast | `src/components/WeatherForecast.tsx` | 5-day OpenWeather forecast | OpenWeather API |
| Smart Khamari | `src/components/SmartKhamari.tsx` | Cooperative club tiers (Silver/Gold/Platinum) | — |
| Emergency Service | `src/components/EmergencyService.tsx` | Call / WhatsApp shortcuts | — |
| Fish Pond Filtration | `src/components/FiltrationSystem.tsx` | Biofilter telemetry (NH3, Nitrite, pH), pump switches, RAS guide | — |
| Automation Settings | `src/components/Automation.tsx` (`flow="fish"`) | Aerator DO thresholds, auto-cleaner settings | `/devices/aerator-automation/`, `/devices/cleaner/status/` |
| Notifications | `src/components/NotificationList.tsx` | Notification history, per-profile dropdown in multiple view | `GET /notification/all/list/{userId}/` |
| Settings / Change Password | `src/components/Settings.tsx` | Language toggle, per-profile password change | `POST /auth/user/password/change/` |
| FAQ / About App / About Device | `src/components/InfoPage.tsx` | Static bilingual content | — |
| Header Weather | `src/components/Header.tsx` | Live weather card, district name, OpenWeather integration | `api.getWeather()` |

---

### Poultry Care ✅ Fully Implemented

Poultry Care is a **complete, fully featured ecosystem** with its own theme (`#dbcc68` mustard yellow + `#1f6f3c` dark green), live sensor data, automation engine, and dynamic weather header.

#### Screens

| Screen | UI Component | Description | Backend API |
|---|---|---|---|
| Dashboard (Home) | `src/components/PoultryCare.tsx` | Farm selector dropdown, live sensor grid (Temp, Humidity, NH3, CO2, Lux, Fan status), "Coming Soon" placeholders for advanced features | `GET /poultry_care/farms/list/`, `GET /poultry_care/farms/dashboard/?farm_id=` |
| Live Data Monitoring | `src/components/PoultryCare.tsx` (live tab) | Real-time 8-sensor card grid with icons, unit labels, and a "parameters are changeable" disclaimer note | `GET /poultry_care/farms/dashboard/?farm_id=` |
| Automation Settings | `src/components/Automation.tsx` (`flow="poultry"`) | Enable/disable automation toggle, Fan Temp Min/Max sliders, Fogger Humidity threshold, Light Schedules (add/remove time windows), per-farm selector | `GET /poultry_care/automation/?farm_id=`, `POST /poultry_care/automation/update/` |
| Notifications | `src/components/NotificationList.tsx` | Poultry-themed notification history, per-profile account dropdown in multiple-view mode | `GET /poultry_care/notifications/` |
| Settings / Change Password | `src/components/Settings.tsx` | Poultry-accented (mustard/green) profile picker, per-account password change | `POST /auth/user/password/change/` |
| FAQ | `src/components/InfoPage.tsx` | Bilingual FAQ content (Poultry Care themed) | — |
| About App | `src/components/InfoPage.tsx` | Bilingual app overview with Poultry Care branding | — |
| About Device | `src/components/InfoPage.tsx` | Sensor device info (Poultry Care context) | — |
| Coming Soon Screens | `src/components/PoultryCare.tsx` | All unimplemented screens show the Poultry Care logo + bilingual "Coming Soon" message | — |

#### Key Technical Details

| Feature | Detail |
|---|---|
| **Theme** | Mustard yellow `#dbcc68` header background, dark green `#1f6f3c` text accents |
| **Live Sensor Grid** | 8 parameters: Temperature, Humidity, Ammonia (NH3), CO2, Lux, Fan 1, Fan 2, Fogger |
| **Sensor Icons** | Unique icon per sensor (Thermometer, Droplets, Wind, Zap, Sun, Fan, CloudRain) |
| **Disclaimer Note** | Mustard-styled note box: *"The parameters are changeable according to installation of device."* |
| **Automation Engine** | Fan ON/OFF by Temp range, Fogger ON/OFF by Humidity, timed Light Schedules |
| **Header App Bar** | Live clock, date, location, outside air temp, humidity, weather description — fetched from dashboard API weather node |
| **Weather Sync** | `poultry:farm-changed` custom event triggers weather re-fetch on farm select; `Header.tsx` subscribes to update in real-time |
| **Multi-Account Dropdown** | Notifications and Settings screens both show a per-profile selector when `viewMode === "multiple"` |
| **Bilingual** | All labels, notes, and messages fully translated to Bengali (`bnBD`) |

#### Automation API

| Action | Endpoint |
|---|---|
| Fetch settings | `GET /poultry_care/automation/?farm_id={id}` |
| Save / Update | `POST /poultry_care/automation/update/` (body: `farm_id`, `is_enabled`, thresholds, `light_schedules[]`) |

#### Dashboard API Weather Mapping

| UI Label | JSON Path |
|---|---|
| Location | `data.weather.weather_district.district` |
| Air Temp | `data.weather.weather_temperature` |
| Humidity | `data.weather.weather_humidity` |
| Description | `data.weather.weather_description` |
| Sunlight | `data.weather.sunlight_level` |

---

### Cattle Care

| Feature | UI | Backend |
|---|---|---|
| Dashboard / IoT / Automation | `src/components/CattleCare.tsx` | `/cattle_care/farms/*`, switches, automation |

---

### Push Notifications (FCM)

| Layer | File | Role |
|---|---|---|
| Firebase config | `src/config/firebase.ts` | Initialize Firebase app & messaging |
| FCM logic | `src/services/notifications.ts` | Token registration, foreground listener, sector filter (fish/pharma/cattle/poultry) |
| UI toast + unread badge | `src/context/NotificationContext.tsx` | Foreground snackbar, unread counter, FCM token sync on login |
| Background SW | `public/firebase-messaging-sw.js` | Native OS notifications when app is in background |
| Token sync API | `api.updateFcmToken()` | `POST /auth/user/fcm/token/update/` |

**Security:** Foreground messages are shown only if the user is logged into the matching sector (`type` in FCM data: `cattle`, `poultry`, `pharma`, default → More Fish).

---

### View Modes (Multi-Profile Display)

Managed via `AuthContext.viewMode` and configured from the **View Settings** screen (`src/components/ViewSettings.tsx`).

| Mode | Behaviour |
|---|---|
| **Default** | Shows only the currently active profile's data |
| **Multiple** | All logged-in profiles rendered as stacked vertical cards |
| **Grid** | All logged-in profiles rendered in a compact 2×2 grid |

Multi-view is supported on: Live Data, Automation, Auto Aerator, Auto Feeder, Pond Filtration, Notifications, and Settings screens — for both More Fish and Poultry Care ecosystems.

---

### Internationalization

| File | Role |
|---|---|
| `src/context/LanguageContext.tsx` | English / Bangla strings (`enUS`, `bnBD`), `t()` helper |
| `STORAGE_KEYS.LANG` | Persists language choice to localStorage |

All screens — including Poultry Care, Automation, Notifications, Settings, Splash, Sidebar, and Header — are fully translated to Bangla.

---

### API & Networking

| File | Role |
|---|---|
| `src/services/api.ts` | All REST calls, token storage keys, response normalization. Supports optional `tokenOverride` on `changePassword()` and `getNotifications()` for per-profile multi-account calls |
| `vite.config.ts` | Dev proxy: `/auth`, `/devices`, `/cattle_care`, `/poultry_care`, `/product`, `/notification` → backend `66.29.151.40:8004` |

---

### Static Assets

| Asset | Used for |
|---|---|
| `src/assets/DMA Logo.png` | Sidebar brand (default / splash) |
| `src/assets/dma_more_fish.png` | More Fish header logo |
| `src/assets/dma_pharmaceutical.png` | Pharma Care sidebar + header logo |
| `src/assets/poultry care.png` | Poultry Care header logo + Coming Soon screens |
| `src/assets/cattle care.png` | Cattle Care header logo |
| `public/favicon.svg` | Browser favicon |
| `public/firebase-messaging-sw.js` | FCM background service worker |

---

## Netlify Deployment

This project is fully configured for **Netlify**.

| Setting | Value |
|---|---|
| Build Command | `npm run build` |
| Publish Directory | `dist` |

SPA routing is handled by `public/_redirects`:

```
/* /index.html 200
```

---

## Completed Features Summary

| # | Feature | Status |
|---|---|---|
| 1 | **More Fish** — full aquaculture stack (live data, automation, marketplace, disease AI, FCR, nano bubble, filtration) | ✅ Complete |
| 2 | **Pharma Care** — shared aquaculture stack with pharma branding | ✅ Complete |
| 3 | **Poultry Care** — live sensor grid, automation (Fan/Fogger/Light), weather header, bilingual, multi-account dropdowns | ✅ Complete |
| 4 | **Cattle Care** — dashboard, IoT monitoring, automation | ✅ Complete |
| 5 | **Multi-Account View Modes** — Default / Multiple / Grid with per-profile data isolation | ✅ Complete |
| 6 | **Bilingual (EN/BN)** — full Bangla translation across all screens and all ecosystems | ✅ Complete |
| 7 | **Push Notifications (FCM)** — foreground + background, sector-filtered, unread badge | ✅ Complete |
| 8 | **Weather Header** — live clock, OpenWeather integration, farm-linked weather sync (More Fish + Poultry Care) | ✅ Complete |
| 9 | **Splash Screen** — animated DMA logo, slogan, simulated progress | ✅ Complete |
| 10 | **View Settings** — clean comparison card UI with interactive mode selector | ✅ Complete |

---

## Useful Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```
