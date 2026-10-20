"use client";

import Link from "next/link";
import { useState } from "react";

export function SiteNavbar() {
  const [copiedNotice, setCopiedNotice] = useState(false);

  return (
    <>
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
          <Link className="brand" href="/" aria-label="Earth Mods home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/planet.png"
              alt="Planetary Oversight Seal"
              className="w-10 h-10 object-contain drop-shadow"
            />
            <div>
              <strong>EARTH MODS</strong>
              <small>PLANETARY OVERSIGHT &amp; GRIEVANCE DIRECTORATE</small>
            </div>
          </Link>

          <nav>
            <Link href="/" className="hover:text-[#244638] transition-colors">
              The Register
            </Link>
            <Link href="/divine-delusion" className="hidden sm:inline hover:text-[#244638] transition-colors">
              Delusion Policy
            </Link>
            <Link href="/policy" className="hidden sm:inline hover:text-[#244638] transition-colors">
              Charter &amp; Policy
            </Link>
            <Link href="/admin" className="hidden md:inline hover:text-[#244638] transition-colors">
              Records Office
            </Link>
            <Link
              href="/submit"
              className="button button-green nav-button shadow-sm"
            >
              File a complaint <span>↗</span>
            </Link>
          </nav>
        </header>
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20">
      <div className="wrap footer-inner">
        <Link className="brand footer-brand" href="/">
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
        </Link>
        <p className="m-0 text-sm">
          Humanity remains solely responsible for the contents of its complaints.
        </p>
        <div className="flex items-center gap-5 text-sm font-semibold">
          <Link href="/divine-delusion" className="hover:underline">Delusion Policy</Link>
          <Link href="/policy" className="hover:underline">Policy</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/cookies" className="hover:underline">Cookies</Link>
          <Link href="/admin" className="hover:underline">Staff</Link>
        </div>
      </div>
    </footer>
  );
}
