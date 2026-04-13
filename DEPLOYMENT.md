# Deployment Guide

## 1) Deploy backend (Render)

1. Open Render and create a new **Web Service** from this repository.
2. Use `render.yaml` (Blueprint deploy) or configure manually:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
   - Start command: `gunicorn rentspace.wsgi:application`
3. Set environment variables:
   - `DJANGO_SECRET_KEY`
   - `DJANGO_DEBUG=False`
   - `DJANGO_ALLOWED_HOSTS=<your-render-domain>`
   - `CORS_ALLOWED_ORIGINS=<your-frontend-domain>`
   - `CSRF_TRUSTED_ORIGINS=<your-frontend-domain>`

## 2) Deploy frontend (Vercel)

1. Import repository in Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**.
4. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-render-domain>`
5. Deploy.

`frontend/vercel.json` already contains SPA rewrite rules for React Router.

## 3) Final check

1. Open deployed frontend URL.
2. Verify:
   - catalog list loads;
   - auth/login works;
   - profile, rentals, favorites, notifications and messaging open correctly.
