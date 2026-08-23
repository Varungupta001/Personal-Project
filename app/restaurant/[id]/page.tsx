"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { RestaurantPageData, ApiReview } from "@/lib/types";

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
          <path
            d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.57l-5.9 3.11 1.13-6.58L2.45 9.44l6.6-.96z"
            fill={n <= rating ? "#c2410c" : "#e7e5e4"}
          />
        </svg>
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function ReviewBody({ review }: { review: ApiReview }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <StarRow rating={review.rating} />
        <span className="text-xs text-stone-400">
          {formatDate(review.createdAt)}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>
    </>
  );
}

export default function RestaurantPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<RestaurantPageData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${params.id}`)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        setData(await res.json());
      })
      .catch(() => setNotFound(true));
  }, [params.id]);

  if (notFound) {
    return (
      <main className="min-h-screen bg-[#fafaf9] text-[#1c1917]">
        <div className="mx-auto max-w-[560px] px-6 py-16">
          <p className="text-sm text-stone-500">
            No restaurant exists at this address.
          </p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#fafaf9] text-[#1c1917]">
        <div className="mx-auto max-w-[560px] px-6 py-16">
          <p className="text-sm text-stone-400">Loading…</p>
        </div>
      </main>
    );
  }

  const hasReviews = data.totalReviews > 0;

  return (
    <main className="min-h-screen bg-[#fafaf9] text-[#1c1917]">
      <div className="mx-auto max-w-[560px] px-6 py-16 space-y-12">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {data.cuisine} · {data.area}
          </p>
        </header>

        {hasReviews ? (
          <>
            <section className="flex items-baseline gap-3">
              <span className="text-[72px] font-semibold leading-none tracking-tight">
                {data.averageRating}
              </span>
              <span className="text-sm text-stone-500">
                {data.totalReviews}{" "}
                {data.totalReviews === 1 ? "review" : "reviews"}
              </span>
            </section>

            <section>
              <p className="text-xs font-medium uppercase tracking-wide text-[#c2410c]">
                Latest
              </p>
              <div className="mt-3 rounded-xl border border-stone-200 bg-white p-5">
                <ReviewBody review={data.latestReview!} />
              </div>
            </section>

            {data.reviews.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-stone-500">
                  Earlier reviews
                </h2>
                <ul className="mt-2 divide-y divide-stone-200">
                  {data.reviews.map((r) => (
                    <li key={r.id} className="py-4">
                      <ReviewBody review={r} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <section className="rounded-xl border border-dashed border-stone-300 p-8 text-center">
            <p className="text-sm font-medium">No reviews yet</p>
            <p className="mt-1 text-sm text-stone-500">
              Be the first to share what you thought.
            </p>
          </section>
        )}

        <footer>
          <Link
            href={`/review/${params.id}`}
            className="inline-block rounded-lg bg-[#1c1917] px-5 py-3 text-sm font-medium text-[#fafaf9] transition-colors hover:bg-black"
          >
            Write a review
          </Link>
        </footer>
      </div>
    </main>
  );
}
