# Dating app monorepo (India)

Expo React Native client + NestJS API with **phone OTP (dev: code in server logs)**, **JWT access tokens**, **rotating refresh tokens**, and **PostgreSQL** via Prisma.

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

## 4) Auth flow (what to try)

1. Open the app → **Continue with phone** → enter a valid 10-digit Indian mobile (starts with 6–9).
2. Tap **Send OTP** → read the OTP from the **API terminal** (dev mode).
3. Enter the 6-digit code → you should land on **Discover** with a real JWT session stored in the secure keychain.

Sign out from **Profile** revokes the refresh token on the server and clears local tokens.

## Security

See `SECURITY.md`. Use strong `JWT_SECRET`, HTTPS in production, and a real SMS provider for OTP before public launch.

## Project layout

- `apps/mobile` — Expo app
- `services/api` — NestJS API (`/v1/*`)
- `docker-compose.yml` — local Postgres
