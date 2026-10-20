# 🏛️ EARTH MODS (Planetary Oversight & Grievance Directorate)

> **Official Fictional Planetary Government Complaints Department**  
> *A full-stack, production-grade satirical governance portal for filing, reviewing, and adjudicating flaws in the terrestrial operating environment.*

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Notvoidd18/earth-mods)

---

## 1. Overview & Conceptual Model

**EARTH MODS** is an institutional satire simulating an authoritative planetary government department. Visitors across the globe can publicly lodge grievances regarding everyday biological glitches, atmospheric balancing bugs, gravitational quirks, and temporal mechanics. 

While the aesthetic is strictly formal, institutional, and bureaucratic—featuring deep forest green, warm archival parchment, muted gold, case numbers (`EM-2026-XXXXX`), official seals, and docket statuses—the grievances and Directorate decrees are satirical.

### Core Features
- **Public Case Registry**: Browse approved planetary dockets with category filters, status filters, search, and sorting (*Trending*, *Top Endorsed*, *Newest*).
- **Formal Grievance Submission Flow (`/submit`)**: File complaints with title, description, category, and choose between an attributed moniker or *Anonymous Citizen* mode.
- **Unique Voter Endorsements**: Cryptographically secure, atomic upvoting/downvoting backed by PostgreSQL unique constraints and server-salted SHA-256 tokens.
- **Official Directorate Adjudications**: Real-time status lifecycles (`PENDING_REVIEW`, `UNDER_INVESTIGATION`, `RESOLVED`, `CANONIZED`, `DISMISSED`) with official decrees and Archon attribution.
- **Citizen Docket Challenges (`/api/reports`)**: Citizens can report spam, hate speech, or real-world partisan politics that break the fictional premise.
- **Secure Archon Oversight Terminal (`/admin`)**: Session-authenticated administrative dashboard with aggregate metrics, grievance triage, verdict decree publishing, report moderation, and an immutable audit log.
- **Uptime Monitoring Endpoint (`/api/health`)**: Non-sensitive readiness probe verifying system uptime, Node runtime status, and database connectivity.

---

## 2. Technology Stack & Design Architecture

- **Framework**: Next.js 15+ (App Router, React Server Components, Server Actions)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with custom institutional design tokens
- **Database**: PostgreSQL on [Aiven](https://aiven.io) (Managed cloud database)
- **ORM & Migrations**: Drizzle ORM + Drizzle Kit
- **Validation**: Zod (Client-side & Server-side input contracts)
- **Authentication & Security**:
  - Node.js `crypto` + `bcryptjs`
  - Signed `HttpOnly`, `SameSite=Lax`, `Secure` cookies
  - SHA-256 token hashing with server-side `VOTER_SALT`
  - Zero permanent retention of raw IP addresses
- **Deployment Platform**: [Render](https://render.com) Web Service (Node.js runtime)

---

## 3. Environment Variables Specification

Create a `.env` file in the project root based on `.env.example`:

| Variable | Required | Description | Example |
|---|---|---|---|
| `SITE_URL` | **Yes (Prod)** | Canonical public production URL (must be HTTPS; no trailing slash). | `https://your-production-domain.example` |
| `SEO_INDEXING_ENABLED` | **Yes (Prod)** | Set to `"true"` ONLY on verified production domain; keep `"false"` for preview/dev. | `false` |
| `DATABASE_URL` | **Yes** | Aiven PostgreSQL connection URI with TLS enforcement (`?sslmode=require`). | `postgres://avnadmin:pass@pg-earth-mods.aivencloud.com:15432/defaultdb?sslmode=require` |
| `SESSION_SECRET` | **Yes** | Cryptographic key for moderator session hashing (min 32 chars). | `b3f8a9d12e456789...` |
| `VOTER_SALT` | **Yes** | Server-side cryptographic salt for hashing voter identity tokens. | `e98c71a39f02...` |
| `ADMIN_BOOTSTRAP_SECRET` | No | Secret token used during CLI/API admin bootstrapping. | `bootstrap_token_secret` |
| `INITIAL_ADMIN_USERNAME` | No | Username for the initial seeded administrator. | `archon_prime` |
| `INITIAL_ADMIN_EMAIL` | No | Email for the initial seeded administrator. | `directorate@earthmods.internal` |
| `INITIAL_ADMIN_PASSWORD` | No | Passphrase for the initial administrator. | `EarthModsPlanetaryModerator2026!` |
| `PORT` | Auto | Dynamic port (assigned automatically by Render or defaults to 3000). | `3000` |

---

## 4. Local Development Guide (Windows / macOS / Linux)

### 4.1 Prerequisites
- Node.js `v20.x` or `v24.x`
- npm `v10.x` or `v11.x`
- An Aiven PostgreSQL database instance (or local PostgreSQL with TLS disabled for local dev)

### 4.2 Installation
```powershell
# Clone the repository
git clone https://github.com/Notvoidd18/earth-mods.git
cd "Planet Earth Complain Center"

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### 4.3 Database Setup on Aiven
1. In the [Aiven Console](https://console.aiven.io), create a new **PostgreSQL** service (Free tier or Startup plan).
2. Copy the **Service URI** and ensure `?sslmode=require` is present at the end:
   ```env
   DATABASE_URL="postgres://avnadmin:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT/defaultdb?sslmode=require"
   ```
3. Run Drizzle schema migrations:
   ```bash
   npm run db:migrate
   ```
4. Seed the initial planetary grievances and default Archon administrator:
   ```bash
   npm run db:seed
   ```
5. (Optional) Bootstrap or reset an administrator account via CLI:
   ```bash
   npx tsx src/lib/db/bootstrap-admin.ts custom_archon archon@earthmods.internal "SuperSecretPassword123!"
   ```

### 4.4 Running Locally
```bash
# Start development server
npm run dev

# Open browser at http://localhost:3000
```

---

## 5. Verification & Testing

Run the full quality gate checks:

```bash
# 1. Run automated test suite (validation, token hashing, rate limiting, enums, auth)
npm run test

# 2. Run TypeScript strict type check
npm run typecheck

# 3. Compile optimized production build
npm run build
```

---

## 6. Render Deployment Guide (GitHub to Render Web Service)

Deploying EARTH MODS as a production Web Service on Render takes less than 3 minutes:

### 6.1 Step-by-Step Instructions
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** ➔ **Web Service**.
3. Connect your GitHub repository.
4. Select the following settings:
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Health Check Path**: `/api/health`
5. In the **Environment Variables** section, add:
   - `NODE_ENV`: `production`
   - `SITE_URL`: `https://earth-mods.onrender.com` *(or your custom canonical domain)*
   - `SEO_INDEXING_ENABLED`: `true` *(or keep `false` until custom domain DNS is linked)*
   - `DATABASE_URL`: `postgres://avnadmin:YOUR_PASSWORD@YOUR_HOST:PORT/defaultdb?sslmode=require`
   - `SESSION_SECRET`: *(Click 'Generate' or enter 32+ random characters)*
   - `VOTER_SALT`: *(Click 'Generate' or enter 32+ random characters)*
   - `INITIAL_ADMIN_PASSWORD`: *(Enter strong password for archon_prime)*
6. Click **Create Web Service**.
7. Once deployed, run the migration script against your database using the Render Shell or locally:
   ```bash
   DATABASE_URL="<Aiven_URL>" npm run db:migrate
   DATABASE_URL="<Aiven_URL>" npm run db:seed
   ```

---

## 7. Security & Privacy Architecture

- **Defense Against Escalation**: All moderation actions, status transitions, report clearances, and audit queries verify sessions strictly on the server (`requireModerator()`).
- **No Client Secrets**: No database credentials or secrets are prefixed with `NEXT_PUBLIC_`.
- **Hashed Voter Fingerprints**: Raw voter tokens issued via HttpOnly cookies are combined with a server secret `VOTER_SALT` and hashed using SHA-256 before insertion into the `votes` table.
- **No Permanent Raw IP Retention**: Raw client IPs are never written to persistent database columns. Short-lived in-memory sliding windows handle flood prevention.
- **Audit Ledger**: Every bureaucratic adjudication is permanently recorded in `audit_logs` with the responsible Archon's UUID and timestamp.

---

## 8. Backup & Maintenance Procedures

- **Aiven Automatic Backups**: Aiven PostgreSQL automatically creates Point-In-Time recovery (PITR) snapshots.
- **Manual Dump**:
  ```bash
  pg_dump "postgres://avnadmin:pass@host:port/defaultdb?sslmode=require" -Fc > earth_mods_backup.dump
  ```
- **Manual Restore**:
  ```bash
  pg_restore -d "postgres://avnadmin:pass@host:port/defaultdb?sslmode=require" --clean earth_mods_backup.dump
  ```

---

## 9. SEO, XML Sitemap & Robots Specification

- **Canonical Origin**: Governed strictly by `SITE_URL`. Trailing slashes are normalized; `localhost` is rejected as a production canonical origin.
- **Sitemap Discovery**: Accessible at `https://YOUR_CONFIGURED_DOMAIN/sitemap.xml`.
  - Automatically queries the active PostgreSQL database ledger for eligible public complaint dockets.
  - Generates stable canonical URLs (`/complaints/[caseNumber]`) with verified database `lastModified` timestamps.
  - Automatically handles database unavailability gracefully without crashing the sitemap.
  - Implements safety thresholding: standard limit is 50,000 URLs; Next.js `generateSitemaps()` chunking is recommended if public dockets exceed 45,000 entries.
  - Excludes administrative, authentication, and filing transaction workflows (`/admin`, `/admin/login`, `/submit`).
- **Robots Directives**: Served at `https://YOUR_CONFIGURED_DOMAIN/robots.txt`.
  - Governed by `SEO_INDEXING_ENABLED`.
  - When `SEO_INDEXING_ENABLED=false` (development, staging, preview branches): crawler access is disallowed (`Disallow: /`) to prevent indexing collisions.
  - When `SEO_INDEXING_ENABLED=true` (canonical production): crawler access is allowed for public content (`Allow: /`) and disallowed for `/admin/` and `/api/`.
- **Metadata & Previews**:
  - Implements the Next.js Metadata API with `metadataBase`.
  - Per-page unique titles, meta descriptions, and canonical links.
  - OpenGraph & Twitter Large Image cards generated dynamically at `/opengraph-image` (1200×630) using the Directorate seal, typography, and color palette.
  - Schema.org JSON-LD structured data for the Website and individual complaint articles.
  - Administrative and authentication routes explicitly enforce `robots: { index: false, follow: false, nocache: true }`.

---

## 10. Software License & Intellectual Property Scope

This software is released under the **MIT License**. See the root [`LICENSE`](LICENSE) file for the full legal text.

### Scope of License:
1. **Source Code**: The MIT License applies to the original application source code, components, API routes, database schemas, and documentation created for the EARTH MODS repository.
2. **User Submissions**: The software license does **not** grant ownership of user-submitted complaints, citizen comments, or forum postings, which remain the expression of their respective submitters or subject to the satirical Terms of Public Record.
3. **Brand Identity & Creative Assets**: The names "EARTH MODS", "Planetary Oversight & Grievance Directorate", custom vector seals (`earthlogo.icon`), and associated satirical lore are part of the product's creative identity. Third-party adoption of the source code should replace or customize institutional branding appropriately.
4. **Third-Party Dependencies**: All external packages and libraries listed in `package.json` (such as Next.js, React, Tailwind CSS, Drizzle ORM, Lucide, Cobe, etc.) remain subject to their respective open-source copyright notices and licenses.
5. **Launch Action Item**: The `LICENSE` file contains a copyright-holder placeholder:
   `Copyright (c) 2026 [EARTH MODS Contributors / Project Owner - CONFIRM LEGAL ENTITY BEFORE LAUNCH]`
   The project owner should replace this placeholder with their legal name or entity prior to public launch.
