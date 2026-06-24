# DMA Web App

React + TypeScript web app built with Vite for DMA Technologies ecosystems: **More Fish**, **Pharma Care**, **Cattle Care**, and **Poultry Care**.

## Requirements

- Node.js installed
- npm installed

Check versions:

```bash
node -v
npm -v
```

## Install Dependencies

Run this once after cloning/downloading the project:

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in Firebase values for push notifications:

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_*` | Firebase Cloud Messaging (FCM) for real-time alerts (`morefish-2026` project) |
| `VITE_FIREBASE_VAPID_KEY` | Web Push certificate from Firebase Console → Cloud Messaging |
| `VITE_API_URL` | Backend API base URL (empty = Vite dev proxy to `66.29.151.40:8004`) |

`public/firebase-messaging-sw.js` is auto-synced from `.env` when you run `npm run dev` or `npm run build`.

## Run Development Server

From the project folder:

```bash
npm run dev
```

Then open the local URL shown in the terminal. Usually:

```text
http://localhost:5173/
```

## Build For Production

```bash
npm run build
```

Production files are created in the `dist` folder.

## Preview Production Build

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

Note: lint may report strict TypeScript/React rule issues even when the app builds successfully.

## Windows Terminal Note

This project sets the Cursor/VS Code default terminal to **Command Prompt** (`.vscode/settings.json`) so `npm run dev` works without PowerShell script restrictions.

If you use an external PowerShell window and see `npm.ps1 cannot be loaded`, run once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## Project Architecture — Feature → File Map

This section maps each product feature to the UI, logic, and backend layers so you can trace code quickly.

### App shell & routing

| Layer | File | Role |
|-------|------|------|
| Entry | `src/main.tsx` | React root mount |
| App router | `src/App.tsx` | Ecosystem routing (fish/pharma/cattle/poultry), page rendering, auth gates |
| Navigation types | `src/types/navigation.ts` | `Page`, `Ecosystem`, auth/ecosystem helpers |
| Aquaculture types | `src/types/aquaculture.ts` | `AquacultureFlow` (`fish` \| `pharma`), `AuthFlow` |
| Sidebar | `src/components/Sidebar.tsx` | Full More Fish / Pharma Care menu, ecosystem switcher, logos, notification badge |
| Header | `src/components/Header.tsx` | Clock, weather widget (OpenWeather + device data), language toggle, ecosystem logo |
| Styles | `src/index.css` | Global Tailwind / theme variables |

### Authentication & user session

| Feature | UI | Logic | Backend API |
|---------|-----|-------|-------------|
| Login / Register / Forgot password | `src/components/Auth.tsx` | `src/context/AuthContext.tsx` | `src/services/api.ts` → `/auth/login/`, `/auth/registration/`, `/auth/user/forgot/password/`, OTP, reset |
| Profile | `src/App.tsx` (profile view) | `AuthContext.loadProfile()` | `GET /auth/user/details/{userId}` |
| Change password | `src/components/Settings.tsx` | `api.changePassword()` | `POST /auth/user/password/change/` |
| More Fish token | — | `localStorage` key `more_fish_token` | Bearer on `/devices/*`, `/product/*` |
| Pharma Care token | — | `localStorage` key `pharma_token` | Same APIs as More Fish, separate session |
| Cattle / Poultry tokens | — | `cattle_token`, `poultry_token` | `/cattle_care/*`, `/poultry_care/*` |

### More Fish & Pharma Care (shared aquaculture stack)

Pharma Care uses the **same API and components** as More Fish with `flow="pharma"`, pharma auth token, and UI labels (Pond → Asset). Logo: `src/assets/dma_pharmaceutical.png`.

| Sidebar feature | UI component | Logic / state | Backend API (`api.ts`) |
|-----------------|--------------|---------------|------------------------|
| Home / Dashboard | `src/components/Dashboard.tsx` | Banner carousel (bilingual IoT promotions, emergency alerts), feature grid, emergency shortcuts | — |
| Live Data Monitoring | `src/components/IoTMonitoring.tsx` | Pond/asset list, live sensors, graphs (Recharts), aerator controls | `GET /devices/data/pond/list`, `GET /devices/data/pond/data`, `GET /devices/sensor/list`, `GET /devices/data/graph`, `POST /devices/aerators/command/` |
| Fish Disease Detector | `src/components/DiseaseDetector.tsx` | Image upload, AI scan tab, disease diagnostics | `POST /devices/fish-disease/detect/` |
| Pond / Asset Management | `src/components/FarmManagement.tsx` | Water quality parameters dashboard, selection criteria, preparation guides, farming cycle steps | — (informational UI, data: `src/data/farmManagementData.ts`) |
| Feed Management | `src/components/FeedManagement.tsx` | Feed selection guidelines, types, and daily body weight calculator | — |
| Fish Disease Treatment | `src/components/DiseaseDetector.tsx` (`defaultTab="guide"`) | Fish pathogen catalog & treatments list | — (data: `src/data/guides.ts`) |
| Live Consultancy | `src/components/LiveConsultancy.tsx` | Expert panel profiles, hotline call, WhatsApp link, premium video consultations | — |
| Fish Farm Marketplace | `src/components/Marketplace.tsx` | Equipment categories, company logos grid, product lists, specifications | `/product/*` (endpoints detailed in universal marketplace logic) |
| Fingerlings Marketplace | `src/components/Marketplace.tsx` | Fingerlings suppliers and product catalog | `/product/*` |
| Grown Fish Sell | `src/components/Marketplace.tsx` | Grown fish catalogs and suppliers | `/product/*` |
| Fish Medicine & Enzyme | `src/components/Marketplace.tsx` | Product catalog browser | `GET /product/category/list/`, companies, products, details |
| FCR Calculator | `src/components/FCRCalculator.tsx` | FCR + feed requirement calculator | `POST /devices/fcr/calculate/` |
| Nano Bubble Aeration | `src/components/NanoBubble.tsx` | High-precision aeration dashboard: DO sensor data, individual switch overrides | `GET /devices/data/pond/data` |
| Fish Feed Marketplace | `src/components/Marketplace.tsx` | Same catalog UI | `/product/*` |
| Training & Workshop | `src/components/Training.tsx` | Training content UI | — |
| Auto Aerator Connection | `src/components/AutoAerator.tsx` | Hardware status monitoring ("Online", "Offline"), safety overrides check, manual starts/stops | `GET /devices/data/pond/data`, `POST /devices/aerators/command/`, auto mode check |
| Auto Feeder Connection | `src/components/AutoFeeder.tsx` | Hardware checklist, manual feed release triggers, scheduled release timers, fallback empty-state handling | — (simulated controls + local storage timers) |
| Weather Forecast | `src/components/WeatherForecast.tsx` | 5-day OpenWeather forecast | `api.getWeatherForecast()` → OpenWeather API |
| Smart Khamari | `src/components/SmartKhamari.tsx` | Premium members cooperative club benefits, grouping structures, Silver/Gold/Platinum tiers | — |
| Emergency Service | `src/components/EmergencyService.tsx` | Call / WhatsApp actions | — |
| Fish Pond Filtration | `src/components/FiltrationSystem.tsx` | Biofilter telemetry (Ammonia NH3, Nitrite, pH), filter pump switches, RAS construction guide modal | — |
| Automation Settings | `src/components/Automation.tsx` | Aerator auto DO thresholds, auto-cleaner | `/devices/aerator-automation/`, `/devices/cleaner/status/` |
| Notifications (inbox) | `src/components/NotificationList.tsx` | History list, refresh | `GET /notification/all/list/{userId}/` |
| Profile | `App.tsx` + `Auth.tsx` | Session profile card | `/auth/user/details/{id}` |
| FAQ | `src/components/InfoPage.tsx` | Static FAQ content | — |
| About App | `InfoPage.tsx` | App overview | — |
| About Device | `InfoPage.tsx` | Sensor device info | — |
| Weather header (not in sidebar) | `Header.tsx` | Live weather card, `"MoreFish - আরো মাছ"` name title, notification bell action | Device weather + `api.getWeather()` |

### Push notifications (FCM)

| Layer | File | Role |
|-------|------|------|
| Firebase config | `src/config/firebase.ts` | Initialize Firebase app & messaging |
| FCM logic | `src/services/notifications.ts` | Token registration, foreground listener, sector filter (fish/pharma/cattle/poultry) |
| UI toast + unread badge | `src/context/NotificationContext.tsx` | Foreground snackbar, unread counter, sync token on login |
| Background SW | `public/firebase-messaging-sw.js` | Native OS notifications when app is in background |
| Token sync API | `api.updateFcmToken()` | `POST /auth/user/fcm/token/update/` body `{ fcm_token }` |

**Security:** Foreground messages are only shown if the user is logged into the matching sector (`type` in FCM data: `cattle`, `poultry`, `pharma`, default → More Fish).

### Cattle Care

| Feature | UI | Backend |
|---------|-----|---------|
| Dashboard / IoT / Automation | `src/components/CattleCare.tsx` | `/cattle_care/farms/*`, switches, automation |

### Poultry Care

| Feature | UI | Backend |
|---------|-----|---------|
| Dashboard / IoT / Automation | `src/components/PoultryCare.tsx` | `/poultry_care/farms/*`, switches, automation |

### Internationalization

| File | Role |
|------|------|
| `src/context/LanguageContext.tsx` | English / Bangla strings (`enUS`, `bnBD`), `t()` helper |
| `STORAGE_KEYS.LANG` | Persists language choice |

### API & networking

| File | Role |
|------|------|
| `src/services/api.ts` | All REST calls, token storage keys, response normalization (graphs, ponds, products) |
| `vite.config.ts` | Dev proxy: `/auth`, `/devices`, `/cattle_care`, `/poultry_care`, `/product`, `/notification` → backend |

### Static assets

| Asset | Used for |
|-------|----------|
| `src/assets/DMA Logo.png` | Sidebar brand (default) |
| `src/assets/dma_more_fish.png` | More Fish header logo |
| `src/assets/dma_pharmaceutical.png` | Pharma Care sidebar + header logo |
| `public/favicon.svg` | Browser favicon |
| `public/firebase-messaging-sw.js` | FCM service worker |

---

## Netlify Deployment

This project is fully configured for deployment on **Netlify**.

### Deployment Settings
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

### SPA Routing Redirects
We have pre-configured SPA routing support for Netlify. The `public/_redirects` file is copied to the build destination automatically, ensuring that refreshes and direct URL access redirect cleanly to `index.html` with a `200` status:
```text
/* /index.html 200
```

---

## Completed Features Summary

1. **Backend Integration**: Real-time sensor API data integration (Oxygen, pH, Temp, Ammonia, Salinity) with Recharts telemetry visualizations.
2. **Flexible View Modes**: 
   - **Default View**: Displaying individual active profile data.
   - **Multiple View**: Interactive loop display grouping connected accounts dynamically (perfect for multi-farm telemetry monitoring).
3. **Weather Syncing**: Header weather forecast synced either globally to active profiles (Default view) or manually switchable per-profile (Multiple view).
4. **Splash Screen**: Interactive, premium startup screen featuring a big animated DMA Logo, slogan, and simulated loading progress.
5. **Modern Theme Color**: Standardized elements and custom gradients to use the vibrant `#00A8D5` brand theme.

---

## Useful Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```
