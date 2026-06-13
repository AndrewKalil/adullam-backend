# Adullam Backend

REST API for the Adullam multi-tenant platform — retail and restaurant businesses managing products, categories, and promotions.

**Stack:** Node.js · Express · TypeScript · Drizzle ORM · Supabase (Postgres + Auth + Storage)

---

## Prerequisites

- [Node.js](https://nodejs.org) v20.6 or higher
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (required by Supabase CLI)
- [Supabase CLI](https://supabase.com/docs/guides/cli) — install globally:
  ```bash
  npm install -g supabase
  ```

---

## Setup

### 1. Clone the repository

```bash
git clone git@github.com:AndrewKalil/adullam-backend.git
cd adullam-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the local Supabase stack

```bash
supabase start
```

This boots a local Postgres database, Auth server, and Storage instance via Docker. The first run pulls images and takes a few minutes.

When it finishes, it prints your local credentials:

```
API URL:          http://127.0.0.1:54321
DB URL:           postgresql://postgres:postgres@127.0.0.1:54322/postgres
Publishable key:  sb_publishable_...
Secret key:       sb_secret_...
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the values printed by `supabase start`:

```env
PORT=8000
NODE_ENV=development

SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<Publishable key>
SUPABASE_SERVICE_ROLE_KEY=<Secret key>
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

STORAGE_BUCKET=adullam-media
```

### 5. Push the database schema

```bash
npm run db:push
```

### 6. Apply triggers and RLS policies

```bash
npm run db:sql
```

### 7. Seed the database

```bash
npm run db:seed
```

This creates two tenants with sample categories, products, and promotions. Credentials are printed at the end.

---

## Running in development

```bash
npm run dev
```

The server starts on `http://localhost:8000` and restarts automatically on file changes.

Verify it is running:

```bash
curl http://localhost:8000/health
# {"status":"ok"}
```

---

## Other scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with file watching |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build |
| `npm run typecheck` | Type-check without emitting files |
| `npm run db:push` | Push Drizzle schema to local database |
| `npm run db:sql` | Apply SQL triggers and RLS policies |
| `npm run db:seed` | Seed the database with sample data |

---

## Local Supabase commands

```bash
supabase start     # start local stack
supabase stop      # stop local stack
supabase status    # show URLs and keys
```

Studio (database UI) is available at `http://localhost:54323` while the stack is running.
