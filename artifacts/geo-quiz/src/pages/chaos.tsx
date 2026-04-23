import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useCountries, useGeoJson, type Country } from "@/lib/countries";
import { useChaos } from "@/hooks/use-chaos";
import type { GameMode } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CountryMap } from "@/components/country-map";
import { ArrowLeft, Loader2, Check, X, Heart, Flame, Trophy, Zap } from "lucide-react";
import { getFactRu } from "@/lib/facts";
import { recallNick, rememberNick, saveScore, loadLeaderboard, type LeaderboardEntry } from "@/lib/leaderboard";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MODE_LABELS: Record<GameMode, string> = {
  flag_to_country: "Угадай страну по флагу",
  country_to_capital: "Угадай столицу",
  country_to_flag: "Угадай флаг страны",
  capital_to_country: "Угадай страну по столице",
};

export default function Chaos() {
  const [, setLocation] = useLocation();
  const { data: countries, isLoading } = useCountries();
  const { data: geoJson } = useGeoJson();

  const [nick, setNick] = useState(recallNick());
  const [phase, setPhase] = useState<"intro" | "playing" | "over">("intro");
  const [savedRank, setSavedRank] = useState<number | null>(null);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);

  const chaos = useChaos(countries);

  // Auto-end → save score
  useEffect(() => {
    if (chaos.isOver && phase === "playing") {
      const list = saveScore({ nick: nick.trim() || "Игрок", score: chaos.score });
      setBoard(list);
      const idx = list.findIndex(
        (e) => e.nick === (nick.trim() || "Игрок") && e.score === chaos.score,
      );
      setSavedRank(idx >= 0 ? idx + 1 : null);
      setPhase("over");
    }
  }, [chaos.isOver, chaos.score, nick, phase]);

  if (isLoading || !countries) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 space-y-4">
        <div className="p-4 rounded-2xl bg-primary/10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground">Готовим хаос…</p>
      </div>
    );
  }

  // ───── Intro: nickname entry ─────
  if (phase === "intro") {
    return (
      <div className="min-h-[100dvh] w-full max-w-md mx-auto flex flex-col p-6 pt-10">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className="p-4 rounded-2xl bg-rose-500/15 text-rose-600">
            <Flame className="w-10 h-10" strokeWidth={1.75} />
          </div>
          <h1 className="text-4xl font-serif font-bold">Хаос</h1>
          <p className="text-muted-foreground max-w-xs">
            Случайные вопросы из всех режимов. Три жизни. Играй на счёт и
            попади в таблицу лидеров.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card className="border-card-border">
            <CardContent className="flex flex-col items-center p-3 gap-1.5">
              <Heart className="w-5 h-5 text-rose-500" />
              <div className="text-xs text-muted-foreground">3 жизни</div>
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardContent className="flex flex-col items-center p-3 gap-1.5">
              <Zap className="w-5 h-5 text-amber-500" />
              <div className="text-xs text-muted-foreground">+10 за ответ</div>
            </CardContent>
          </Card>
          <Card className="border-card-border">
            <CardContent className="flex flex-col items-center p-3 gap-1.5">
              <Flame className="w-5 h-5 text-orange-500" />
              <div className="text-xs text-muted-foreground">Бонус за серию</div>
            </CardContent>
          </Card>
        </div>

        <label className="text-sm font-medium text-muted-foreground mb-2">
          Твой ник
        </label>
        <input
          type="text"
          value={nick}
          maxLength={20}
          onChange={(e) => setNick(e.target.value)}
          placeholder="Например, ГеоВанна"
          className="w-full h-14 px-4 rounded-xl border border-input bg-card text-foreground text-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition mb-4"
        />

        <Button
          size="lg"
          className="w-full h-14 text-lg rounded-xl shadow-sm"
          disabled={nick.trim().length === 0}
          onClick={() => {
            const n = nick.trim();
            rememberNick(n);
            chaos.start();
            setPhase("playing");
          }}
        >
          В бой
        </Button>

        <Link href="/leaderboard">
          <Button variant="ghost" className="w-full h-12 mt-3 rounded-xl text-muted-foreground">
            <Trophy className="w-4 h-4 mr-2" />
            Таблица лидеров
          </Button>
        </Link>
      </div>
    );
  }

  // ───── Game over ─────
  if (phase === "over") {
    return (
      <div className="min-h-[100dvh] w-full max-w-md mx-auto flex flex-col p-6 pt-10 pb-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="p-4 rounded-2xl bg-amber-500/15 text-amber-600">
            <Trophy className="w-10 h-10" strokeWidth={1.75} />
          </div>
          <h1 className="text-3xl font-serif font-bold">Раунд окончен</h1>
          {savedRank && savedRank <= 10 && (
            <div className="text-sm text-primary font-semibold">
              Ты в топ-10! Место #{savedRank}
            </div>
          )}
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-5 mb-6 text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Очки</div>
          <div className="text-5xl font-bold text-primary mt-1">{chaos.score}</div>
          <div className="text-sm text-muted-foreground mt-2">
            Лучшая серия: <span className="font-semibold text-foreground">{chaos.bestStreak}</span>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Таблица лидеров
        </h2>
        <div className="flex-1 space-y-2 mb-6">
          {board.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">Пока пусто</div>
          )}
          {board.slice(0, 10).map((e, i) => {
            const isMe = i + 1 === savedRank;
            return (
              <div
                key={`${e.nick}-${e.date}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border",
                  isMe
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card border-card-border",
                )}
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
                <div className="flex-1 min-w-0 truncate font-medium">{e.nick}</div>
                <div className="font-bold text-primary tabular-nums">{e.score}</div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full h-14 text-lg rounded-xl shadow-sm"
            onClick={() => {
              chaos.start();
              setPhase("playing");
              setSavedRank(null);
            }}
          >
            Ещё раз
          </Button>
          <Link href="/">
            <Button variant="secondary" className="w-full h-14 text-lg rounded-xl">
              На главную
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ───── Playing ─────
  if (!chaos.question) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const { question, selected } = chaos;
  const { correctCountry, options, mode } = question;
  const answered = !!selected;

  const optionStyle = (opt: Country) => {
    if (!selected) return "bg-card hover:bg-accent/10 border-border cursor-pointer hover-elevate";
    if (opt.cca3 === correctCountry.cca3)
      return "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400 font-semibold";
    if (selected.cca3 === opt.cca3)
      return "bg-destructive/10 border-destructive text-destructive font-semibold";
    return "bg-card border-border opacity-50";
  };

  const renderQuestion = () => {
    switch (mode) {
      case "flag_to_country":
        return (
          <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-56 aspect-[3/2] rounded-lg shadow-md overflow-hidden bg-white ring-1 ring-border flex items-center justify-center">
              <img src={correctCountry.flagUrl} alt="Флаг" className="w-full h-full object-contain" loading="eager" />
            </div>
            <div className="w-full grid grid-cols-1 gap-3">
              {options.map((opt) => (
                <Card key={opt.cca3} className={cn("transition-all duration-300", optionStyle(opt))} onClick={() => chaos.handleSelect(opt)}>
                  <CardContent className="p-4 flex items-center justify-center gap-3 text-lg">
                    {selected && (
                      <div className="w-9 h-6 rounded-sm overflow-hidden bg-white ring-1 ring-border flex-shrink-0 flex items-center justify-center">
                        <img src={opt.flagUrlSmall} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <span>{opt.nameRu}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case "country_to_capital":
        return (
          <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-serif font-bold text-center">{correctCountry.nameRu}</h2>
            <div className="w-full grid grid-cols-1 gap-3">
              {options.map((opt) => (
                <Card key={opt.cca3} className={cn("transition-all duration-300", optionStyle(opt))} onClick={() => chaos.handleSelect(opt)}>
                  <CardContent className="p-4 text-center">
                    <div className="text-lg">{opt.capitalRu}</div>
                    {selected && (
                      <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                        <img src={opt.flagUrlSmall} alt="" className="w-4 h-3 object-contain" />
                        <span>{opt.nameRu}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case "country_to_flag":
        return (
          <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-serif font-bold text-center">{correctCountry.nameRu}</h2>
            <div className="w-full grid grid-cols-2 gap-4">
              {options.map((opt) => {
                const isCorrect = opt.cca3 === correctCountry.cca3;
                const isPicked = selected?.cca3 === opt.cca3;
                return (
                  <button
                    key={opt.cca3}
                    onClick={() => chaos.handleSelect(opt)}
                    disabled={answered}
                    className={cn(
                      "relative rounded-xl overflow-hidden bg-muted transition-all duration-300 outline-none",
                      !answered && "ring-2 ring-border hover:ring-primary/50 cursor-pointer hover-elevate",
                      answered && isCorrect && "ring-4 ring-green-500 scale-[1.03] shadow-lg shadow-green-500/30",
                      answered && !isCorrect && isPicked && "ring-4 ring-red-500 scale-[0.97] shadow-lg shadow-red-500/30",
                      answered && !isCorrect && !isPicked && "ring-2 ring-border opacity-40 grayscale",
                    )}
                  >
                    <div className="aspect-[3/2] w-full bg-white flex items-center justify-center">
                      <img src={opt.flagUrl} alt="Флаг" className="w-full h-full object-contain" loading="eager" />
                    </div>
                    {answered && (
                      <div className="px-2 py-1.5 text-sm font-medium bg-card text-card-foreground border-t border-border text-center truncate">
                        {opt.nameRu}
                      </div>
                    )}
                    {answered && isCorrect && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500/30">
                        <div className="rounded-full bg-green-500 p-2 shadow-lg">
                          <Check className="w-7 h-7 text-white" strokeWidth={3} />
                        </div>
                      </div>
                    )}
                    {answered && !isCorrect && isPicked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500/30">
                        <div className="rounded-full bg-red-500 p-2 shadow-lg">
                          <X className="w-7 h-7 text-white" strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      case "capital_to_country":
        return (
          <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-serif font-bold text-center">{correctCountry.capitalRu}</h2>
            <div className="w-full grid grid-cols-1 gap-3">
              {options.map((opt) => (
                <Card key={opt.cca3} className={cn("transition-all duration-300", optionStyle(opt))} onClick={() => chaos.handleSelect(opt)}>
                  <CardContent className="p-4 flex items-center justify-center gap-3">
                    {selected && (
                      <div className="w-9 h-6 rounded-sm overflow-hidden bg-white ring-1 ring-border flex-shrink-0 flex items-center justify-center">
                        <img src={opt.flagUrlSmall} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-lg leading-tight">{opt.nameRu}</div>
                      {selected && (
                        <div className="text-xs text-muted-foreground mt-0.5">столица — {opt.capitalRu}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
    }
  };

  const fact = getFactRu(correctCountry.cca3);
  const description = `${correctCountry.nameRu} — страна в регионе ${correctCountry.regionRu}. Столица — ${correctCountry.capitalRu}.${fact ? ` ${fact}` : ""}`;

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto flex flex-col p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pt-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center min-w-0">
          <div className="text-xs font-medium text-rose-500 uppercase tracking-wider flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5" /> Хаос
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[180px]">
            {MODE_LABELS[mode]}
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: chaos.maxLives }).map((_, i) => (
            <Heart
              key={i}
              className={cn(
                "w-5 h-5 transition-all",
                i < chaos.lives ? "text-rose-500 fill-rose-500" : "text-muted-foreground/30",
              )}
            />
          ))}
        </div>
      </div>

      {/* Score row */}
      <div className="flex items-center justify-between gap-2 mb-6 px-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-primary tabular-nums">{chaos.score}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">очков</span>
        </div>
        {chaos.streak >= 2 && (
          <div className="flex items-center gap-1 text-amber-600 text-sm font-semibold animate-in fade-in zoom-in">
            <Flame className="w-4 h-4" />
            серия ×{chaos.streak}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {renderQuestion()}

        {selected && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-8">
            <div className="bg-secondary/50 rounded-xl p-5 border border-secondary text-secondary-foreground leading-relaxed shadow-sm">
              {description}
            </div>
            <div className="rounded-xl overflow-hidden border border-border shadow-sm">
              <CountryMap country={correctCountry} geoJson={geoJson} neighbors={[]} />
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-10 flex justify-center">
          <div className="w-full max-w-md">
            <Button
              size="lg"
              className="w-full h-14 text-lg rounded-xl shadow-lg"
              onClick={chaos.advance}
            >
              {chaos.lives - (selected.cca3 === correctCountry.cca3 ? 0 : 1) <= 0 ? "Завершить" : "Дальше"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
