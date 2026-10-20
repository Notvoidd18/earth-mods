import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { getSiteUrl } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "EARTH MODS — A Better Earth Begins With a Complaint",
  description:
    "The official satirical portal for reporting terrestrial bugs, daily inconveniences, biological glitches, and petitioning the Celestial Authority.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "EARTH MODS — A Better Earth Begins With a Complaint",
    description:
      "The official satirical portal for reporting terrestrial bugs, daily inconveniences, biological glitches, and petitioning the Celestial Authority.",
    url: getSiteUrl(),
  },
  twitter: {
    title: "EARTH MODS — A Better Earth Begins With a Complaint",
    description:
      "The official satirical portal for reporting terrestrial bugs, daily inconveniences, biological glitches, and petitioning the Celestial Authority.",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
