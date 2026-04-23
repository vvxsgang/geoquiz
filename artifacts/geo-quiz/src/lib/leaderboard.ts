export interface LeaderboardEntry {
  nick: string;
  score: number;
  date: number;
}

const STORAGE_KEY = "geo-quiz:leaderboard:chaos:v1";
const NICK_KEY = "geo-quiz:nick";
const MAX_ENTRIES = 50;

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is LeaderboardEntry =>
          typeof e?.nick === "string" &&
          typeof e?.score === "number" &&
          typeof e?.date === "number",
      )
      .sort((a, b) => b.score - a.score || a.date - b.date)
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function saveScore(entry: Omit<LeaderboardEntry, "date">): LeaderboardEntry[] {
  const list = loadLeaderboard();
  const next: LeaderboardEntry = { ...entry, date: Date.now() };
  list.push(next);
  list.sort((a, b) => b.score - a.score || a.date - b.date);
  const trimmed = list.slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore quota / privacy errors
  }
  return trimmed;
}

export function clearLeaderboard() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function rememberNick(nick: string) {
  try {
    localStorage.setItem(NICK_KEY, nick);
  } catch {
    /* noop */
  }
}

export function recallNick(): string {
  try {
    return localStorage.getItem(NICK_KEY) || "";
  } catch {
    return "";
  }
}
