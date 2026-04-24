import { pgTable, serial, text, integer, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leaderboardTable = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  nick: text("nick").notNull(),
  score: integer("score").notNull(),
  date: bigint("date", { mode: "number" }).notNull(),
});

export const insertLeaderboardSchema = createInsertSchema(leaderboardTable).omit({ id: true });
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type LeaderboardEntry = typeof leaderboardTable.$inferSelect;
