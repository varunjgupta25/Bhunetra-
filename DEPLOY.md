# Deploying Bhunetra

One Docker container serves the FastAPI API and the built React SPA on a single port.
Works on Render, Railway, or any VPS with Docker.

## Requirements

- **Minimum 4 GB RAM.** PyTorch and EasyOCR (Marathi/Hindi/English models) are loaded in-process; smaller instances get OOM-killed on the first OCR request.
- Several GB of disk for the image (CPU-only PyTorch, with the EasyOCR weights baked in at build time).
- A persistent disk for uploaded documents (see below).

## Build and run

```bash
# Build (from the repo root). Firebase *web* config is public and baked into the SPA.
docker build -t bhunetra \
  --build-arg VITE_FIREBASE_API_KEY=... \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com \
  --build-arg VITE_FIREBASE_PROJECT_ID=<project> \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=<project>.appspot.com \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=... \
  --build-arg VITE_FIREBASE_APP_ID=... \
  .

# Run
docker run -d --name bhunetra -p 8000:8000 \
  --env-file backend/.env \
  -v /srv/bhunetra/uploads:/app/backend/uploads \
  -v /srv/bhunetra/firebase-adminsdk.json:/etc/secrets/firebase-adminsdk.json:ro \
  bhunetra
```

The container runs `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}` from `backend/`, without reload.
Health check path: `GET /api/health`.

On **Render/Railway**, point the service at the repo's `Dockerfile`. Set the variables below in the dashboard. Both platforms pass service variables to the declared `VITE_*` build args.

## Environment variables

Runtime (see `backend/.env.example` for the full annotated list):

| Variable | Production value | Notes |
|---|---|---|
| `ENVIRONMENT` | `production` | Default in the image. Disables the dev auth bypass unconditionally. |
| `DEBUG` | `False` | Default in the image. Hides exception details in 500 responses. |
| `ALLOW_DEV_AUTH_BYPASS` | `False` | Default. Ignored when `ENVIRONMENT=production`. |
| `CORS_ORIGINS` | `https://your-domain` | Comma-separated. The SPA is same-origin, so only your public URL is needed. |
| `FIREBASE_CREDENTIALS_PATH` | `/etc/secrets/firebase-adminsdk.json` | Path to the mounted secret file. |
| `FIREBASE_STORAGE_BUCKET` | `<project>.appspot.com` | |
| `REQUIRE_FIREBASE` | `true` (recommended) | Without it, missing credentials only log a loud warning and the app runs on an in-memory mock Firestore that loses all data on restart. |
| `PORT` | set by the platform | Defaults to `8000`. |
| `GROQ_API_KEY`, `BHASHINI_*`, `GOOGLE_VISION_API_KEY` | optional | Cloud OCR/LLM integrations. |

Build-time (frontend): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`. Leave `VITE_API_BASE_URL` empty so the SPA calls the API on its own origin.

## Firebase service account (secret file)

The Firebase Admin service-account JSON **must be added as a secret file**. Never commit it or bake it into the image; `.dockerignore` excludes it.

- Render: *Environment → Secret Files* → filename `firebase-adminsdk.json`. It is mounted at `/etc/secrets/firebase-adminsdk.json`.
- VPS: bind-mount it read-only, as in the `docker run` example above.

## Persistent storage

Uploaded documents are written to `/app/backend/uploads`. Mount a persistent disk/volume at that path; without one, uploads are lost on every redeploy.

The optional 1M-record `mahabhulekh_1million.db` is not in git or in the image. Without it, the built-in synthetic dataset is used. To use it, mount the file at `/app/backend/app/data/mahabhulekh_1million.db`.

## Notes

- Uvicorn runs with `--proxy-headers --forwarded-allow-ips='*'`, so rate limiting (120 req/min per IP) sees real client IPs behind the Render/Railway proxy. On a VPS without a reverse proxy, clients could spoof `X-Forwarded-For`. Put nginx/Caddy in front, or narrow `--forwarded-allow-ips`.
- Local development is unchanged: `start.bat` (single port 8000) or `npm run dev` in `frontend/` (Vite proxies `/api` to `localhost:8000`). For mock logins locally, set `ENVIRONMENT=development` and `ALLOW_DEV_AUTH_BYPASS=True` in `backend/.env`.
