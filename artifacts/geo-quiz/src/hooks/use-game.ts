import { useState, useMemo } from "react";
import { Country } from "../lib/countries";

export type GameMode = "flag_to_country" | "country_to_capital" | "country_to_flag" | "capital_to_country";

export interface Question {
  correctCountry: Country;
  options: Country[];
}

export function useGame(countries: Country[] | undefined, mode: GameMode) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Country | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const initGame = () => {
    if (!countries || countries.length < 4) return;
    
    const newQuestions: Question[] = [];
    const numQuestions = 10;
    
    // Select 10 random correct countries
    const shuffled = [...countries].sort(() => 0.5 - Math.random());
    const selectedCountries = shuffled.slice(0, numQuestions);
    
    for (const correctCountry of selectedCountries) {
      // Pick 3 wrong options
      let wrongOptions = countries.filter(c => c.cca3 !== correctCountry.cca3);
      wrongOptions = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const options = [correctCountry, ...wrongOptions].sort(() => 0.5 - Math.random());
      
      newQuestions.push({
        correctCountry,
        options,
      });
    }
    
    setQuestions(newQuestions);
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsGameOver(false);

    // Preload all flag images for the round so they appear instantly
    const seen = new Set<string>();
    for (const q of newQuestions) {
      for (const opt of [q.correctCountry, ...q.options]) {
        if (seen.has(opt.cca3)) continue;
        seen.add(opt.cca3);
        const img = new Image();
        img.src = opt.flagUrl;
      }
    }
  };

  const handleSelect = (option: Country) => {
    if (selectedOption) return; // Prevent multiple clicks
    
    setSelectedOption(option);
    if (option.cca3 === questions[currentIdx].correctCountry.cca3) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) {
      setIsGameOver(true);
    } else {
      setCurrentIdx(i => i + 1);
      setSelectedOption(null);
    }
  };

  return {
    questions,
    currentIdx,
    score,
    selectedOption,
    isGameOver,
    initGame,
    handleSelect,
    nextQuestion,
    currentQuestion: questions[currentIdx],
  };
}
