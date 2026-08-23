import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const { restaurantId, rating, comment } = body as {
    restaurantId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "rating must be a whole number between 1 and 5" },
      { status: 400 }
    );
  }

  if (typeof comment !== "string" || comment.trim().length === 0) {
    return NextResponse.json(
      { error: "comment must be text that is not empty" },
      { status: 400 }
    );
  }

  if (!Number.isInteger(restaurantId)) {
    return NextResponse.json(
      { error: "this restaurant does not exist" },
      { status: 400 }
    );
  }

  const found = await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`;
  if (found.length === 0) {
    return NextResponse.json(
      { error: `restaurant ${restaurantId} does not exist` },
      { status: 400 }
    );
  }

  const inserted =
    await sql`INSERT INTO reviews (restaurant_id, rating, comment)
              VALUES (${restaurantId}, ${rating}, ${comment.trim()})
              RETURNING id`;

  return NextResponse.json(
    { success: true, reviewId: inserted[0].id },
    { status: 201 }
  );
}
