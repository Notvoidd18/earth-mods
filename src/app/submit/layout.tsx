import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lodge a Planetary Grievance",
  description:
    "Formally petition the Planetary Oversight & Grievance Directorate regarding terrestrial bugs, physical substrate flaws, and daily inconveniences.",
  alternates: {
    canonical: "/submit",
  },
  openGraph: {
    title: "Lodge a Planetary Grievance | EARTH MODS",
    description:
      "Formally petition the Planetary Oversight & Grievance Directorate regarding terrestrial bugs, physical substrate flaws, and daily inconveniences.",
    url: "/submit",
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
