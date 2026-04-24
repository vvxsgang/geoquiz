import { Router } from "express";
import { db } from "../lib/db";
import { leaderboardTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const entries = await db
      .select()
      .from(leaderboardTable)
      .orderBy(desc(leaderboardTable.score))
      .limit(50);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

router.post("/leaderboard", async (req, res) => {
  try {
    const { nick, score, date } = req.body;
    if (!nick || typeof score !== "number") {
      return res.status(400).json({ error: "Invalid data" });
    }
    const [entry] = await db
      .insert(leaderboardTable)
      .values({ nick, score, date: date ?? Date.now() })
      .returning();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to save score" });
  }
});

export default router;
