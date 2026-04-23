import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, Heart, ThumbsUp } from "lucide-react";

function getVerdict(pct: number) {
  if (pct === 100) return { label: "Идеально!", desc: "Ты знаешь мир как свои пять пальцев.", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/15" };
  if (pct >= 80) return { label: "Отлично!", desc: "Совсем немного — и идеал.", icon: Sparkles, color: "text-teal-600", bg: "bg-teal-500/15" };
  if (pct >= 50) return { label: "Неплохо", desc: "Можно лучше — попробуй ещё раз.", icon: ThumbsUp, color: "text-violet-600", bg: "bg-violet-500/15" };
  return { label: "Не сдавайся", desc: "Каждый раунд — это шаг к успеху.", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/15" };
}

export default function Result() {
  const searchParams = new URLSearchParams(window.location.search);
  const score = parseInt(searchParams.get("score") || "0", 10);
  const total = parseInt(searchParams.get("total") || "10", 10);
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const v = getVerdict(pct);
  const Icon = v.icon;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 space-y-6 animate-in fade-in zoom-in duration-500">
      <div className={`p-6 rounded-3xl ${v.bg} ${v.color} shadow-sm`}>
        <Icon className="w-16 h-16" strokeWidth={1.75} />
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-4xl font-serif font-bold">{v.label}</h1>
        <p className="text-base text-muted-foreground">{v.desc}</p>
      </div>

      <div className="w-full max-w-xs bg-card border border-card-border rounded-2xl p-6 shadow-sm text-center space-y-3">
        <div className="text-sm text-muted-foreground uppercase tracking-wider">Результат</div>
        <div className="text-5xl font-bold text-primary">
          {score}<span className="text-2xl text-muted-foreground font-normal"> / {total}</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? "bg-teal-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-sm text-muted-foreground">{pct}% правильных ответов</div>
      </div>

      <div className="w-full max-w-sm space-y-3 pt-4">
        <Button className="w-full h-14 text-lg rounded-xl shadow-sm" onClick={() => window.history.back()}>
          Играть ещё раз
        </Button>
        <Link href="/">
          <Button variant="secondary" className="w-full h-14 text-lg rounded-xl">
            Сменить режим
          </Button>
        </Link>
      </div>
    </div>
  );
}
