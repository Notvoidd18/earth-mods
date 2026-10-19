"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
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
        throw new Error(data.error || "Access denied by Earth security.");
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
        className="text-xs font-mono text-emerald-300 hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Citizen Helpdesk</span>
      </Link>

      <div className="glass-panel-strong rounded-3xl border border-white/20 shadow-2xl overflow-hidden relative">
        {/* Liquid background glow */}
        <div className="liquid-glow-sphere -top-12 -right-12 w-48 h-48 bg-emerald-500/20" />

        {/* Header */}
        <div className="p-6 sm:p-8 text-center space-y-2 border-b border-white/10 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center mx-auto shadow-liquid-emerald">
            <Lock className="w-6 h-6 text-brand-dark" />
          </div>
          <h1 className="font-extrabold text-2xl tracking-tight text-white">
            Earth Moderator Portal
          </h1>
          <p className="text-xs font-mono uppercase tracking-wider text-emerald-300">
            Planetary Staff Only
          </p>
        </div>

        {/* Security Warning */}
        <div className="px-6 py-2.5 bg-white/5 border-b border-white/10 text-[11px] text-white/70 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Authorized moderator credentials required. All logins are audited.</span>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-4 relative z-10">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-mono">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-emerald-300"
            >
              Moderator Username
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. archon_prime"
              className="w-full text-xs font-mono rounded-xl glass-input p-3 text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-emerald-300"
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
              className="w-full text-xs font-mono rounded-xl glass-input p-3 text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 liquid-btn py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying Access...</span>
              </>
            ) : (
              <span>Enter Mod Room</span>
            )}
          </button>
        </form>

        <div className="px-6 py-4 bg-white/5 border-t border-white/10 text-center text-[11px] font-mono text-white/50">
          First-time setup? Use <code className="bg-white/10 px-1.5 py-0.5 rounded text-emerald-300">npm run db:bootstrap-admin</code>
        </div>
      </div>
    </div>
  );
}
