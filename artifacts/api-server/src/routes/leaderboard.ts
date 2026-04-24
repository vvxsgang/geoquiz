import { Router } from "express";
import { db } from "../lib/db";
import { leaderboardTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";

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

    // Ищем существующий результат для этого ника
    const existing = await db
      .select()
      .from(leaderboardTable)
      .where(eq(leaderboardTable.nick, nick))
      .limit(1);

    if (existing.length > 0) {
      // Обновляем только если новый результат лучше
      if (score > existing[0].score) {
        await db
          .update(leaderboardTable)
          .set({ score, date: date ?? Date.now() })
          .where(eq(leaderboardTable.nick, nick));
      }
    } else {
      // Новый ник — добавляем
      await db
        .insert(leaderboardTable)
        .values({ nick, score, date: date ?? Date.now() });
    }

    const entries = await db
      .select()
      .from(leaderboardTable)
      .orderBy(desc(leaderboardTable.score))
      .limit(50);

    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to save score" });
  }
});

export default router;
