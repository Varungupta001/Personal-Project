import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type ReviewRow = {
  id: number;
  rating: number;
  comment: string;
  created_at: Date;
};

function toApiReview(row: ReviewRow) {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sql = getDb();
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId)) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const restaurants = (await sql`SELECT name, cuisine, area FROM restaurants WHERE id = ${restaurantId}`) as Array<{
    name: string;
    cuisine: string;
    area: string;
  }>;
  if (restaurants.length === 0) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }
  const restaurant = restaurants[0];

  const aggregates = (await sql`SELECT AVG(rating) AS average_rating, COUNT(*)::int AS total_reviews
              FROM reviews
              WHERE restaurant_id = ${restaurantId}`) as Array<{
    average_rating: number | null;
    total_reviews: number;
  }>;
  const totalReviews = aggregates[0].total_reviews;

  const reviewRows =
    await sql`SELECT id, rating, comment, created_at
              FROM reviews
              WHERE restaurant_id = ${restaurantId}
              ORDER BY created_at DESC`;

  if (reviewRows.length === 0) {
    return NextResponse.json({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      area: restaurant.area,
      averageRating: null,
      totalReviews: 0,
      latestReview: null,
      reviews: [],
    });
  }

  const averageRating =
    Math.round(Number(aggregates[0].average_rating) * 10) / 10;

  const [latest, ...older] = reviewRows as ReviewRow[];

  return NextResponse.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating,
    totalReviews,
    latestReview: toApiReview(latest),
    reviews: older.map(toApiReview),
  });
}
