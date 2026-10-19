# Implementation Plan: EARTH MODS (Planetary Complaints Department)

## 1. Project Overview & Objectives
**EARTH MODS** is a satirical yet institutionally authentic planetary government complaints portal. Citizens across the globe (and orbital colonies) can submit absurd or everyday grievances against the planet's operating parameters (e.g., physics bugs, weather balancing, biological design flaws, human interface quirks).

The portal combines:
- Serious, institutional, crisp governmental aesthetic (deep forest green `#122b1c`, warm parchment `#fbf9f4`, muted gold `#c49b45`, thin formal borders, official seals, department case IDs like `EM-2026-XXXXX`).
- A robust, production-grade Next.js (App Router) + TypeScript + Tailwind CSS full-stack architecture.
- PostgreSQL database integration via Drizzle ORM configured for Aiven (TLS required, connection pooling).
- Full public feed, search, category filter, trending/top/new sort, pagination.
- Submission flow with Zod validation, length limits, anti-spam protections.
- Database-backed unique voting per visitor (using cryptographically hashed voter tokens).
- Official Earth Mods moderation system: status lifecycle (`PENDING_REVIEW`, `UNDER_INVESTIGATION`, `RESOLVED`, `REJECTED`, `CANONIZED`), official moderator verdicts, moderator attribution.
- Citizen report abuse flow.
- Secure Admin/Moderator Portal with session management, audit logs, aggregate metrics, and zero public leakage.
- Production-ready health endpoint (`/api/health`) and comprehensive Render deployment setup.

---

## 2. Phase Breakdown

### Phase 1: Project Foundation, Tooling & Database Layer
- **1.1 Next.js 15+ App Router Setup**: TypeScript strict mode, Tailwind CSS, Lucide icons, clsx/tailwind-merge.
- **1.2 Database Schema (Drizzle ORM + PostgreSQL)**:
  - `complaints`: id, case_number (`EM-2026-XXXXX`), title, description, category, author_name, is_anonymous, status, verdict, verdict_by, verdict_date, upvotes_count, downvotes_count, score, report_count, created_at, updated_at.
  - `votes`: id, complaint_id, voter_hash (SHA-256 of voter token + salt), vote_type (+1 / -1), created_at.
  - `reports`: id, complaint_id, reason, details, reporter_hash, status (`PENDING`, `REVIEWED`, `DISMISSED`), created_at.
  - `moderators`: id, username, email, password_hash, role (`ADMIN`, `MODERATOR`), is_active, created_at, last_login_at.
  - `sessions`: id, token_hash, moderator_id, expires_at, created_at.
  - `audit_logs`: id, moderator_id, action, target_type, target_id, details (JSONB), created_at.
- **1.3 Database Connection & Drizzle Config**:
  - Connection pooling using `postgres` or `pg` with strict SSL configuration (`rejectUnauthorized: true` / TLS).
  - Migration scripts, Drizzle config (`drizzle.config.ts`), and seed script (`scripts/seed.ts`).
  - Safe bootstrap script for the initial admin account (`scripts/bootstrap-admin.ts`).

### Phase 2: Core Domain Logic & Seed Data
- **2.1 Validation & Domain Rules**:
  - Zod schemas for complaints, votes, reports, auth, moderation actions.
  - Rate limiting logic (in-memory + database / token sliding window with hashed identifiers).
- **2.2 High-Quality Seed Data**:
  - Realistic, hilarious bureaucratic complaints spanning categories: *Physics & Gravitation*, *Atmospheric & Weather Balancing*, *Flora & Fauna Design*, *Human Biology & Ergonomics*, *Temporal Mechanics & Scheduling*, *Social & Planetary Infrastructure*.
  - Clearly tagged sample verdicts and status tags.

### Phase 3: Public Portal UI & Experience
- **3.1 Institutional Visual Design**:
  - Global government header with seal, case tracker, official warning banners, status ledger.
  - Mobile-first responsive layout with accessible semantic HTML, high-contrast states, and reduced-motion consideration.
- **3.2 Public Complaints Feed**:
  - Search by title, case number, or keyword.
  - Filter by Category and Status.
  - Sort by: Trending (time-decayed vote score), Top (highest score), Newest.
  - Pagination controls with total count and case index.
  - Empty states, loading skeletons, error boundaries.
- **3.3 Complaint Submission Portal (`/submit`)**:
  - Formal planetary complaint intake form.
  - Form validation with live character counts, category picker, anonymous mode toggle.
  - Clear privacy notice regarding voter/submission token hashing and non-retention of raw IPs.
  - Instant redirect to the generated Case File upon acceptance.

### Phase 4: Complaint Detail Page & Voting Mechanics
- **4.1 Shareable Case File (`/complaints/[caseNumber]`)**:
  - Formal document layout: Case ID, timestamp, department stamps, status badge.
  - Citizen complaint text and submitter classification.
  - Official Earth Mods Verdict box (stamped with moderator title, resolution date, and official decree).
  - Metadata badges, copy shareable link, print case file view.
- **4.2 Voting System**:
  - Upvote / Downvote actions with immediate optimistic feedback and atomic server-side persistence.
  - Unique voter token issued via secure cookie, hashed with server-side salt before database storage.
  - Server-side vote integrity: prevents duplicate votes, enforces rate limits, updates aggregated counts in atomic transaction.
- **4.3 Citizen Abuse Reporting Flow**:
  - Modal/Form to flag a complaint for spam, real-world harassment, or illegal content.
  - Hashed reporter token to prevent report flooding.

### Phase 5: Administration & Moderation Dashboard
- **5.1 Authentication & Session Handling**:
  - Secure `/admin/login` page.
  - Passwords hashed with standard modern hashing (PBKDF2/scrypt/argon2 via Node crypto or bcrypt).
  - Secure HttpOnly, SameSite=Lax/Strict session cookie.
  - Server-side session verification helper (`requireModerator`).
- **5.2 Moderator Dashboard (`/admin`)**:
  - Overview metrics: Total cases, Pending reports, Resolved rate, Active moderator stats.
  - Complaint Triage: Approve, Reject, Under Investigation, Canonize.
  - Verdict Editor: Write official governmental decrees, add moderator title, apply stamps.
  - Reports Queue: Review citizen flags, dismiss or hide offending complaints.
  - Audit Log viewer: Transparent trace of all bureaucratic decisions.

### Phase 6: Operational Readiness, Testing & Quality Gates
- **6.1 Health & Monitoring (`/api/health`)**:
  - Uptime check, database connection probe, memory usage check, without leaking credentials.
- **6.2 Automated Test Suite**:
  - Unit tests for validation schemas, rate limiting, and hashing utilities (using Vitest or Jest).
  - Integration tests for complaints creation, duplicate prevention, vote uniqueness, and unauthorized admin access.
- **6.3 Documentation & Deployment**:
  - Comprehensive `.env.example`, `README.md`, `Render` deployment configuration (`render.yaml`).
  - Detailed Aiven connection guide and migration runbooks.
  - Production build verification (`npm run build`, `npm run lint`).
