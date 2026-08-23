import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import ReviewForm from "./ReviewForm";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const id = Number(restaurantId);

  const rows = await sql`SELECT name FROM restaurants WHERE id = ${id}`;
  if (rows.length === 0) {
    notFound();
  }

  return (
    <ReviewForm restaurantId={id} restaurantName={rows[0].name} />
  );
}
