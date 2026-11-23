# Enerfab Time Clock

Kiosk web app for the clock-in device (React + TypeScript + Vite).

## Run

```sh
npm install
npm run dev       # http://localhost:5173 (also exposed on the LAN)
npm run build     # production build in dist/
```

## Screens

- **Home** – company name and gate name (top center), day, live time (updates every second), and date.
  Always listening for a badge/barcode scan; each scan records a punch and shows a "Scan successful"
  banner at the top for 4 s (or a red error banner).
- **Manual Entry** (top right) – popover with an Employee ID field and on-screen keypad.
- **Settings** (gear, bottom left)
  - If no administrators are set up, Settings opens directly.
  - Otherwise an administrator badge must be scanned; other badges are denied.
  - Settings: company name, gate name, theme (Orange / Green, previewed live), and the administrator list.

Overlays return to the home screen after inactivity (60 s; 3 min on the Settings page, discarding unsaved changes).

## Device settings

Settings are stored on the device in `localStorage` (key `enerfab.clock.settings.v1`), so each clock keeps
its own company/gate/theme/administrators across restarts. Clearing browser data resets them.

## Badge scanning

Scanning expects a keyboard-wedge reader: it types the code followed by Enter (or Tab). No field needs focus.
To test without a reader, type a number on the keyboard and press Enter.

## Backend

Set `VITE_API_BASE_URL` (see `.env.example`) to send punches to a real API:

| Call | Endpoint |
| --- | --- |
| Scan / manual entry | `POST {base}/punches` with `{ "employeeId", "source": "scan" \| "manual" }` (any 2xx = success) |

Without it, punches are accepted locally (demo mode).
