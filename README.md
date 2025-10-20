# Payment Checkout - Monorepo

This repository contains a Backend API (NestJS) and a Mobile App (React Native + Expo) implementing a 7-step credit card checkout integrating with Wompi Sandbox.

## Structure

```
.
├── backend/   # NestJS + TypeORM + Jest
└── mobile/    # React Native (Expo) + Redux Toolkit + Jest
```

## Prerequisites

- Node.js LTS (18/20)
- Docker (optional but recommended for backend)
- Android Studio / Xcode for running the mobile app

## Backend (NestJS)

See `backend/README.md` for full details.

Quick start with Docker Compose (from repo root):

```bash
cp backend/env.sample backend/.env
docker compose up -d
# Run DB migrations
docker compose exec backend npm run migration:run
```

API available at `http://localhost:3000`.

## Mobile (Expo)

See `mobile/README.md` for full details.

Quick start:

```bash
cd mobile
npm install
# Optional: set an API URL reachable by device/emulator
# echo EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000 > .env
npm run start
```

## Testing

- Backend (inside `backend/`):

```bash
npm test
npm run test:cov
```

- Mobile (inside `mobile/`):

```bash
npm test
npm run test:cov
```

## Environment Variables

- Backend: copy `backend/env.sample` to `.env` and adjust DB + Wompi Sandbox keys.
- Mobile: set `EXPO_PUBLIC_API_URL` (public) to point to backend from your device/emulator.

## License

MIT
