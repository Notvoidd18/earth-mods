import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archon Portal Authentication",
  description: "Secure institutional login terminal for Directorate Archons and Moderators.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
