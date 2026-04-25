# Dating app monorepo (India)

Expo React Native client + NestJS API with **phone OTP (MSG91 in production, dev fallback in logs)**, **JWT access tokens**, **rotating refresh tokens**, and **PostgreSQL** via Prisma.

## Prerequisites

- Node.js 20+ (recommended LTS)
- Docker Desktop (for PostgreSQL), or your own Postgres with a matching `DATABASE_URL`
- For physical devices: your computer and phone on the same Wi‑Fi (you will use your LAN IP in `EXPO_PUBLIC_API_URL`)

## 1) Database (PostgreSQL)

From the **repository root**:

```bash
docker compose up -d
```

Wait until Postgres is healthy, then apply migrations:

```bash
cd services/api
cp .env.example .env
# Edit .env: set JWT_SECRET to a long random string (e.g. openssl rand -base64 32)
npx prisma migrate deploy
```

`DATABASE_URL` in `services/api/.env` must match `docker-compose.yml` (user `spark`, password `spark`, database `spark`, host port **`5432`**). Prefer `127.0.0.1` instead of `localhost` if you see Prisma **P1000** (see troubleshooting below).

### Database troubleshooting (Prisma P1000 / “Authentication failed”)

1. **Start Docker Postgres** (from repo root): `docker compose up -d` then `docker compose ps` — `postgres` should be running.
2. **Port 5432 already in use:** From repo root run `docker compose down`. Find what holds the port: `lsof -i :5432` (macOS) or `docker ps` (look for `0.0.0.0:5432`). Stop that process or `docker stop <id>`, then `docker compose up -d` again. Alternatively map **`5433:5432`** in `docker-compose.yml` and use **`127.0.0.1:5433`** in `DATABASE_URL`.
3. **Wrong password from an old volume:** If you ever changed Postgres env vars, reset the volume (**deletes DB data**):  
   `docker compose down -v` then `docker compose up -d` then `npx prisma migrate deploy`.
4. **API must stay running:** Until `npm run start:dev` shows **no crash** after “Nest application successfully started”, the app will show **network connection failed** — fix the DB first.

## 2) API

```bash
cd services/api
npm install
npm run start:dev
```

Check: [http://127.0.0.1:3000/v1/health](http://127.0.0.1:3000/v1/health)

**OTP in development:** when you tap “Send OTP”, the API logs a line like `[dev] OTP for +91XXXXXXXXXX: 123456` in the terminal running `start:dev`. Enter that 6-digit code in the app.
  
**OTP in production:** configure MSG91 env vars (`MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`) so users receive real OTP SMS.

## 3) Mobile app (Expo)

```bash
cd apps/mobile
cp .env.example .env
```

Set `EXPO_PUBLIC_API_URL` to wherever the API is reachable **from the device**:

| Where you run the app | Typical `EXPO_PUBLIC_API_URL` |
|----------------------|-------------------------------|
| iOS Simulator (Mac) | `http://127.0.0.1:3000` |
| Android Emulator | `http://10.0.2.2:3000` (special alias to your host machine) |
| Physical phone (same Wi‑Fi) | `http://<your-computer-LAN-IP>:3000` (e.g. `http://192.168.1.42:3000`) |

Then:

```bash
npm install
npm run start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go on a device (use the LAN URL in `.env` for real devices).

### Let a co-founder test from another device

If your co-founder is on the **same Wi-Fi**, this is enough:

1. In `apps/mobile/.env`, set:
   - `EXPO_PUBLIC_API_URL=http://<your-laptop-LAN-IP>:3000`
2. Start API from `services/api`: `npm run start:dev`
3. Start Expo from `apps/mobile`: `npx expo start --host lan`
4. Co-founder scans the Expo QR in Expo Go.

If your co-founder is on a **different network**, tunnel both app bundle + API:

1. Start API locally: `cd services/api && npm run start:dev`
2. Expose API with a tunnel (example via ngrok):
   - `ngrok http 3000`
   - copy HTTPS URL, e.g. `https://abc123.ngrok-free.app`
3. Set `apps/mobile/.env`:
   - `EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app`
4. Start Expo tunnel:
   - `cd apps/mobile && npx expo start --tunnel`
5. Share the Expo QR/link with your co-founder.

## 4) Auth flow (what to try)

1. Open the app → **Continue with phone** → enter a valid 10-digit Indian mobile (starts with 6–9).
2. Tap **Send OTP** → read the OTP from the **API terminal** (dev mode).
3. Enter the 6-digit code → you should land on **Discover** with a real JWT session stored in the secure keychain.

Sign out from **Profile** revokes the refresh token on the server and clears local tokens.

## Security

See `SECURITY.md`. Use strong `JWT_SECRET`, HTTPS in production, and a real SMS provider for OTP before public launch.

## Remote testing without your laptop running

To let your co-founder use the app when your laptop is off, you need:

1. API deployed to cloud (this repo includes `render.yaml` for Render).
2. Cloud PostgreSQL (Neon/Supabase/Render Postgres/Railway Postgres).
3. Mobile app distributed as a real installable build via EAS (not Expo dev server).

### A) Deploy API to Render

1. Push this repo to GitHub.
2. In Render, create a new Blueprint/Web Service from this repo.
3. Render will read `render.yaml` and create `spark-api`.
4. Set required env vars in Render:
   - `DATABASE_URL` (cloud Postgres URL)
   - `JWT_SECRET` (long random string)
   - `MSG91_AUTH_KEY` (from MSG91 dashboard)
   - `MSG91_TEMPLATE_ID` (approved OTP template ID in MSG91)
5. Deploy and verify:
   - `https://<your-render-domain>/v1/health`

### B) Build installable app for co-founder (EAS)

From `apps/mobile`:

```bash
npm install
npx eas login
npx eas build:configure
```

Set production API URL for EAS build:

```bash
npx eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://<your-render-domain>
npx eas secret:create --scope project --name EXPO_PUBLIC_APP_ENV --value production
```

Build APK (Android internal testing):

```bash
npx eas build --platform android --profile preview
```

Share the generated install link with your co-founder.

### Will this cost money?

- **Can start at near-zero cost** on free tiers (Render/Neon/EAS have starter/free options).
- **Possible charges** can start once usage grows or if free limits are exceeded:
  - API host sleeps or has quotas on free plans.
  - Managed Postgres free tier has storage/compute limits.
  - EAS free usage has limited build minutes/concurrency.

For Phase 1 testing, free tiers are usually enough. Upgrade later when traffic increases.

## Project layout

- `apps/mobile` — Expo app
- `services/api` — NestJS API (`/v1/*`)
- `docker-compose.yml` — local Postgres
