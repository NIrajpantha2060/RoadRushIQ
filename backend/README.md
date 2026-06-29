# RoadRushIQ Backend

Simple Node.js + Express backend for RoadRushIQ.

Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
2. Install deps:

```bash
cd backend
npm install
```

3. Run migrations (apply `migrations/schema.sql` to your Postgres database):

```bash
psql $DATABASE_URL -f migrations/schema.sql
```

4. Start server in dev:

```bash
npm run dev
```

Endpoints

- `POST /auth/register` { email, password, name }
- `POST /auth/login` { email, password }
- `GET /user/me` (auth)
- `GET /user/progress` (auth)
- `POST /user/progress` (auth) { level, score, data }
- `GET /user/cars` (public)
- `POST /user/cars/purchase` (auth) { car_id }
- `GET /user/purchases` (auth)

Database schema is in `migrations/schema.sql`.
