import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useCountries, useGeoJson, type Country } from "@/lib/countries";
import { useGame, type GameMode } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CountryMap } from "@/components/country-map";
import { ArrowLeft, Loader2, Check, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const modeTitles: Record<GameMode, string> = {
  flag_to_country: "Угадай страну",
  country_to_capital: "Угадай столицу",
  country_to_flag: "Угадай флаг",
  capital_to_country: "Угадай страну",
};

export default function Play() {
  const { mode } = useParams<{ mode: string }>();
  const validMode = (mode as GameMode) || "flag_to_country";
  const [, setLocation] = useLocation();

  const { data: countries, isLoading, isError, refetch } = useCountries();
  const { data: geoJson } = useGeoJson();

  const {
    questions,
    currentIdx,
    score,
    selectedOption,
    isGameOver,
    initGame,
    handleSelect,
    nextQuestion,
    currentQuestion,
  } = useGame(countries, validMode);

  useEffect(() => {
    if (countries && questions.length === 0) {
      initGame();
    }
  }, [countries, questions.length, initGame]);

  useEffect(() => {
    if (isGameOver) {
      setLocation(`/result?score=${score}&total=${questions.length}`);
    }
  }, [isGameOver, score, questions.length, setLocation]);

  if (isLoading || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Загрузка вопросов...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 space-y-4 text-center">
        <p className="text-destructive font-medium">Ошибка загрузки данных</p>
        <Button onClick={() => refetch()}>Повторить</Button>
        <Button variant="outline" onClick={() => setLocation("/")}>На главную</Button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const { correctCountry, options } = currentQuestion;

  const getOptionStyle = (option: Country) => {
    if (!selectedOption) return "bg-card hover:bg-accent/10 border-border cursor-pointer hover-elevate";
    
    if (option.cca3 === correctCountry.cca3) {
      return "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400 font-semibold";
    }
    
    if (selectedOption.cca3 === option.cca3) {
      return "bg-destructive/10 border-destructive text-destructive font-semibold";
    }
    
    return "bg-card border-border opacity-50";
  };

  const renderQuestionContent = () => {
    switch (validMode) {
      case "flag_to_country":
        return (
          <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-56 aspect-[3/2] rounded-lg shadow-md overflow-hidden bg-white ring-1 ring-border flex items-center justify-center">
              <img
                src={correctCountry.flagUrl}
                alt="Флаг"
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
            <div className="w-full grid grid-cols-1 gap-3">
              {options.map((opt) => (
                <Card 
                  key={opt.cca3}
                  className={cn("transition-all duration-300", getOptionStyle(opt))}
                  onClick={() => handleSelect(opt)}
                >
                  <CardContent className="p-4 flex items-center justify-center gap-3 text-lg">
                    {selectedOption && (
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
                <Card 
                  key={opt.cca3}
                  className={cn("transition-all duration-300", getOptionStyle(opt))}
                  onClick={() => handleSelect(opt)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-lg">{opt.capitalRu}</div>
                    {selectedOption && (
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
                const isPicked = selectedOption?.cca3 === opt.cca3;
                const answered = !!selectedOption;
                return (
                  <button
                    key={opt.cca3}
                    onClick={() => handleSelect(opt)}
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
                <Card 
                  key={opt.cca3}
                  className={cn("transition-all duration-300", getOptionStyle(opt))}
                  onClick={() => handleSelect(opt)}
                >
                  <CardContent className="p-4 flex items-center justify-center gap-3">
                    {selectedOption && (
                      <div className="w-9 h-6 rounded-sm overflow-hidden bg-white ring-1 ring-border flex-shrink-0 flex items-center justify-center">
                        <img src={opt.flagUrlSmall} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-lg leading-tight">{opt.nameRu}</div>
                      {selectedOption && (
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

  const getFeedbackDescription = () => {
    const { nameRu, capitalRu, regionRu, borders } = correctCountry;
    
    let neighborsStr = "";
    if (borders && borders.length > 0) {
      const neighborNames = borders.map(b => {
        const n = countries?.find(c => c.cca3 === b);
        return n ? n.nameRu : null;
      }).filter(Boolean);
      
      if (neighborNames.length > 0) {
        neighborsStr = `, граничит с ${neighborNames.join(", ")}`;
      }
    }

    let prefix = "";
    if (validMode === "flag_to_country") prefix = `Флаг ${nameRu} — `;
    else if (validMode === "country_to_capital") prefix = `Столица ${nameRu} — ${capitalRu}. `;
    else if (validMode === "capital_to_country") prefix = `${capitalRu} — столица ${nameRu}. `;
    else prefix = `${nameRu} — `;

    return `${prefix}${nameRu} находится в ${regionRu}${neighborsStr}. Столица — ${capitalRu}.`;
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto flex flex-col p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {modeTitles[validMode]}
          </div>
          <div className="text-sm font-bold text-primary mt-1">
            {currentIdx + 1} / {questions.length}
          </div>
        </div>
        <div className="w-10" /> {/* Spacer for balance */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {renderQuestionContent()}

        {/* Feedback Panel */}
        {selectedOption && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-8">
            <div className="bg-secondary/50 rounded-xl p-5 border border-secondary text-secondary-foreground leading-relaxed shadow-sm">
              {getFeedbackDescription()}
            </div>
            
            <div className="rounded-xl overflow-hidden border border-border shadow-sm">
              <CountryMap 
                country={correctCountry} 
                geoJson={geoJson} 
                neighbors={(countries || []).filter(c => correctCountry.borders?.includes(c.cca3))} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Next Button pinned to bottom */}
      {selectedOption && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-10 flex justify-center">
          <div className="w-full max-w-md">
            <Button 
              size="lg" 
              className="w-full h-14 text-lg rounded-xl shadow-lg" 
              onClick={nextQuestion}
            >
              {currentIdx + 1 === questions.length ? "Завершить" : "Дальше"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
