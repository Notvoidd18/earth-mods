# Security & Moderation Policy: EARTH MODS

## 1. Threat Model & Security Posture

EARTH MODS operates under the presumption of an open internet environment with adversarial actors, spam bots, and malicious payload attempts. At the same time, it maintains a satirical public institutional premise without misleading citizens into believing it represents a real geopolitical government entity.

---

## 2. Core Security Guarantees

### 2.1 Defense Against Privilege Escalation
- **Zero Client-Side Authorization Trust**: All moderation decisions, complaints edits, status transitions, report handling, and audit views are protected by server-side session checks (`requireModerator`).
- **No Public Admin Registration**: There is no public registration form for moderators or administrators.
- **CLI / Environment First-Admin Bootstrap**: The initial administrator is provisioned via an explicit server-side bootstrap command (`npm run db:bootstrap-admin`) or startup script verifying configured secrets.

### 2.2 Protection of Secrets & Environment Variables
- `DATABASE_URL`, `ADMIN_BOOTSTRAP_SECRET`, `SESSION_SECRET`, and `VOTER_SALT` are strictly server-side variables.
- **Never Prefix with `NEXT_PUBLIC_`**: Sensitive keys are prohibited from using the `NEXT_PUBLIC_` prefix, preventing Next.js from bundling them into client-side JavaScript.
- All errors returned to public consumers are sanitized. Raw database error messages (e.g., PostgreSQL connection failures or table metadata) are logged on the server and hidden behind generic user-friendly error boundaries.

### 2.3 Input Validation & Content Sanitization
- All client inputs (title, description, category, author name, report reasons, search strings) are validated against strict Zod schemas with finite length limits before reaching the database.
- Safe rendering: React natively escapes output by default. No `dangerouslySetInnerHTML` is used anywhere in user-supplied content.
- Complaint titles are bounded to 180 characters; descriptions to 3,000 characters; display names to 60 characters.

### 2.4 Anonymous Submissions & Privacy Disclosures
- **Honest Privacy Disclosure**: The site does not falsely claim cryptographic anonymity. The public interface clarifies that while complaints may be filed under "Anonymous Citizen", technical metadata (such as temporary keyed hashes for rate limiting and voter deduplication) is processed to preserve site integrity.
- **No Long-term Raw IP Storage**: Raw IP addresses are never written to persistent database columns.

### 2.5 Voter Integrity & Rate Limiting
- Votes are bound to a server-salted SHA-256 hash of the visitor's secure cookie.
- Database enforces `UNIQUE(complaint_id, voter_hash)`.
- Client-submitted vote tallies are never trusted. The database computes `score = upvotes - downvotes` dynamically or via atomic SQL expressions (`upvotes_count = upvotes_count + 1`).
- Rate limiting guards both `/api/votes` and complaint creation against automated spam bursts.

### 2.6 Session Management & Cookie Hardening
- Authentication cookies are set with:
  - `HttpOnly: true` (prevents JavaScript access / XSS theft)
  - `Secure: true` in production (enforces HTTPS)
  - `SameSite: 'lax'` or `'strict'` (mitigates CSRF)
  - `Path: '/'`
  - Explicit TTL expiration.
- Sessions are stored in the `sessions` table as SHA-256 hashes of the bearer token, preventing database breach token theft.

### 2.7 Audit Logging & Private Metadata Separation
- Every moderator action (status transition, verdict authoring, hiding, dismissal) is recorded into `audit_logs` with moderator UUID, timestamp, action type, and target ID.
- Private moderation notes, reporter identities, audit logs, and moderator credentials are excluded from all public API endpoints and Server Component props.
