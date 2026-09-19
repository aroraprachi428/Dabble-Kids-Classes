import { useState } from "react";
import { Search, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

const EXAMPLE_SEARCHES = [
  "swimming for my 7-year-old",
  "beginner chess coach",
  "football classes"
];

export function HeroSearch() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let finalQuery = query.trim();
    const loc = locationQuery.trim();
    
    if (loc) {
      if (finalQuery) {
        finalQuery = `${finalQuery} in ${loc}`;
      } else {
        finalQuery = `classes in ${loc}`;
      }
    }
    
    if (finalQuery) {
      setLocation(`/results?q=${encodeURIComponent(finalQuery)}`);
    } else {
      setLocation(`/results`);
    }
  };

  const fillExample = (example: string) => {
    setQuery(example);
  };

  return (
    <div className="w-full flex flex-col items-center lg:items-start" data-testid="section-hero-search">
      <div className="mb-10 space-y-6 text-center lg:text-left">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
          Discover the perfect <span className="text-primary block mt-2">coach</span> for your child
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 font-medium">
          Bangalore's most trusted marketplace for vetted kids' classes, coaches, and activities.
        </p>
      </div>

      <div className="w-full max-w-3xl relative z-10 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <form onSubmit={handleSearch} className="relative flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-[2rem] sm:rounded-full shadow-xl shadow-primary/5 border-2 border-transparent focus-within:border-primary/20 transition-colors">
          <div className="flex-1 w-full flex items-center pl-4 border-b sm:border-b-0 sm:border-r border-border/50 pb-2 sm:pb-0">
            <Search className="w-6 h-6 text-primary shrink-0" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. swimming for 7yo..."
              className="border-0 shadow-none focus-visible:ring-0 text-lg md:text-xl h-12 md:h-14 px-4 bg-transparent w-full font-medium"
              data-testid="input-hero-search"
            />
          </div>
          <div className="flex-1 w-full flex items-center pl-4 pt-1 sm:pt-0">
            <MapPin className="w-6 h-6 text-secondary shrink-0" />
            <Input 
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Area or society (optional)"
              className="border-0 shadow-none focus-visible:ring-0 text-lg md:text-xl h-12 md:h-14 px-4 bg-transparent w-full font-medium"
              data-testid="input-hero-location"
            />
          </div>
          <Button type="submit" size="lg" className="w-full sm:w-auto rounded-xl sm:rounded-full h-14 md:h-16 px-8 text-lg font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95" data-testid="button-hero-search">
            Find Classes
          </Button>
        </form>
      </div>

      <div className="mt-10 flex flex-col items-center lg:items-start w-full">
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-secondary" /> Try searching for
        </p>
        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
          {EXAMPLE_SEARCHES.map((example, i) => (
             <button
              key={i}
              onClick={() => fillExample(example)}
              className="text-sm font-medium px-5 py-2.5 rounded-full bg-white text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-sm border border-border hover:border-primary hover:-translate-y-0.5 active:translate-y-0"
              data-testid={`button-example-search-${i}`}
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
