import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export const alt = "EARTH MODS — Planetary Complaints Department";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  let logoDataUri = "";
  try {
    const logoBuffer = fs.readFileSync(path.join(process.cwd(), "public", "planet.png"));
    logoDataUri = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch {
    // Fallback if filesystem read unavailable
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0E2019",
          backgroundImage: "radial-gradient(circle at 50% 30%, #1A382B 0%, #0E2019 70%, #08120E 100%)",
          color: "#F4F1EA",
          padding: "54px 64px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          border: "12px solid #244638",
        }}
      >
        {/* Subtle decorative archival gold frame inset */}
        <div
          style={{
            position: "absolute",
            inset: "16px",
            border: "2px solid #B39A5A",
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />

        {/* Top Header Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#B39A5A",
                boxShadow: "0 0 12px #D4AF37",
              }}
            />
            <span
              style={{
                fontSize: "14px",
                fontWeight: 800,
                letterSpacing: "0.22em",
                color: "#E2D9C5",
                textTransform: "uppercase",
              }}
            >
              Sol-3 Public Ledger · Planetary Oversight Directorate
            </span>
          </div>

          <div
            style={{
              padding: "6px 16px",
              borderRadius: "9999px",
              border: "1px solid rgba(179, 154, 90, 0.4)",
              backgroundColor: "rgba(36, 70, 56, 0.6)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "#E2D9C5",
            }}
          >
            OFFICIAL SATIRICAL RECORD
          </div>
        </div>

        {/* Center Content: Seal + Headings */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "18px",
            zIndex: 10,
            maxWidth: "960px",
          }}
        >
          {/* Directorate Seal Icon */}
          <div
            style={{
              width: "92px",
              height: "92px",
              borderRadius: "50%",
              border: "3px solid #B39A5A",
              backgroundColor: "#142D24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            {logoDataUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoDataUri}
                alt="Earth Mods Logo"
                width="72"
                height="72"
                style={{ objectFit: "contain" }}
              />
            ) : (
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#1C3D30" }} />
            )}
          </div>

          <h1
            style={{
              fontSize: "64px",
              fontWeight: 900,
              lineHeight: 1.05,
              margin: 0,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              textShadow: "0 4px 18px rgba(0,0,0,0.5)",
            }}
          >
            EARTH MODS
          </h1>

          <p
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#E2D9C5",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            A Better Earth Begins With a Complaint.
          </p>

          <p
            style={{
              fontSize: "17px",
              fontWeight: 400,
              lineHeight: 1.45,
              color: "#C5CEC7",
              margin: 0,
              maxWidth: "760px",
            }}
          >
            The official satirical portal for reporting terrestrial bugs, daily inconveniences,
            biological glitches, and requesting patches from the Celestial Authority.
          </p>
        </div>

        {/* Bottom Bar: Statistics & Domain Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(179, 154, 90, 0.3)",
            paddingTop: "20px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "28px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#AAB4AC",
            }}
          >
            <span>7 CATEGORIES OF EXISTENTIAL REGULATION</span>
            <span>·</span>
            <span>PUBLIC DOCKET ARCHIVES</span>
            <span>·</span>
            <span>IMMUTABLE CITIZEN VOTES</span>
          </div>

          <div
            style={{
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#D4AF37",
            }}
          >
            SOL-3 GRIEVANCE REPOSITORY
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
