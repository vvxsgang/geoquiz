import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@workspace/db/schema";

const connectionString = process.env["DATABASE_URL"];
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required but was not provided.");
}

export const db = drizzle(connectionString, { schema });
