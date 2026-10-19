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

    // Save previous state for potential rollback
    const prevScore = score;
    const prevUpvotes = upvotes;
    const prevDownvotes = downvotes;
    const prevActive = activeVote;

    // Calculate optimistic state
    let newScore = score;
    let newUp = upvotes;
    let newDown = downvotes;
    let nextActive: 1 | -1 | 0 = targetVote;

    if (activeVote === targetVote) {
      // Toggle off
      nextActive = 0;
      if (targetVote === 1) {
        newUp -= 1;
        newScore -= 1;
      } else {
        newDown -= 1;
        newScore += 1;
      }
    } else if (activeVote === 0) {
      // New vote
      if (targetVote === 1) {
        newUp += 1;
        newScore += 1;
      } else {
        newDown += 1;
        newScore -= 1;
      }
    } else {
      // Vote flip
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
        throw new Error(data.error || "Failed to register voter endorsement.");
      }

      // Sync confirmed totals from server
      if (typeof data.score === "number") {
        setScore(data.score);
        setUpvotes(data.upvotesCount);
        setDownvotes(data.downvotesCount);
        setActiveVote(data.userVote ?? nextActive);
      }
    } catch (err: unknown) {
      // Rollback optimistic state
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
      } bg-parchment-100/90 rounded border border-parchment-300 p-1.5 shadow-subtle`}
    >
      {/* Endorse / Upvote */}
      <button
        type="button"
        onClick={() => handleVote(1)}
        disabled={isLoading}
        aria-label="Endorse planetary complaint"
        className={`p-1 rounded transition-colors ${
          activeVote === 1
            ? "text-emerald-700 bg-emerald-100 font-bold"
            : "text-stone-500 hover:text-emerald-700 hover:bg-stone-200/60"
        }`}
        title="Endorse (Upvote)"
      >
        <ArrowBigUp className={`w-5 h-5 ${activeVote === 1 ? "fill-emerald-600" : ""}`} />
      </button>

      {/* Score */}
      <div
        className="font-mono text-xs font-bold text-institutional-900 px-1 text-center min-w-[2.2rem]"
        title={`Aggregate Citizen Endorsements: +${upvotes} / -${downvotes}`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto text-gold-600" />
        ) : (
          (score > 0 ? `+${score}` : `${score}`)
        )}
      </div>

      {/* Refute / Downvote */}
      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        aria-label="Refute planetary complaint"
        className={`p-1 rounded transition-colors ${
          activeVote === -1
            ? "text-seal-600 bg-rose-100 font-bold"
            : "text-stone-500 hover:text-seal-600 hover:bg-stone-200/60"
        }`}
        title="Refute (Downvote)"
      >
        <ArrowBigDown className={`w-5 h-5 ${activeVote === -1 ? "fill-seal-600" : ""}`} />
      </button>

      {/* Ephemeral Error Notification */}
      {errorMessage && (
        <div className="absolute top-full left-0 z-20 mt-1 whitespace-nowrap rounded bg-seal-800 text-[10px] text-white px-2 py-1 shadow-md">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
