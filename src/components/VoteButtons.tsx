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
      // Revert optimistic updates on failure
      setScore(score);
      setUpvotes(upvotes);
      setDownvotes(downvotes);
      setActiveVote(activeVote);
      setErrorMessage(err instanceof Error ? err.message : "Vote processing error.");
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const isVertical = orientation === "vertical";

  return (
    <div
      className={`relative inline-flex items-center ${
        isVertical
          ? "flex-col bg-[#F7F3E9] p-1.5 rounded-[2px] border border-[#DCD4C3]"
          : "flex-row gap-2 bg-[#F7F3E9] px-2 py-1 rounded-[2px] border border-[#DCD4C3]"
      }`}
    >
      {/* Upvote Button */}
      <button
        type="button"
        onClick={() => handleVote(1)}
        disabled={isLoading}
        aria-label="Concur with grievance petition"
        title="Concur with this grievance petition"
        className={`p-1.5 rounded-lg transition-all duration-200 active:scale-90 hover:-translate-y-0.5 cursor-pointer ${
          activeVote === 1
            ? "bg-[#244638] text-[#FFFCF5] shadow-sm"
            : "text-[#6D7065] hover:text-[#244638] hover:bg-[#EFE9DA]"
        }`}
      >
        <ArrowBigUp className="w-5 h-5 fill-current" />
      </button>

      {/* Net Score Display */}
      <div
        className={`font-mono text-xs font-bold px-1 select-none transition-transform duration-200 ${
          score > 0
            ? "text-[#244638]"
            : score < 0
            ? "text-[#8B302B]"
            : "text-[#6D7065]"
        }`}
        title={`Docket Score: ${score} (${upvotes} concurring, ${downvotes} dissenting)`}
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto text-[#6D7065]" /> : score}
      </div>

      {/* Downvote Button */}
      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        aria-label="Dissent from grievance petition"
        title="Dissent from this grievance petition"
        className={`p-1.5 rounded-lg transition-all duration-200 active:scale-90 hover:translate-y-0.5 cursor-pointer ${
          activeVote === -1
            ? "bg-[#8B302B] text-[#FFFCF5] shadow-sm"
            : "text-[#6D7065] hover:text-[#8B302B] hover:bg-[#EFE9DA]"
        }`}
      >
        <ArrowBigDown className="w-5 h-5 fill-current" />
      </button>

      {/* Ephemeral Error Notification */}
      {errorMessage && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-20 whitespace-nowrap bg-[#8B302B] text-white text-[10px] font-mono px-2 py-0.5 rounded-[2px] shadow-md pointer-events-none">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
