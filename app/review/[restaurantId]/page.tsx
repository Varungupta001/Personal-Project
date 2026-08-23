import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import ReviewForm from "./ReviewForm";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const id = Number(restaurantId);

  const sql = getDb();
  const rows = (await sql`SELECT name FROM restaurants WHERE id = ${id}`) as Array<{ name: string }>;
  if (rows.length === 0) {
    notFound();
  }

  return (
    <ReviewForm restaurantId={id} restaurantName={rows[0].name} />
  );
}
