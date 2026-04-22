import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Flag, MapPin, Globe2, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-serif text-primary font-bold tracking-tight">ГеоКвиз</h1>
        <p className="text-muted-foreground text-lg">Проверь свои знания о мире</p>
      </div>

      <div className="w-full max-w-md grid grid-cols-1 gap-4">
        <Link href="/play/flag_to_country">
          <Card className="hover-elevate cursor-pointer border-transparent transition-colors">
            <CardContent className="flex items-center p-6 gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Flag className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Угадай страну по флагу</h3>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/play/country_to_capital">
          <Card className="hover-elevate cursor-pointer border-transparent transition-colors">
            <CardContent className="flex items-center p-6 gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Угадай столицу по стране</h3>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/play/country_to_flag">
          <Card className="hover-elevate cursor-pointer border-transparent transition-colors">
            <CardContent className="flex items-center p-6 gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Globe2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Угадай флаг по стране</h3>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/play/capital_to_country">
          <Card className="hover-elevate cursor-pointer border-transparent transition-colors">
            <CardContent className="flex items-center p-6 gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Угадай страну по столице</h3>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <Link href="/learn" className="w-full">
          <Card className="bg-secondary/50 hover:bg-secondary border-transparent cursor-pointer transition-colors">
            <CardContent className="flex items-center justify-center p-4 gap-2">
              <BookOpen className="w-5 h-5 text-secondary-foreground" />
              <span className="font-medium text-secondary-foreground">Изучение стран</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
