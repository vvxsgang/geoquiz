import { useCallback, useState } from "react";
import type { Country } from "../lib/countries";
import type { GameMode } from "./use-game";

const ALL_MODES: GameMode[] = [
  "flag_to_country",
  "country_to_capital",
  "country_to_flag",
  "capital_to_country",
];

export interface ChaosQuestion {
  mode: GameMode;
  correctCountry: Country;
  options: Country[];
}

const STARTING_LIVES = 3;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildQuestion(countries: Country[]): ChaosQuestion {
  const mode = pickRandom(ALL_MODES);
  const correct = pickRandom(countries);
  const wrong: Country[] = [];
  const used = new Set<string>([correct.cca3]);
  while (wrong.length < 3) {
    const c = pickRandom(countries);
    if (used.has(c.cca3)) continue;
    used.add(c.cca3);
    wrong.push(c);
  }
  const options = [correct, ...wrong].sort(() => Math.random() - 0.5);
  return { mode, correctCountry: correct, options };
}

export function useChaos(countries: Country[] | undefined) {
  const [question, setQuestion] = useState<ChaosQuestion | null>(null);
  const [next, setNext] = useState<ChaosQuestion | null>(null);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState<Country | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [started, setStarted] = useState(false);

  const start = useCallback(() => {
    if (!countries || countries.length < 4) return;
    const first = buildQuestion(countries);
    const second = buildQuestion(countries);
    setQuestion(first);
    setNext(second);
    setLives(STARTING_LIVES);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelected(null);
    setIsOver(false);
    setStarted(true);

    // Preload flags
    const seen = new Set<string>();
    for (const q of [first, second]) {
      for (const opt of [q.correctCountry, ...q.options]) {
        if (seen.has(opt.cca3)) continue;
        seen.add(opt.cca3);
        const img = new Image();
        img.src = opt.flagUrl;
      }
    }
  }, [countries]);

  const handleSelect = (option: Country) => {
    if (selected || !question) return;
    setSelected(option);
    if (option.cca3 === question.correctCountry.cca3) {
      // Score: base 10 + streak bonus
      setScore((s) => s + 10 + Math.min(streak, 10));
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
    } else {
      setLives((l) => l - 1);
      setStreak(0);
    }
  };

  const advance = () => {
    if (!countries || !question) return;
    const wasCorrect = selected?.cca3 === question.correctCountry.cca3;
    const newLives = wasCorrect ? lives : lives - 1 < 0 ? 0 : lives;
    if (newLives <= 0) {
      setIsOver(true);
      setSelected(null);
      return;
    }
    // Slide to prefetched next, then preload one more
    const upcoming = next ?? buildQuestion(countries);
    const after = buildQuestion(countries);
    setQuestion(upcoming);
    setNext(after);
    setSelected(null);

    const seen = new Set<string>();
    for (const opt of [after.correctCountry, ...after.options]) {
      if (seen.has(opt.cca3)) continue;
      seen.add(opt.cca3);
      const img = new Image();
      img.src = opt.flagUrl;
    }
  };

  return {
    started,
    question,
    lives,
    maxLives: STARTING_LIVES,
    score,
    streak,
    bestStreak,
    selected,
    isOver,
    start,
    handleSelect,
    advance,
  };
}
