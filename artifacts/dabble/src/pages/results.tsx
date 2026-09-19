import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useListCoaches } from "@workspace/api-client-react";
import { Star, MapPin, Clock, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function Results() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const q = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(q);
  
  // Real fetch hook
  const { data: coaches, isLoading, isError, refetch } = useListCoaches({ q: query || undefined });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL? For now just trigger refetch via the query param state update.
    // In a real app we might update the wouter search string.
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 bg-white p-4 rounded-3xl shadow-sm border">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-2xl border-none shadow-none bg-accent focus-visible:ring-0 text-lg"
            placeholder="Search coaches, activities, areas..."
          />
          <Button type="submit" className="rounded-full px-6">Update</Button>
        </form>
        {query && (
          <div className="flex flex-wrap gap-2 mt-4 px-2">
            <span className="text-sm text-muted-foreground my-auto">Parsed intent:</span>
            <Badge variant="secondary" className="px-3 py-1">query: {query}</Badge>
            <Badge variant="outline" className="px-3 py-1">Location: Bangalore</Badge>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {isLoading ? "Finding coaches..." : `Found ${coaches?.length || 0} coaches`}
        </h2>
      </div>

      {isLoading && (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 flex flex-col md:flex-row gap-6">
              <Skeleton className="w-full md:w-48 h-48 rounded-2xl" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-20">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Oops, something went wrong</h3>
          <p className="text-muted-foreground mb-6">We couldn't load the coaches right now.</p>
          <Button onClick={() => refetch()} variant="outline" className="rounded-full">Try again</Button>
        </div>
      )}

      {!isLoading && !isError && coaches?.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border shadow-sm">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent text-muted-foreground mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">No coaches found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            We couldn't find any coaches matching your specific request. Try a broader search or different area.
          </p>
          <Button onClick={() => setQuery("")} variant="outline" className="rounded-full">Clear search</Button>
        </div>
      )}

      {!isLoading && !isError && coaches && coaches.length > 0 && (
        <div className="grid gap-6">
          {coaches.map(coach => (
            <Link key={coach.id} href={`/coach/${coach.id}`}>
              <Card className="group overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-all duration-300 cursor-pointer border-transparent hover:border-primary/20">
                <div className="w-full md:w-64 h-64 md:h-auto shrink-0 relative overflow-hidden bg-accent">
                  <img 
                    src={coach.imageUrl} 
                    alt={coach.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {coach.verified && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-green-700" /> Vetted
                    </div>
                  )}
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 shadow-none border-none">
                          {coach.activity}
                        </Badge>
                        <span className="text-sm font-semibold flex items-center text-amber-500">
                          <Star className="w-4 h-4 fill-amber-500 mr-1" /> {coach.rating} ({coach.reviews})
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {coach.name}
                      </h3>
                      <div className="flex items-center text-muted-foreground text-sm gap-4">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {coach.area} • {coach.distance}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {coach.experience}</span>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="text-2xl font-bold text-foreground">₹{coach.price}</div>
                      <div className="text-sm text-muted-foreground">{coach.priceLabel}</div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground line-clamp-2 mb-6 flex-1">
                    {coach.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-wrap gap-2">
                      {coach.highlights.slice(0, 2).map((highlight, i) => (
                        <span key={i} className="text-xs font-medium px-3 py-1 bg-accent rounded-full text-accent-foreground">
                          {highlight}
                        </span>
                      ))}
                    </div>
                    <Button variant="secondary" className="rounded-full hidden md:flex items-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      View Profile <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
