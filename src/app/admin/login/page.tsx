"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Scale, ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
        throw new Error(data.error || "Authentication refused by Directorate security.");
      }

      router.push("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <Link
        href="/"
        className="text-xs font-mono text-stone-600 hover:text-institutional-950 flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Citizen Portal</span>
      </Link>

      <div className="bg-white border-2 border-institutional-900 rounded shadow-docket overflow-hidden">
        {/* Institutional Header */}
        <div className="bg-institutional-950 text-parchment-100 p-6 border-b border-institutional-800 text-center space-y-2">
          <div className="w-12 h-12 rounded border border-gold-500 bg-institutional-900 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-6 h-6 text-gold-400" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-parchment-50">
            Directorate Moderator Terminal
          </h1>
          <p className="text-xs font-mono uppercase tracking-wider text-parchment-400">
            Authorized Archon Access Only
          </p>
        </div>

        {/* Notice */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-[11px] text-amber-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Restricted interface. All access attempts logged in audit vault.</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label
              htmlFor="username"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-institutional-900"
            >
              Archon Username
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. archon_prime"
              className="w-full text-xs font-mono rounded border border-stone-300 bg-parchment-50 p-2.5 text-institutional-950 focus:border-gold-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-institutional-900"
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
              placeholder="••••••••••••••••"
              className="w-full text-xs font-mono rounded border border-stone-300 bg-parchment-50 p-2.5 text-institutional-950 focus:border-gold-500 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded bg-gold-600 hover:bg-gold-500 text-institutional-950 font-serif font-bold text-sm shadow transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-institutional-950" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <span>Authenticate Session</span>
            )}
          </button>
        </form>

        <div className="bg-parchment-100 border-t border-parchment-200 p-4 text-center text-[10px] font-mono text-stone-500">
          First-time setup: Use <code className="bg-stone-200 px-1 py-0.5 rounded">npm run db:bootstrap-admin</code> on the server host.
        </div>
      </div>
    </div>
  );
}
