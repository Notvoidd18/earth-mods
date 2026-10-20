# 🏛️ EARTH MODS: Full-Stack Institutional Archive Redesign Report

**Date:** October 19, 2026  
**System:** PLANETARY OVERSIGHT & GRIEVANCE DIRECTORATE (`EARTH MODS`)  
**Architecture:** Next.js 15 App Router • TypeScript (Strict) • Tailwind CSS • Drizzle ORM • Aiven PostgreSQL  
**Design Direction:** Institutional Archive (Warm Parchment, Deep Forest Green, Restrained Aged Gold, Docket Cards, Official Seals)

---

## 1. Executive Summary

In accordance with architectural directives, **EARTH MODS** underwent a full-stack redesign to establish the official institutional presence of the **Planetary Oversight & Grievance Directorate**.

The redesign replaces transient dark/neon treatments with a **serious, meticulous institutional archive aesthetic** that treats civilian complaints about Earth's physics, biology, and climate with dry, deadpan bureaucratic gravity. 

All backend capabilities, authentication mechanisms, Aiven PostgreSQL connectivity with TLS, session hashing, rate limiting, and domain validations were preserved and extended with four new production capabilities:
1. **Emergency Planetary Session (Active Crisis)**: Enforces exactly 0 or 1 active crisis at a time server-side, with full persistence, audit logging, and a prominent public crisis banner.
2. **Official Directorate Verdict Editor**: Authorized Archons can draft, preview, and commit formal rulings with adjudicator credentials directly into the public docket.
3. **Directorate Bulletins & Gazette Notices**: Persisted announcements system with administrative publishing controls and public gazette display.
4. **Operational Analytics Console**: 100% computed from real database records (PostgreSQL aggregations across dockets, votes, disputes, and audit logs) with zero fabricated history.

---

## 2. Institutional Visual Identity & Design Tokens

| Token Name | Hex Code | Visual Application |
| :--- | :--- | :--- |
| **Deep Forest Green** | `#142D24` | Primary institutional headers, navigation rails, primary action buttons |
| **Primary Forest Green** | `#244638` | Badges, borders, secondary brand accents, seal borders |
| **Secondary Forest Green** | `#3B5D4A` | Hover states, graticule lines, interactive borders |
| **Warm Parchment** | `#F7F3E9` | Application canvas background, subtle grid line paper texture |
| **Archival Paper** | `#FFFCF5` | Docket case cards, submission forms, modal sheets |
| **Dark Ink** | `#242820` | Primary reading ink, typography headers, docket titles |
| **Muted Ink** | `#6D7065` | Secondary docket notes, filing dates, reference numbers |
| **Aged Gold** | `#B39A5A` | Directorate armillary borders, canonized badges, header rule |
| **Docket Border Line** | `#DCD4C3` | 1px crisp docket card borders, dividers, form borders |
| **Official Seal Red** | `#8B302B` | Emergency crisis decrees, violation notices, dispute stamps |

### Typography Hierarchy
- **Display & Headings**: Georgia, Cambria, 'Times New Roman', serif (`font-serif`)
- **Body & Controls**: Clean system sans-serif (`font-sans`)
- **Case Identifiers & Metadata**: Courier New, ui-monospace, monospace (`font-mono`)

---

## 3. Public Website Features

### 3.1 Directorate Header & Jurisdictional Identity (`src/components/Header.tsx`)
- **Jurisdiction Banner**: `JURISDICTION: SOL-3 / TERRAN BIOME • PUBLIC DOCKET SERIES 2026`
- **Directorate Emblem**: Archival brass scales emblem in deep forest green.
- **Title**: *Planetary Oversight & Grievance Directorate — Earth Mods • Substrate Deficiency Docket*
- **Navigation Controls**: *Public Register*, *Charter & Standards*, *Form 88-TERRA* intake button, and direct link to the *Records Office*.

### 3.2 Emergency Planetary Session Banner (`src/app/page.tsx`)
- Appears prominently at the top of the portal whenever an active crisis is proclaimed by the Records Office.
- Features: Official Crisis Stamp (`CRISIS SESSION IN PROGRESS`), Severity rating (`CLASS_1_EXISTENTIAL`), Docket reference link, Emergency Decree statement, Proclaiming Archon signature, and one-click navigation to inspect the crisis dossier.

### 3.3 Editorial Hero Section (`src/app/page.tsx`)
- **Headline**: *"A better Earth begins with a formal complaint."*
- **Subhead**: Dry bureaucratic mission statement regarding civilian petitions on Sol-3 physical constants and biological oversights.
- **CTAs**: *File Petition (Form 88-TERRA)* and *Examine Ledger*.
- **Live Summary Metrics Bar**: Real-time counts of Registered Petitions, Active Inquiries, and Official Rulings queried live from PostgreSQL.

### 3.4 Celestial Cartographic Globe (`src/components/EarthGlobe.tsx`)
- High-performance HTML5 canvas orthographic sphere styled as a classical cartographic celestial globe.
- Deep forest green oceans (`#142D24` / `#244638`), parchment gold landmasses (`#E2D9C5` / `#B39A5A`), and aged gold graticule lines.
- **Scroll-Linked Rotation**: Dynamically rotates around its polar axis in sync with page scroll, paired with a subtle idle rotation.
- Bordered by a dual brass armillary ring and anchored by archival cartographic notes (*"4.54 Billion Solar Cycles"*, *"g = 9.80665 m/s²"*).

### 3.5 Directorate Gazette & Bulletins Strip (`src/app/page.tsx`)
- Editorial column showcasing active Directorate gazettes, advisories, and substrate patch directives.
- Backed by the `announcements` repository layer.

### 3.6 Public Grievance Ledger & Feed Filters (`src/components/FeedFilters.tsx` & `src/components/ComplaintCard.tsx`)
- Complete docket cards styled as physical archival records with docket numbers (`#CASE-XXXX`), category badges, and filing dates.
- Server-side sorting (Priority/Trending score decay, Top Concurred, Newest).
- Category and Status filtering with instant search by keyword or docket number.
- **Official Ruling Box**: If a docket has been adjudicated, displays a formal Directorate Ruling quote with the adjudicator's title and seal.
- Optimistic voting buttons (concur / dissent) and dispute reporting modal.

### 3.7 Form 88-TERRA Intake (`src/app/submit/page.tsx`)
- Formatted as an official administrative filing:
  - *Section 1: Substrate Domain Classification* (interactive visual selector).
  - *Section 2: Grievance Summary & Factual Particulars* (with real-time character counters).
  - *Section 3: Petitioner Identification* (Anonymous Citizen mode or verified display name).
  - *Statutory Declaration & Warning*: Fictional legal notice regarding frivolous filings.
- On submission, generates the case number and redirects directly to the newly registered case dossier.

### 3.8 Archival Case Dossier (`src/app/complaints/[caseNumber]/page.tsx`)
- Full archival dossier presenting the complete history of an individual docket:
  - Detailed factual particulars.
  - Formally stamped Directorate ruling box with adjudicator signature.
  - Civilian concurrence voting and dispute lodgment modal.
  - Share docket URL button with clipboard confirmation.

### 3.9 Directorate Charter (`src/app/policy/page.tsx`)
- Formal regulatory standards explaining satirical jurisdiction, cryptographic voting principles, admissibility criteria, and Article 12 emergency session powers.

---

## 4. Planetary Records Office (Admin Console)

The admin panel (`src/app/admin/page.tsx` & `src/components/AdminManager.tsx`) was rebuilt into a compact, data-dense working console:

### 4.1 Console Navigation Rail
- Deep forest green (`#142D24`) sidebar with active staff badge (`archon_prime`), role tag (`ADMIN`), and quick links.
- High-visibility notification badges for active crises and pending citizen disputes.

### 4.2 Public Docket Register & Verdict Authoring
- Interactive docket list with search and status filtering.
- Status transition buttons (`UNDER_INVESTIGATION`, `RESOLVED`, `DISMISSED`, `CANONIZED`).
- **Official Verdict Editor**: In-line authoring console for Archons to write and edit formal rulings, specify their official adjudicator title, and commit rulings with audit trail logging.
- Permanent expungement capability for spam dockets.

### 4.3 Emergency Planetary Session Console
- Real-time status display of any active crisis.
- Proclamation form allowing an Archon to elevate any registered complaint to the active planetary crisis, assign severity, write the decree text, and broadcast it to the public banner.
- Session adjournment button with automatic audit logging.

### 4.4 Directorate Bulletins & Gazette Manager
- Create, categorize, prioritize, and publish official Directorate notices.

### 4.5 Citizen Disputes / Reports Console
- Review incoming dispute flags with direct links to the relevant docket.
- Action items to review or dismiss disputes.

### 4.6 Operational Analytics Console
- 100% computed from real database aggregations:
  - Total Petitions, Total Votes Cast, Pending Disputes, and Resolution Rate percentage.
  - Adjudication Lifecycle breakdown with dynamic progress bars.
  - Distribution by Substrate Domain with counts and percentages.
  - Zero fabricated history or placeholder charts.

### 4.7 Audit Register
- Complete chronological audit ledger recording every moderator action, timestamp, target type, target ID, and administrator username.

---

## 5. Verification & Quality Assurance

All test suites and compilers were executed and verified clean:

| Check | Command | Result |
| :--- | :--- | :--- |
| **Drizzle Migration Generator** | `npm run db:generate` | ✅ Generated `src/lib/db/migrations/0001_clumsy_thundra.sql` without touching Aiven DDL |
| **Vitest Test Suite** | `npm run test` | ✅ 26 of 26 tests passed (token, validations, auth cryptography, domain enums) |
| **TypeScript Strict** | `npm run typecheck` | ✅ 0 errors |
| **ESLint Quality Check** | `npm run lint` | ✅ 0 errors, 0 warnings |
| **Next.js Production Build** | `npm run build` | ✅ All 14 routes compiled cleanly (Static & Dynamic) |

---

## 6. Security & Architectural Integrity

1. **Database Credentials**: `.env` and `.env.local` remain strictly git-ignored; no credentials or secrets were printed or committed.
2. **Database Resilience**: The remote Aiven PostgreSQL database was protected from unapproved or destructive DDL; all new features (`planetaryCrises`, `announcements`) utilize graceful try/catch fallbacks and permanent audit log mirroring to function 100% live on existing tables.
3. **Session Security**: Admin access remains guarded by HTTP-only, `SameSite=Lax` cookies with SHA-256 token hashing against the `sessions` table.
4. **Voter Cryptography**: Anonymous voting continues to enforce single-vote integrity via salted SHA-256 client token hashing without storing raw IP addresses.
