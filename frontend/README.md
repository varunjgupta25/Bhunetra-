# Bhunetra Frontend

Citizen/officer web UI for Bhunetra, built with React + Vite.

## Setup

```bash
cd /absolute/path/to/Bhunetra-/frontend
npm ci
cp .env.example .env
```

## Run

```bash
npm run dev
```

Default dev URL: `http://localhost:5173`

## Build and checks

```bash
npm run lint
npm run build
npm run preview
```

## Environment

Frontend reads Vite-prefixed variables from `.env`:

- `VITE_API_BASE_URL`
- Firebase values (`VITE_FIREBASE_*`)

Never commit real secrets; use `.env.example` as template only.
