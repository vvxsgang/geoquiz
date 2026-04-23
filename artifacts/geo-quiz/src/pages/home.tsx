import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Flag, MapPin, Globe2, BookOpen, Building2, ChevronRight, Flame, Trophy } from "lucide-react";

const modes = [
  {
    href: "/play/flag_to_country",
    title: "Угадай страну",
    sub: "по флагу",
    icon: Flag,
    iconBg: "bg-rose-500/15 text-rose-600",
  },
  {
    href: "/play/country_to_capital",
    title: "Угадай столицу",
    sub: "по стране",
    icon: Building2,
    iconBg: "bg-amber-500/15 text-amber-600",
  },
  {
    href: "/play/country_to_flag",
    title: "Угадай флаг",
    sub: "по стране",
    icon: Globe2,
    iconBg: "bg-teal-500/15 text-teal-600",
  },
  {
    href: "/play/capital_to_country",
    title: "Угадай страну",
    sub: "по столице",
    icon: MapPin,
    iconBg: "bg-violet-500/15 text-violet-600",
  },
];

export default function Home() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center p-6 pt-14 pb-10">
      <div className="text-center space-y-2 mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-3 shadow-sm">
          <Globe2 className="w-9 h-9" strokeWidth={1.75} />
        </div>
        <h1 className="text-5xl font-serif text-primary font-bold tracking-tight">ГеоКвиз</h1>
        <p className="text-muted-foreground text-base">Проверь свои знания о мире</p>
      </div>

      <div className="w-full max-w-md mb-3">
        <Link href="/chaos">
          <Card className="hover-elevate cursor-pointer border-transparent bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md transition-all group">
            <CardContent className="flex items-center p-5 gap-4">
              <div className="p-3 rounded-xl shrink-0 bg-white/20 backdrop-blur-sm">
                <Flame className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg leading-tight">Хаос</h3>
                  <span className="text-[10px] uppercase tracking-wider bg-white/25 px-1.5 py-0.5 rounded font-bold">new</span>
                </div>
                <p className="text-sm text-white/85">3 жизни · все режимы · на счёт</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-0.5 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="w-full max-w-md grid grid-cols-1 gap-3">
        {modes.map(({ href, title, sub, icon: Icon, iconBg }) => (
          <Link key={href} href={href}>
            <Card className="hover-elevate cursor-pointer border-card-border transition-all group">
              <CardContent className="flex items-center p-5 gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${iconBg}`}>
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg leading-tight">{title}</h3>
                  <p className="text-sm text-muted-foreground">{sub}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="w-full max-w-md mt-6 grid grid-cols-2 gap-3">
        <Link href="/learn" className="w-full">
          <Card className="bg-secondary/40 hover:bg-secondary border-transparent cursor-pointer transition-colors h-full">
            <CardContent className="flex items-center justify-center p-4 gap-2">
              <BookOpen className="w-5 h-5 text-secondary-foreground" />
              <span className="font-medium text-secondary-foreground">Изучение</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/leaderboard" className="w-full">
          <Card className="bg-secondary/40 hover:bg-secondary border-transparent cursor-pointer transition-colors h-full">
            <CardContent className="flex items-center justify-center p-4 gap-2">
              <Trophy className="w-5 h-5 text-secondary-foreground" />
              <span className="font-medium text-secondary-foreground">Лидеры</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <p className="mt-auto pt-10 text-xs text-muted-foreground/60 text-center">
        Данные: restcountries.com · flagcdn.com
      </p>
    </div>
  );
}
