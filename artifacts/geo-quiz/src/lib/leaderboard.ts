export interface LeaderboardEntry {
  nick: string;
  score: number;
  date: number;
}

const API_URL = import.meta.env.VITE_API_URL ?? "";
const NICK_KEY = "geo-quiz:nick";

export async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${API_URL}/api/leaderboard`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function saveScore(entry: Omit<LeaderboardEntry, "date">): Promise<LeaderboardEntry[]> {
  try {
    await fetch(`${API_URL}/api/leaderboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...entry, date: Date.now() }),
    });
    return await loadLeaderboard();
  } catch {
    return [];
  }
}

export async function clearLeaderboard(): Promise<void> {
  // локальная очистка больше не нужна
}

export function rememberNick(nick: string) {
  try {
    localStorage.setItem(NICK_KEY, nick);
  } catch {}
}

export function recallNick(): string {
  try {
    return localStorage.getItem(NICK_KEY) || "";
  } catch {
    return "";
  }
}
