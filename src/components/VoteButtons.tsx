"use client";

import { useState } from "react";
import { ArrowBigUp, ArrowBigDown, Loader2 } from "lucide-react";

interface VoteButtonsProps {
  complaintId: string;
  initialScore: number;
  initialUpvotes: number;
  initialDownvotes: number;
  userVote?: 1 | -1 | 0;
  orientation?: "vertical" | "horizontal";
}

export function VoteButtons({
  complaintId,
  initialScore,
  initialUpvotes,
  initialDownvotes,
  userVote = 0,
  orientation = "vertical",
}: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [activeVote, setActiveVote] = useState<1 | -1 | 0>(userVote);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVote = async (targetVote: 1 | -1) => {
    if (isLoading) return;

    // Save previous state for rollback
    const prevScore = score;
    const prevUpvotes = upvotes;
    const prevDownvotes = downvotes;
    const prevActive = activeVote;

    // Optimistic calculation
    let newScore = score;
    let newUp = upvotes;
    let newDown = downvotes;
    let nextActive: 1 | -1 | 0 = targetVote;

    if (activeVote === targetVote) {
      nextActive = 0;
      if (targetVote === 1) {
        newUp -= 1;
        newScore -= 1;
      } else {
        newDown -= 1;
        newScore += 1;
      }
    } else if (activeVote === 0) {
      if (targetVote === 1) {
        newUp += 1;
        newScore += 1;
      } else {
        newDown += 1;
        newScore -= 1;
      }
    } else {
      if (targetVote === 1) {
        newUp += 1;
        newDown -= 1;
        newScore += 2;
      } else {
        newDown += 1;
        newUp -= 1;
        newScore -= 2;
      }
    }

    setScore(newScore);
    setUpvotes(newUp);
    setDownvotes(newDown);
    setActiveVote(nextActive);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId, voteType: targetVote }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to record your vote.");
      }

      if (typeof data.score === "number") {
        setScore(data.score);
        setUpvotes(data.upvotesCount);
        setDownvotes(data.downvotesCount);
        setActiveVote(data.userVote ?? nextActive);
      }
    } catch (err: unknown) {
      setScore(prevScore);
      setUpvotes(prevUpvotes);
      setDownvotes(prevDownvotes);
      setActiveVote(prevActive);
      const msg = err instanceof Error ? err.message : "Vote registration failed.";
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const isVertical = orientation === "vertical";

  return (
    <div
      className={`relative flex items-center ${
        isVertical ? "flex-col space-y-1" : "flex-row space-x-2"
      } backdrop-blur-md bg-white/5 rounded-2xl border border-white/15 p-1.5 shadow-glass-sm`}
    >
      {/* Endorse (Upvote) */}
      <button
        type="button"
        onClick={() => handleVote(1)}
        disabled={isLoading}
        aria-label="Agree this is a bug"
        className={`p-1.5 rounded-xl transition-all duration-200 ${
          activeVote === 1
            ? "text-emerald-300 bg-emerald-500/30 border border-emerald-400/50 shadow-liquid-emerald"
            : "text-white/60 hover:text-emerald-300 hover:bg-white/10"
        }`}
        title="Agree / Fix this bug! (+1)"
      >
        <ArrowBigUp className={`w-5 h-5 ${activeVote === 1 ? "fill-emerald-400" : ""}`} />
      </button>

      {/* Net Score */}
      <div
        className="font-mono text-xs font-bold text-white px-1 text-center min-w-[2.2rem]"
        title={`Citizen votes: +${upvotes} agree / -${downvotes} disagree`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto text-emerald-400" />
        ) : (
          (score > 0 ? `+${score}` : `${score}`)
        )}
      </div>

      {/* Refute (Downvote) */}
      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        aria-label="Disagree / Works as intended"
        className={`p-1.5 rounded-xl transition-all duration-200 ${
          activeVote === -1
            ? "text-rose-300 bg-rose-500/30 border border-rose-400/50"
            : "text-white/60 hover:text-rose-300 hover:bg-white/10"
        }`}
        title="Works as intended / Disagree (-1)"
      >
        <ArrowBigDown className={`w-5 h-5 ${activeVote === -1 ? "fill-rose-400" : ""}`} />
      </button>

      {/* Rate limit warning */}
      {errorMessage && (
        <div className="absolute top-full left-0 z-30 mt-2 whitespace-nowrap rounded-xl bg-black/90 backdrop-blur-md border border-rose-500/50 text-[11px] text-white px-3 py-1.5 shadow-xl">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
