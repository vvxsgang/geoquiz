import { useState } from "react";
import { useCountries, useGeoJson } from "@/lib/countries";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CountryMap } from "@/components/country-map";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Learn() {
  const { data: countries, isLoading, isError, refetch } = useCountries();
  const { data: geoJson } = useGeoJson();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-md mx-auto min-h-[100dvh]">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 space-y-4 text-center">
        <p className="text-destructive font-medium">Ошибка загрузки данных</p>
        <Button onClick={() => refetch()}>Повторить</Button>
        <Link href="/">
          <Button variant="outline">На главную</Button>
        </Link>
      </div>
    );
  }

  const filtered = (countries || []).filter(c => 
    c.nameRu.toLowerCase().includes(search.toLowerCase()) ||
    c.capitalRu.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto min-h-[100dvh] pb-24">
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 -mt-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск стран и столиц..." 
            className="pl-9 h-10 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(c => (
          <Card 
            key={c.cca3} 
            className="cursor-pointer hover-elevate border-transparent active:scale-[0.98] transition-transform"
            onClick={() => setSelected(c)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-8 rounded shadow-sm overflow-hidden flex-shrink-0 bg-muted">
                <img src={c.flags.svg} alt={c.flags.alt} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-semibold">{c.nameRu}</h3>
                <p className="text-sm text-muted-foreground">{c.capitalRu}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Ничего не найдено
          </div>
        )}
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-center">
        <Link href="/">
          <Button variant="secondary" className="shadow-lg rounded-full">На главную</Button>
        </Link>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto p-0 gap-0">
          {selected && (
            <div className="flex flex-col">
              <div className="w-full h-48 bg-muted relative">
                <img src={selected.flags.svg} alt={selected.flags.alt} className="w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <DialogTitle className="text-2xl font-serif text-foreground">{selected.nameRu}</DialogTitle>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Столица</span>
                    <span className="font-medium">{selected.capitalRu}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Регион</span>
                    <span className="font-medium">{selected.regionRu}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Подрегион</span>
                    <span className="font-medium">{selected.subregionRu || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Соседи</span>
                    <span className="font-medium">{selected.borders?.length || 0}</span>
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden border">
                  <CountryMap 
                    country={selected} 
                    geoJson={geoJson} 
                    neighbors={(countries || []).filter(c => selected.borders?.includes(c.cca3))} 
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
