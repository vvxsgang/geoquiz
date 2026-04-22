import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function Result() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const score = parseInt(searchParams.get("score") || "0", 10);
  const total = parseInt(searchParams.get("total") || "10", 10);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="bg-accent/20 p-6 rounded-full text-accent mb-4">
        <Trophy className="w-16 h-16" />
      </div>
      
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif font-bold">Результат</h1>
        <p className="text-lg text-muted-foreground">
          Вы ответили правильно на
        </p>
        <div className="text-5xl font-bold text-primary py-4">
          {score} из {total}
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4 pt-8">
        <Button className="w-full h-14 text-lg rounded-xl" asChild>
          <button onClick={() => window.history.back()}>Играть ещё раз</button>
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
