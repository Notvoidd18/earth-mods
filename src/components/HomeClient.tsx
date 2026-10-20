"use client";

import { FormEvent, useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Globe } from "@/components/ui/globe";
import {
  COUNTRIES_LIST,
  COUNTRY_BY_CODE,
  getCountryFlag,
  getCountryName,
} from "@/lib/geo";
import { getCitizenPfp } from "@/lib/pfp";

type Complaint = {
  id: string;
  case_number: string | number;
  title: string;
  body: string;
  display_name: string | null;
  category: string;
  country_code: string;
  votes: number;
  verdict: string | null;
  created_at: string;
  lat: number;
  lon: number;
};

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Grievances" },
  { value: "EXISTENTIAL_METAGAME", label: "Existential & Daily Life" },
  { value: "ATMOSPHERE_WEATHER", label: "Weather & Atmosphere" },
  { value: "HUMAN_BIOLOGY", label: "Human Biology & Hardware" },
  { value: "PHYSICS_GRAVITY", label: "Physics, Gravity & Entropy" },
  { value: "FLORA_FAUNA", label: "Flora & Fauna (Mosquitoes, etc.)" },
  { value: "TEMPORAL_MECHANICS", label: "Temporal Mechanics (Mondays, Time)" },
  { value: "PLANETARY_INFRASTRUCTURE", label: "Planetary Infrastructure (Wi-Fi, Roads)" },
];

export default function HomeClient() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [sort, setSort] = useState<"new" | "votes">("new");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Form submission state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("EXISTENTIAL_METAGAME");
  const [countryCode, setCountryCode] = useState("GLOBAL");
  const [identity, setIdentity] = useState<"anonymous" | "username">("anonymous");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Globe preview, Raised Voice status & Airplane takeoff animation
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [raisedComplaintIds, setRaisedComplaintIds] = useState<Set<string>>(new Set());
  const [takingOffId, setTakingOffId] = useState<string | null>(null);

  // Globe interactive controls
  const globeAutoRotate = true;
  const [globeSpeed, setGlobeSpeed] = useState(0.003);
  const [targetPhi, setTargetPhi] = useState<number | undefined>(undefined);
  const [stampFeedback, setStampFeedback] = useState(false);

  // Restore user raised data from cryptographic voter token cookie
  const restoreUserRaisedVotes = useCallback(async () => {
    try {
      const res = await fetch("/api/votes", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.raisedIds)) {
          setRaisedComplaintIds(new Set(data.raisedIds));
        }
      }
    } catch {
      // Non-blocking fallback
    }
  }, []);

  // Load complaints from live database API
  const loadComplaints = useCallback(async (activeSort = sort) => {
    try {
      setLoading(true);
      const sortParam = activeSort === "votes" ? "top" : "new";
      const res = await fetch(`/api/complaints?sort=${sortParam}&limit=50`, {
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Could not load complaints");
      const data = await res.json();

      const mapped: Complaint[] = (data.complaints || []).map((c: any, i: number) => {
        const cCode = c.countryCode || c.country_code || "GLOBAL";
        const countryMeta = COUNTRY_BY_CODE[cCode.toUpperCase()] || COUNTRY_BY_CODE["GLOBAL"];

        // Deterministic offset so multiple complaints in the same country form distinct dots
        let hash = 0;
        const str = String(c.caseNumber || c.id || i);
        for (let j = 0; j < str.length; j++) {
          hash = (hash << 5) - hash + str.charCodeAt(j);
          hash |= 0;
        }
        const jitterLat = ((Math.abs(hash) % 40) - 20) * 0.18;
        const jitterLon = ((Math.abs(hash >> 2) % 40) - 20) * 0.18;
        const lat = Math.max(-65, Math.min(65, countryMeta.lat + jitterLat));
        const lon = Math.max(-175, Math.min(175, countryMeta.lon + jitterLon));

        return {
          id: c.id,
          case_number: c.caseNumber || c.case_number || (1000 + i),
          title: c.title,
          body: c.description || c.body || "",
          display_name: c.isAnonymous ? null : (c.authorName || c.display_name),
          category: c.category || "EXISTENTIAL_METAGAME",
          country_code: cCode,
          votes: c.score !== undefined ? c.score : (c.votes || 0),
          verdict: c.verdict || null,
          created_at: c.createdAt || c.created_at || new Date().toISOString(),
          lat,
          lon,
        };
      });

      setComplaints(mapped);
    } catch {
      setNotice("Could not load the live register from the planetary database.");
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    void loadComplaints();
    void restoreUserRaisedVotes();
  }, [loadComplaints, restoreUserRaisedVotes]);

  // Submit Complaint to real PostgreSQL database
  async function submitComplaint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (cleanTitle.length < 5 || cleanBody.length < 15) {
      setNotice("Please provide a title (5+ characters) and details (15+ characters).");
      return;
    }
    if (identity === "username" && username.trim().length < 2) {
      setNotice("Choose a username with at least 2 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: cleanTitle,
          description: cleanBody,
          category,
          countryCode,
          authorName: identity === "username" ? username.trim().slice(0, 24) : undefined,
          isAnonymous: identity === "anonymous",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission rejected.");

      setTitle("");
      setBody("");
      setUsername("");
      setShowForm(false);
      setNotice(`Complaint filed as #${data.caseNumber}. The department has received your paperwork.`);
      await loadComplaints();
    } catch (err: any) {
      setNotice(err.message || "Could not file your complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Raise voice handler with airplane runway takeoff sequence until raised
  async function raiseVoice(id: string) {
    if (takingOffId === id) return;

    // Trigger airplane takeoff animation
    setTakingOffId(id);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          complaintId: id,
          voteType: 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || "Voice could not be recorded.");
        setTakingOffId(null);
        return;
      }

      // Keep plane taking off sequence visible smoothly
      setTimeout(() => {
        setTakingOffId(null);
        if (data.userVote === 1) {
          setRaisedComplaintIds((prev) => new Set([...prev, id]));
        } else {
          setRaisedComplaintIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      }, 750);

      // Optimistic update of tally
      setComplaints((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, votes: data.score !== undefined ? data.score : item.votes + 1 }
            : item
        )
      );

      setNotice("✈ Voice reached planetary orbit. Petition registered as Raised.");
    } catch {
      setNotice("Voice could not be transmitted. Check network connectivity.");
      setTakingOffId(null);
    }
  }

  // Unraise voice handler (delete button beside Raised)
  async function unraiseVoice(id: string) {
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          complaintId: id,
          voteType: 1, // Toggles off existing vote in /api/votes
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || "Could not retract voice.");
        return;
      }

      setRaisedComplaintIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      setComplaints((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, votes: data.score !== undefined ? data.score : Math.max(0, item.votes - 1) }
            : item
        )
      );

      setNotice("Voice retracted from orbital ledger.");
    } catch {
      setNotice("Could not communicate with the database.");
    }
  }

  // Filter complaints based on Search query & Category filter
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesCategory =
        selectedCategory === "ALL" || c.category === selectedCategory;
      const cleanQ = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !cleanQ ||
        c.title.toLowerCase().includes(cleanQ) ||
        c.body.toLowerCase().includes(cleanQ) ||
        String(c.case_number).toLowerCase().includes(cleanQ) ||
        getCountryName(c.country_code).toLowerCase().includes(cleanQ);

      return matchesCategory && matchesQuery;
    });
  }, [complaints, selectedCategory, searchQuery]);

  const visible = useMemo(() => {
    return [...filteredComplaints].sort((a, b) =>
      sort === "votes"
        ? b.votes - a.votes
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [filteredComplaints, sort]);

  // Cobe Globe Markers mapped accurately
  const cobeMarkers = visible.map((c) => ({
    location: [c.lat, c.lon] as [number, number],
    size: 0.08,
    complaint: {
      id: c.id,
      caseNumber: String(c.case_number),
      title: c.title,
      category: c.category,
      status: "",
      countryCode: c.country_code,
    },
  }));

  return (
    <main className="min-h-screen">
      {/* Topline Announcement Bar */}
      <div className="topline load-up-1">
        <span>
          <span className="live-dot" /> PLANETARY OVERSIGHT &amp; GRIEVANCE DIRECTORATE
        </span>
        <span className="hidden sm:inline">EST. SINCE HUMANS STARTED COMPLAINING</span>
      </div>

      {/* Floating Modern Glassmorphism Navbar with Official earthlogo.icon */}
      <div className="nav-wrapper load-up-1">
        <header className="nav">
          <a className="brand" href="#top" aria-label="Earth Mods home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/planet.png"
              alt="Planetary Oversight Seal"
              className="w-10 h-10 object-contain drop-shadow"
            />
            <div>
              <strong>EARTH MODS</strong>
              <small>PLANETARY COMPLAINTS DEPARTMENT</small>
            </div>
          </a>
          <nav>
            <a href="#register">Public register</a>
            <a href="#how">How it works</a>
            <Link
              href="/divine-delusion"
              className="hidden sm:inline hover:text-[#244638] transition-colors"
            >
              Delusion Policy
            </Link>
            <button
              className="button button-dark nav-button shadow-md"
              onClick={() => setShowForm(!showForm)}
            >
              File a complaint <span>↗</span>
            </button>
          </nav>
        </header>
      </div>

      {/* Hero Section — World A (The Cinematic Planet) */}
      <section className="hero wrap" id="top">
        <div className="hero-copy load-up-2">
          <div className="eyebrow">
            <span>✳</span> OFFICIAL PORTAL · PLANETARY OVERSIGHT &amp; GRIEVANCE DIRECTORATE
          </div>
          <h1>
            Earth is a mess.<br />
            <em>Let&apos;s make it official.</em>
          </h1>
          <p className="hero-text">
            From vanishing forests to the audacity of mosquitoes, the Directorate receives formal complaints concerning the unacceptable circumstances of life on this planet.
          </p>
          <div className="hero-actions">
            <button
              className="button button-green shadow-lg"
              onClick={() => {
                setShowForm(true);
                document.getElementById("file-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              File a complaint <span>↗</span>
            </button>
            <a className="text-link" href="#register">
              Explore the planet <span>↓</span>
            </a>
          </div>
          <div className="hero-note">
            <span className="seal-mini">✓</span>
            <span>
              Your concern has been registered in spirit. Please submit it in writing.<br />
              <b>Government-level seriousness. Absolutely no government affiliation.</b>
            </span>
          </div>
        </div>

        {/* Hero Interactive Art with Cobe WebGL Rotating Globe & HUD Controls */}
        <div className="hero-art load-up-3" aria-label="Interactive 3D Planet Earth Globe">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />

          {/* Cobe 3D WebGL Rotating Globe with precise dot hit testing */}
          <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full overflow-hidden z-10 shadow-[0_0_40px_rgba(36,70,56,0.35)]">
            <Globe
              autoRotate={globeAutoRotate}
              rotationSpeed={globeSpeed}
              targetPhi={targetPhi}
              complaintMarkers={cobeMarkers}
              onSelectComplaint={(c) => {
                const found = visible.find((item) => item.id === c.id);
                if (found) setSelectedComplaint(found);
              }}
            />
          </div>

          {/* Interactive Clickable Orbit Badges */}
          <button
            className="orbit-label label-top"
            onClick={() => {
              // Spin fast briefly
              setGlobeSpeed(0.02);
              setTimeout(() => setGlobeSpeed(0.003), 1200);
              setNotice("Terran Orbit: Angular acceleration engaged (+20 mrad/s).");
            }}
            title="Click to boost orbital speed"
          >
            TERRAN ORBIT / 001 ⚡
          </button>

          <button
            className="orbit-label label-bottom"
            onClick={() => {
              // Focus on highest voted grievance
              const topGrievance = [...visible].sort((a, b) => b.votes - a.votes)[0];
              if (topGrievance) {
                setSelectedComplaint(topGrievance);
                const lonRad = (topGrievance.lon * Math.PI) / 180;
                setTargetPhi(-lonRad);
                setNotice(`Tracking highest civilian concurrence: Docket #${topGrievance.case_number}`);
              }
            }}
            title="Click to focus highest voted grievance"
          >
            VOICES IN ORBIT <b>{visible.length}</b> 🎯
          </button>

          {/* Interactive Official Directorate Stamp */}
          <div
            className={`stamp ${stampFeedback ? "scale-110 rotate-0 bg-[#244638] text-[#FDE047]" : ""}`}
            onClick={() => {
              setStampFeedback(true);
              setNotice("Official Stamp: Grievance authority advisory only. Physics laws remain unamended.");
              setTimeout(() => setStampFeedback(false), 1500);
            }}
            title="Click Directorate Seal for official advisory"
          >
            OFFICIALLY<br />UNOFFICIAL ★
          </div>
        </div>
      </section>

      {/* Selected Docket Glass Dossier Preview */}
      {selectedComplaint && (
        <div className="wrap mb-6 load-up-2">
          <div className="glass-panel p-6 rounded-2xl border border-[#DCD4C3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="country-badge">
                  {getCountryFlag(selectedComplaint.country_code)} {getCountryName(selectedComplaint.country_code)}
                </span>
                <span className="text-xs font-bold text-[#244638] tracking-wide">
                  ORBITAL DOCKET #{selectedComplaint.case_number}
                </span>
              </div>
              <h4 className="font-bold text-lg text-[#142D24] m-0">
                {selectedComplaint.title}
              </h4>
              <p className="text-sm text-[#444840] m-0 max-w-2xl leading-relaxed">
                {selectedComplaint.body.slice(0, 160)}...
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/complaints/${selectedComplaint.case_number}`}
                className="button button-green py-2.5 px-4 text-xs font-bold"
              >
                Inspect Dossier <span>↗</span>
              </Link>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="close-button"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Submission Form Section */}
      {showForm && (
        <section className="form-section wrap load-up-2" id="file-form">
          <div className="section-kicker">FORM EM-01 / PUBLIC SUBMISSION</div>
          <div className="form-heading">
            <div>
              <h2>Submit your formal grievance.</h2>
              <p className="muted m-0">
                Describe the matter. Provide the relevant details. The Directorate will handle the paperwork that follows.
              </p>
            </div>
            <button
              className="close-button"
              onClick={() => setShowForm(false)}
              aria-label="Close form"
            >
              ×
            </button>
          </div>

          <form onSubmit={submitComplaint} className="complaint-form">
            <label>
              Complaint title
              <input
                required
                minLength={5}
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mondays are suspiciously frequent and poorly optimized"
              />
            </label>

            <label>
              What happened?
              <textarea
                required
                minLength={15}
                maxLength={1500}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="State your case with factual gravity. The department is listening…"
                rows={4}
              />
              <span className="field-hint">
                15–1,500 characters. Please do not submit personal private information about other people.
              </span>
            </label>

            <div className="form-row">
              <label>
                Department Jurisdiction
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORY_OPTIONS.filter((opt) => opt.value !== "ALL").map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Country / Territory
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                  {COUNTRIES_LIST.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Filed under
                <select
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value as "anonymous" | "username")}
                >
                  <option value="anonymous">Anonymous citizen</option>
                  <option value="username">Public username</option>
                </select>
              </label>
            </div>

            {identity === "username" && (
              <label>
                Public username
                <input
                  required
                  minLength={2}
                  maxLength={24}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. CertifiedComplainant"
                />
              </label>
            )}

            <button
              className="button button-green submit-button shadow"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Filing petition..." : "Submit official complaint"} <span>↗</span>
            </button>

            <p className="form-footnote">
              By submitting, you agree not to post threats, private information, harassment, or illegal content.
            </p>
          </form>
        </section>
      )}

      {/* Public Complaints Register — World B (The Archival Surface) */}
      <section className="register wrap load-up-3" id="register">
        <div className="register-header">
          <div>
            <div className="section-kicker">EARTH ARCHIVE / GRIEVANCE DOSSIERS</div>
            <h2>
              The world&apos;s problems, officially on record<span className="period">.</span>
            </h2>
            <p className="muted">
              Every filed grievance is reviewed by Directorate observers. Citizen concurrence elevates cases for planetary audit.
            </p>
          </div>
          <div className="register-controls">
            {/* DATABASE OF HUMAN live pill */}
            <div className="flex flex-col sm:items-end gap-1">
              <span className="live-pill">
                <span className="live-dot" /> DATABASE OF HUMAN
              </span>
              <span className="text-[11px] font-medium text-[#6D7065]">
                Powered by PostgreSQL. Emotionally powered by disappointment.
              </span>
            </div>
            <select
              aria-label="Sort complaints"
              value={sort}
              onChange={(e) => {
                const nextSort = e.target.value as "new" | "votes";
                setSort(nextSort);
                void loadComplaints(nextSort);
              }}
            >
              <option value="new">Latest cases</option>
              <option value="votes">Most supported</option>
            </select>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search planetary grievances, keywords, docket ID..."
            className="px-4 py-2.5 rounded-xl border border-[#DCD4C3] bg-white text-sm w-full md:max-w-md shadow-xs outline-none focus:border-[#244638] focus:ring-2 focus:ring-[#244638]/20 transition-all"
          />

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedCategory(opt.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === opt.value
                    ? "bg-[#244638] text-white shadow-sm scale-105"
                    : "bg-white text-[#444840] border border-[#DCD4C3] hover:border-[#244638] hover:bg-[#F9F6F0]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss" className="font-bold ml-3 text-lg">
              ×
            </button>
          </div>
        )}

        <div className="case-list">
          {visible.map((c, i) => {
            const pfp = getCitizenPfp(c.display_name || c.id || c.case_number);
            const isTakingOff = takingOffId === c.id;
            const isRaised = raisedComplaintIds.has(c.id);

            return (
              <article className="case scroll-reveal" key={c.id}>
                {/* Citizen Avatar & Official Docket Badge Column */}
                <div className="case-docket-col">
                  <div
                    className="pfp-avatar"
                    style={{
                      background: pfp.bgGradient,
                      border: `2px solid ${pfp.borderColor}`,
                      boxShadow: `0 4px 14px ${pfp.glowColor}`,
                    }}
                    title={`${pfp.label} — ${pfp.roleDescription}`}
                    dangerouslySetInnerHTML={{ __html: pfp.svg }}
                  />
                  <span className="case-docket-badge">
                    #{String(c.case_number).padStart(4, "0")}
                  </span>
                </div>

                {/* Main Complaint Narrative & Directorate Review */}
                <div className="case-content">
                  <div className="case-meta">
                    <span className="country-badge">
                      {getCountryFlag(c.country_code)} {getCountryName(c.country_code)}
                    </span>
                    <span className="meta-dot">·</span>
                    <span className="citizen-role-pill">{pfp.badge}</span>
                    <span className="meta-dot">·</span>
                    <span className="text-xs font-medium text-[#5D6B62]">
                      {c.category.replace(/_/g, " ")}
                    </span>
                    <span className="meta-dot">·</span>
                    <span className="text-xs text-[#7A827B]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3>
                    <Link
                      href={`/complaints/${c.case_number}`}
                      className="hover:text-[#244638] transition-colors"
                    >
                      {c.title}
                    </Link>
                  </h3>
                  <p className="text-[15px] leading-relaxed text-[#3D4741] m-0 mb-3">
                    {c.body}
                  </p>

                  <div className="case-bottom">
                    <span className="filed-by">
                      FILED BY <b>{c.display_name || "Anonymous citizen"}</b>
                    </span>
                    <span className="meta-dot">·</span>
                    <Link
                      href={`/complaints/${c.case_number}`}
                      className="text-xs font-bold text-[#244638] hover:underline"
                    >
                      Inspect docket particulars <span>↗</span>
                    </Link>
                  </div>

                  {c.verdict && (
                    <div className="verdict mt-3">
                      <span>OFFICIAL MODERATOR REVIEW</span>
                      <p>&ldquo;{c.verdict}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* Enhanced "Raise voice" Runway to Orbit Animation with Unraise Action */}
                <div className="raise-voice-box">
                  <div className="raise-voice-actions">
                    <button
                      className={`raise-voice-button ${
                        isTakingOff
                          ? "is-taking-off voice-pulse"
                          : isRaised
                          ? "is-raised"
                          : ""
                      }`}
                      onClick={() => !isRaised && raiseVoice(c.id)}
                      disabled={isTakingOff || isRaised}
                      aria-label={`Raise voice for case ${c.case_number}`}
                      title={
                        isRaised
                          ? "Voice actively registered in orbital ledger"
                          : "Transmit your voice into planetary orbit"
                      }
                    >
                      <span className={isTakingOff ? "plane-taking-off" : "inline-block text-sm"}>
                        ✈
                      </span>
                      <span>
                        {isTakingOff ? "Taking off…" : isRaised ? "Raised" : "Raise voice"}
                      </span>
                    </button>

                    {/* Unraise Delete Button if already raised */}
                    {isRaised && (
                      <button
                        className="unraise-button"
                        onClick={() => unraiseVoice(c.id)}
                        aria-label={`Unraise voice for case ${c.case_number}`}
                        title="Delete endorsement / Unraise voice"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="raise-voice-tally">
                    <strong>{c.votes}</strong>
                    <span>{c.votes === 1 ? "voice" : "voices"}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {loading && <p className="muted py-8 text-center font-medium">Retrieving planetary records from the human database…</p>}
        {!loading && visible.length === 0 && (
          <div className="p-10 text-center muted font-medium bg-white/60 rounded-xl border border-[#DCD4C3] my-4">
            No grievances are currently filed under these parameters. Either humanity is doing wonderfully, or nobody has submitted the paperwork. We recommend further investigation.
          </div>
        )}

        <div className="register-foot">
          <span>END OF CURRENT RECORDS</span>
          <span>EARTH MODS · PUBLIC INFORMATION DIVISION</span>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how wrap load-up-4" id="how">
        <div>
          <div className="section-kicker">PROCEDURE / 04 STAGES</div>
          <h2>
            Justice is a form<br />
            you can fill out.
          </h2>
          <p className="muted max-w-sm mt-3">
            Not everything can be fixed. Everything can apparently become a form.
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span>01</span>
            <div>
              <h3>File the complaint.</h3>
              <p>Receive a docket. Experience the cautious optimism of administrative bureaucracy.</p>
            </div>
          </div>
          <div className="step">
            <span>02</span>
            <div>
              <h3>Raise your voice.</h3>
              <p>Citizens around the globe can browse the human register and elevate cases with celestial authority.</p>
            </div>
          </div>
          <div className="step">
            <span>03</span>
            <div>
              <h3>Await official nonsense.</h3>
              <p>Earth Mods review active grievances and issue verdicts of questionable legal authority.</p>
            </div>
          </div>
          <div className="step">
            <span>04</span>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="m-0">The Divine Delusion Department</h3>
                <span className="text-[10px] tracking-wider font-bold uppercase bg-[#F7F3E9] text-[#8B302B] border border-[#DCD4C3] px-2 py-0.5 rounded">
                  Non-Grantable Wishes Policy
                </span>
              </div>
              <p className="text-xs font-semibold text-[#8B302B] italic mb-1">
                &ldquo;Your feelings are valid. Your petition is not.&rdquo;
              </p>
              <p className="mb-2">
                Serving humanity&apos;s most unreasonable requests since the beginning of time. If you petitioned the cosmos to make someone text first, pass an exam without studying, or make you rich without working, review our statutory policy on non-grantable requests.
              </p>
              <Link
                href="/divine-delusion"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#244638] hover:text-[#142D24] uppercase tracking-wider hover:underline"
              >
                <span>Read Non-Grantable Wishes Policy</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap footer-inner">
          <a className="brand footer-brand" href="#top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/planet.png"
              alt="Earth Mods Logo"
              className="w-10 h-10 object-contain drop-shadow"
            />
            <div>
              <strong>EARTH MODS</strong>
              <small>PLANETARY OVERSIGHT &amp; GRIEVANCE DIRECTORATE</small>
            </div>
          </a>
          <p className="m-0 text-sm">
            Humanity remains solely responsible for the contents of its complaints.
          </p>
          <div className="flex items-center gap-5 text-sm font-semibold">
            <Link href="/divine-delusion" className="hover:underline">Delusion Policy</Link>
            <Link href="/policy" className="hover:underline">Policy</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/cookies" className="hover:underline">Cookies</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
