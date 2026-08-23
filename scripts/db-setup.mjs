import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const statements = (file) =>
  readFileSync(join("db", file), "utf8")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

async function main() {
  const sql = neon(process.env.DATABASE_URL);

  await sql.query(`DROP TABLE IF EXISTS reviews`);
  await sql.query(`DROP TABLE IF EXISTS restaurants`);

  for (const s of statements("schema.sql")) {
    await sql.query(s);
  }
  for (const s of statements("seed.sql")) {
    await sql.query(s);
  }

  const restaurants = await sql.query(`SELECT * FROM restaurants ORDER BY id`);
  const reviews = await sql.query(`SELECT * FROM reviews ORDER BY id`);

  console.log("Table: restaurants");
  console.table(restaurants);
  console.log("Table: reviews");
  console.table(reviews);
}

main().catch((err) => {
  console.error("db:setup failed:", err.message);
  process.exit(1);
});
