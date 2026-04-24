import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import { loadLeaderboard, type LeaderboardEntry } from "@/lib/leaderboard";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
function formatDate(ts: number) {
  try {
    return new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}
export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadLeaderboard().then((data) => {
      setBoard(data);
      setLoading(false);
    });
  }, []);
  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto flex flex-col p-6 pt-10 pb-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="flex-1 text-center text-xl font-serif font-bold">Таблица лидеров</h1>
        <div className="w-10" />
      </div>
      <div className="flex flex-col items-center text-center mb-6">
        <div className="p-4 rounded-2xl bg-amber-500/15 text-amber-600 mb-3">
          <Trophy className="w-8 h-8" strokeWidth={1.75} />
        </div>
        <p className="text-sm text-muted-foreground">
          Лучшие результаты в режиме «Хаос»
        </p>
      </div>
      <div className="flex-1 space-y-2">
        {loading && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        )}
        {!loading && board.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">Пока никто не играл в Хаос</p>
            <Link href="/chaos">
              <Button>Сыграть первым</Button>
            </Link>
          </div>
        )}
        {board.map((e, i) => (
          <div
            key={`${e.nick}-${e.date}`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-card-border bg-card"
          >
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                i === 0 && "bg-amber-400 text-white",
                i === 1 && "bg-slate-300 text-slate-700",
                i === 2 && "bg-orange-400 text-white",
                i > 2 && "bg-muted text-muted-foreground",
              )}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{e.nick}</div>
              <div className="text-xs text-muted-foreground">{formatDate(e.date)}</div>
            </div>
            <div className="font-bold text-primary tabular-nums text-lg">{e.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
