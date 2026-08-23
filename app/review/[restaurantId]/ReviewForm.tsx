"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function Star({
  filled,
  onClick,
  label,
}: {
  filled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="p-1 transition-transform hover:scale-110"
    >
      <svg viewBox="0 0 24 24" className="h-9 w-9" aria-hidden="true">
        <path
          d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.57l-5.9 3.11 1.13-6.58L2.45 9.44l6.6-.96z"
          fill={filled ? "#c2410c" : "none"}
          stroke={filled ? "#c2410c" : "#a8a29e"}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function ReviewForm({
  restaurantId,
  restaurantName,
}: {
  restaurantId: number;
  restaurantName: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = rating !== null && comment.trim().length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, rating, comment }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setSubmitting(false);
      return;
    }

    router.push(`/restaurant/${restaurantId}`);
  }

  return (
    <main className="min-h-screen bg-[#fafaf9] text-[#1c1917]">
      <div className="mx-auto max-w-[560px] px-6 py-16">
        <p className="text-xs uppercase tracking-wide text-stone-400">
          Writing a review for
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {restaurantName}
        </h1>

        <form onSubmit={handleSubmit} className="mt-12 space-y-10">
          <fieldset>
            <legend className="text-sm font-medium">Your rating</legend>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  filled={(rating ?? 0) >= n}
                  onClick={() => setRating(n)}
                  label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                />
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium"
            >
              Your comment
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think?"
              className="mt-3 w-full resize-none rounded-lg border border-stone-300 bg-white p-3 text-sm leading-relaxed outline-none focus:border-[#c2410c]"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg py-3 text-sm font-medium transition-colors enabled:bg-[#1c1917] enabled:text-[#fafaf9] enabled:hover:bg-black disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </form>
      </div>
    </main>
  );
}
