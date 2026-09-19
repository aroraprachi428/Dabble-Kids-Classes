import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

const EXAMPLE_SEARCHES = [
  "swimming for my 7-year-old near Whitefield, weekend mornings",
  "beginner chess coach in Indiranagar",
  "football classes in HSR Layout for 10yo"
];

export function HeroSearch() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/results?q=${encodeURIComponent(query)}`);
    } else {
      setLocation(`/results`);
    }
  };

  const fillExample = (example: string) => {
    setQuery(example);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center px-4">
      <div className="text-center mb-10 space-y-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
          Find the perfect <span className="text-primary">coach</span> for your child
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Bangalore's most trusted marketplace for vetted kids' classes, coaches, and activities.
        </p>
      </div>

      <div className="w-full relative z-10 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[2rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <form onSubmit={handleSearch} className="relative flex flex-col md:flex-row items-center gap-2 bg-white p-2 rounded-3xl md:rounded-full shadow-lg border border-border">
          <div className="flex-1 w-full flex items-center pl-4">
            <Search className="w-6 h-6 text-muted-foreground shrink-0" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. swimming for my 7-year-old near Whitefield"
              className="border-0 shadow-none focus-visible:ring-0 text-lg md:text-xl h-14 md:h-16 px-4 bg-transparent w-full"
            />
          </div>
          <Button type="submit" size="lg" className="w-full md:w-auto rounded-2xl md:rounded-full h-14 md:h-16 px-8 text-lg shadow-sm">
            Search
          </Button>
        </form>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <p className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Try searching for...
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {EXAMPLE_SEARCHES.map((example, i) => (
            <button
              key={i}
              onClick={() => fillExample(example)}
              className="text-sm px-4 py-2 rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm border border-border hover:border-primary"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        <Button variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground">
          Not sure? Guide me
        </Button>
      </div>
    </div>
  );
}
