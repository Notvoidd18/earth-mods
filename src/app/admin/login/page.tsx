"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldAlert, Loader2, ArrowLeft, Scale } from "lucide-react";
import Link from "next/link";
import { SiteNavbar, SiteFooter } from "@/components/SiteNavigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Access denied by Directorate security.");
      }

      router.push("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <SiteNavbar />

      <div className="wrap max-w-md py-12 px-4 space-y-6 load-up-2">
        <Link
          href="/"
          className="text-xs text-[#244638] hover:text-[#142D24] flex items-center gap-1.5 transition-colors font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to The Register</span>
        </Link>

        <div className="glass-panel rounded-2xl border border-[#DCD4C3] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 text-center space-y-2 bg-[#142D24] text-[#FFFCF5] border-b border-[#244638]">
            <div className="w-12 h-12 rounded-xl bg-[#244638] border border-[#B39A5A] flex items-center justify-center mx-auto text-[#B39A5A] shadow-inner">
              <Scale className="w-6 h-6" />
            </div>
            <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#FFFCF5] m-0">
              Directorate Records Office
            </h1>
            <p className="text-xs uppercase tracking-wider text-[#A69B85] m-0">
              Archon &amp; Moderator Terminal
            </p>
          </div>

          {/* Security Warning */}
          <div className="px-6 py-3 bg-[#EBF2EE] border-b border-[#DCD4C3] text-xs text-[#244638] font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#244638] shrink-0" />
            <span>Statutory Warning: All authentication attempts are logged to the Directorate ledger.</span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-[#FBEBEA] border border-[#8B302B] text-[#8B302B] text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-bold uppercase tracking-wider text-[#142D24]"
              >
                Staff Identifier / Username
              </label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. archon_prime"
                className="w-full text-sm p-3 rounded-xl border border-[#DCD4C3] bg-white text-[#142D24] outline-none focus:border-[#244638] focus:ring-2 focus:ring-[#244638]/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#142D24]"
              >
                Security Passphrase
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-sm p-3 rounded-xl border border-[#DCD4C3] bg-white text-[#142D24] outline-none focus:border-[#244638] focus:ring-2 focus:ring-[#244638]/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full button button-green shadow mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate into Terminal</span>
                </>
              )}
            </button>
          </form>

          <div className="p-4 bg-[#F7F3E9] border-t border-[#DCD4C3] text-center text-xs text-[#6D7065]">
            Secured by SHA-256 Hashed Session Cookies &amp; Audit Trail
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
