# Security posture (living document)

This repository is intended for a public dating product. Treat every checklist item as required before scaling users or handling sensitive data.

## Secrets and configuration

- Never commit API keys, Razorpay secrets, JWT signing keys, or database URLs. Use environment variables and a secrets manager in production.
- Mobile: only `EXPO_PUBLIC_*` variables ship to the client. Never put private keys in the app bundle.
- Rotate credentials immediately if they are exposed.

## Transport and storage

- Production APIs must use HTTPS only. The mobile client enforces HTTPS for API calls when `EXPO_PUBLIC_APP_ENV=production`.
- Store refresh tokens and access tokens in `expo-secure-store` (Keychain / Keystore), not AsyncStorage.
- Plan for certificate pinning for high-risk flows after MVP (documented follow-up).

## Authentication (current + next)

- **Implemented:** OTP challenge stored hashed (bcrypt), rate limits on auth routes, JWT access tokens (15m), opaque refresh tokens (SHA-256 lookup, rotated on refresh), logout revokes refresh. In development, OTP is logged server-side only—never in production.
- **Before production:** integrate an SMS provider (India), remove dev OTP logging, strengthen JWT and refresh token policies, and add device binding / takeover monitoring.

## Backend hardening (implemented baseline + next steps)

- Baseline: Helmet, global validation pipe (whitelist), throttling, strict CORS in production.
- Next: structured logging without PII, request IDs, WAF in front of API, dependency scanning in CI.

## Privacy (India)

- Align data processing with applicable law (including DPDP). Provide in-app consent, data export, and account deletion paths before public launch.
- Minimize data collection; encrypt PII at rest; restrict internal access.

## Abuse and safety

- Content moderation for photos and bios before they go live.
- Rate limits on messaging, reporting, and signup.
- Human review queue for high-severity reports.

## Payments (Razorpay)

- Verify webhook signatures on every event. Make payment state transitions idempotent.
- Never trust client-side payment success alone.

## Operational

- Security updates for dependencies monthly.
- Incident response runbook: who gets paged, how users are notified, regulatory timelines if required.
