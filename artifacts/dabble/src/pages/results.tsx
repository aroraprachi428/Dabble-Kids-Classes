import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useListCoaches, useRecommendClasses, RecommendationIntent, RecommendationResult, Coach } from "@workspace/api-client-react";
import { Star, MapPin, Clock, ArrowRight, Search, X, Sparkles, AlertCircle, Filter, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import coachPlaceholder from "@assets/generated_images/coach_placeholder.jpg";

export default function Results() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialQuery = searchParams.get("q") || "";
  const [, setLocation] = useLocation();

  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [currentIntent, setCurrentIntent] = useState<RecommendationIntent | null>(null);
  const [recommendationResults, setRecommendationResults] = useState<RecommendationResult[]>([]);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  
  const latestQuery = useRef(initialQuery);

  const { data: allCoaches, isLoading: isLoadingCoaches, isError: isCoachesError } = useListCoaches({});
  const recommendClasses = useRecommendClasses();

  useEffect(() => {
    setInputQuery(initialQuery);
    if (initialQuery && initialQuery.trim() !== "") {
      setHasSearched(true);
      latestQuery.current = initialQuery;
      recommendClasses.mutate({ data: { query: initialQuery } }, {
        onSuccess: (res, variables) => {
          if (variables.data.query === latestQuery.current) {
            setCurrentIntent(res.intent);
            setRecommendationResults(res.results);
          }
        }
      });
    } else {
      setHasSearched(false);
      setCurrentIntent(null);
      setRecommendationResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setLocation(`/results?q=${encodeURIComponent(inputQuery.trim())}`);
    }
  };

  const removeIntent = (key: keyof RecommendationIntent) => {
    if (!currentIntent) return;
    const newIntent = { ...currentIntent, [key]: null };
    if (typeof currentIntent[key] === 'string') {
      (newIntent as any)[key] = "";
    }
    
    const parts = [];
    if (newIntent.formatPreference) parts.push(newIntent.formatPreference);
    if (newIntent.activity) parts.push(newIntent.activity);
    if (newIntent.level) parts.push(`${newIntent.level} level`);
    if (newIntent.childAge) parts.push(`for ${newIntent.childAge}yo`);
    if (newIntent.venuePreference) parts.push(newIntent.venuePreference);
    
    if (newIntent.society) {
      parts.push(`in ${newIntent.society}`);
    } else if (newIntent.area) {
      parts.push(`in ${newIntent.area}`);
    }
    
    if (newIntent.day) parts.push(`on ${newIntent.day}`);
    if (newIntent.timeOfDay) parts.push(`in the ${newIntent.timeOfDay}`);
    if (newIntent.maxPrice) parts.push(`under ${newIntent.maxPrice}`);
    
    const newQ = parts.join(' ');
    if (newQ.trim()) {
      setInputQuery(newQ);
      setLocation(`/results?q=${encodeURIComponent(newQ)}`);
    } else {
      setInputQuery("");
      setLocation(`/results`);
    }
  };

  const rankedCoaches = useMemo(() => {
    if (!allCoaches) return [];
    if (!hasSearched || recommendationResults.length === 0) {
      return allCoaches.map(c => ({ coach: c, matchScore: 100, reason: "" }));
    }
    
    const validResults = recommendationResults.filter(r => allCoaches.some(c => c.id === r.id));
    return validResults.sort((a, b) => b.matchScore - a.matchScore).map(r => ({
      coach: allCoaches.find(c => c.id === r.id)!,
      matchScore: r.matchScore,
      reason: r.reason
    }));
  }, [allCoaches, recommendationResults, hasSearched]);

  const isRecommending = recommendClasses.isPending;
  const isLoading = isLoadingCoaches || isRecommending;
  
  const getLocationString = (coach: Coach) => {
    if (coach.venueType === 'comes_to_your_society') return 'Comes to your society';
    if (coach.venueType === 'online') return 'Online';
    return `Studio • ${coach.area}`;
  };

  const getFormatString = (formats: string[]) => {
    if (!formats || formats.length === 0) return '';
    if (formats.includes('private') && formats.includes('group')) return 'Private & Group';
    if (formats.includes('private')) return 'Private';
    if (formats.includes('group')) return 'Group';
    return formats.join(', ');
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-10 bg-white p-4 sm:p-6 rounded-[2rem] shadow-xl shadow-primary/5 border-2 border-border/50">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="pl-12 rounded-xl h-14 border-2 bg-accent/30 focus-visible:ring-0 focus-visible:border-primary text-base font-medium shadow-none"
              placeholder="E.g. weekend swimming classes for 8yo in Indiranagar..."
              data-testid="input-results-search"
            />
          </div>
          <Button type="submit" size="lg" className="rounded-xl h-14 px-8 font-bold shadow-lg shadow-primary/20" data-testid="button-results-search">
            Find Matches
          </Button>
        </form>

        {currentIntent && hasSearched && (
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
              <Filter className="w-4 h-4" /> Smart Filters Applied
            </div>
            <div className="flex flex-wrap gap-2">
              {currentIntent.activity && (
                <Badge variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2 bg-secondary/15 text-secondary hover:bg-secondary/25 border-none" data-testid="badge-intent-activity">
                  {currentIntent.activity}
                  <button onClick={() => removeIntent('activity')} className="hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {currentIntent.formatPreference && (
                <Badge variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-none" data-testid="badge-intent-format">
                  {currentIntent.formatPreference}
                  <button onClick={() => removeIntent('formatPreference')} className="hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {currentIntent.childAge && (
                <Badge variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-none" data-testid="badge-intent-age">
                  Age: {currentIntent.childAge}
                  <button onClick={() => removeIntent('childAge')} className="hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {currentIntent.venuePreference && (
                <Badge variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2 bg-secondary/15 text-secondary hover:bg-secondary/25 border-none" data-testid="badge-intent-venue-pref">
                  {currentIntent.venuePreference}
                  <button onClick={() => removeIntent('venuePreference')} className="hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {currentIntent.society && (
                <Badge variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2 bg-secondary/15 text-secondary hover:bg-secondary/25 border-none" data-testid="badge-intent-society">
                  Society: {currentIntent.society}
                  <button onClick={() => removeIntent('society')} className="hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {!currentIntent.society && currentIntent.area && (
                <Badge variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2 bg-secondary/15 text-secondary hover:bg-secondary/25 border-none" data-testid="badge-intent-area">
                  Area: {currentIntent.area}
                  <button onClick={() => removeIntent('area')} className="hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {currentIntent.level && (
                <Badge variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2 bg-accent text-foreground hover:bg-accent/80 border-none" data-testid="badge-intent-level">
                  {currentIntent.level}
                  <button onClick={() => removeIntent('level')} className="hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {currentIntent.day && (
                <Badge variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2 bg-accent text-foreground hover:bg-accent/80 border-none" data-testid="badge-intent-day">
                  {currentIntent.day}
                  <button onClick={() => removeIntent('day')} className="hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {currentIntent.timeOfDay && (
                <Badge variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2 bg-accent text-foreground hover:bg-accent/80 border-none" data-testid="badge-intent-time">
                  {currentIntent.timeOfDay}
                  <button onClick={() => removeIntent('timeOfDay')} className="hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                </Badge>
              )}
              {currentIntent.maxPrice && (
                <Badge variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2 bg-green-100 text-green-800 hover:bg-green-200 border-none" data-testid="badge-intent-price">
                  Max: ₹{currentIntent.maxPrice}
                  <button onClick={() => removeIntent('maxPrice')} className="hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
      
      {!isLoading && currentIntent?.ageNote && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-[1.5rem] p-4 flex gap-3 text-blue-800 items-start">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="font-medium text-sm leading-relaxed">{currentIntent.ageNote}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground" data-testid="text-results-count">
          {isLoading ? "Finding the best matches..." : hasSearched ? `Top matches for you (${rankedCoaches.length})` : `Explore all classes (${rankedCoaches.length})`}
        </h2>
        {hasSearched && !isLoading && rankedCoaches.length > 0 && (
          <div className="hidden md:flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4" /> AI Ranked
          </div>
        )}
      </div>

      {isLoading && (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 sm:p-6 flex flex-col md:flex-row gap-6 border-2 rounded-[2rem]">
              <Skeleton className="w-full md:w-[280px] h-64 rounded-3xl" />
              <div className="flex-1 space-y-4 py-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (isCoachesError || recommendClasses.isError) && (
        <div className="text-center py-20 bg-destructive/5 rounded-[3rem] border border-destructive/20">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6 shadow-sm">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Oops, something went wrong</h3>
          <p className="text-muted-foreground mb-8 text-lg">We couldn't fetch the recommendations right now.</p>
          <Button onClick={() => window.location.reload()} variant="outline" size="lg" className="rounded-full font-bold border-2">Try again</Button>
        </div>
      )}

      {!isLoading && !isCoachesError && !recommendClasses.isError && rankedCoaches.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-border shadow-sm">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-accent text-muted-foreground mb-6">
            <Search className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No matches found</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
            We couldn't find any classes matching your specific request. Try removing some filters or searching more broadly.
          </p>
          <Button onClick={() => { setInputQuery(""); setLocation("/results"); }} variant="outline" size="lg" className="rounded-full font-bold border-2 shadow-sm">Clear search</Button>
        </div>
      )}

      {!isLoading && !isCoachesError && !recommendClasses.isError && rankedCoaches.length > 0 && (
        <div className="grid gap-8">
          {rankedCoaches.map(({ coach, matchScore, reason }) => (
            <Link key={coach.id} href={`/coach/${coach.id}`}>
              <Card className="group relative overflow-hidden flex flex-col md:flex-row hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary/20 rounded-[2rem] bg-white" data-testid={`card-coach-${coach.id}`}>
                <div className="w-full md:w-[280px] h-64 md:h-auto shrink-0 relative overflow-hidden bg-accent md:m-3 md:rounded-3xl rounded-t-[2rem]">
                  <img 
                    src={coach.imageUrl || coachPlaceholder} 
                    alt={coach.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = coachPlaceholder; }}
                  />
                  {coach.verified && (
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-extrabold text-green-700 shadow-lg flex items-center gap-1.5 tracking-wide">
                      <Star className="w-3.5 h-3.5 fill-green-700" /> VETTED
                    </div>
                  )}
                  {hasSearched && (
                    <div className="absolute bottom-4 left-4 bg-primary/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-extrabold text-white shadow-lg flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> {matchScore}% MATCH
                    </div>
                  )}
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-secondary/15 text-secondary hover:bg-secondary/25 shadow-none border-none font-bold px-3 py-1">
                          {coach.activity}
                        </Badge>
                        <span className="text-sm font-extrabold flex items-center text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                          <Star className="w-4 h-4 fill-amber-500 mr-1" /> {coach.rating} <span className="text-muted-foreground ml-1 font-medium">({coach.reviews})</span>
                        </span>
                        {getFormatString(coach.sessionFormats) && (
                          <Badge variant="outline" className="bg-white px-2 py-1 font-bold text-muted-foreground">
                            {getFormatString(coach.sessionFormats)}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {coach.name}
                      </h3>
                      <div className="flex flex-wrap items-center text-muted-foreground text-sm gap-x-4 gap-y-2 font-medium">
                        <span className="flex items-center gap-1.5 text-foreground/80">
                          <MapPin className="w-4 h-4 text-primary" /> {getLocationString(coach)}
                        </span>
                        <span className="flex items-center gap-1.5 text-foreground/80">
                          <Clock className="w-4 h-4 text-secondary" /> Ages {coach.ageMin}–{coach.ageMax} {coach.parentAccompanied ? '· parent joins' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-left md:text-right bg-accent/40 md:bg-transparent p-4 md:p-0 rounded-2xl shrink-0">
                      <div className="text-2xl font-extrabold text-foreground tracking-tight">₹{coach.price}</div>
                      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">{coach.priceLabel}</div>
                    </div>
                  </div>
                  
                  {hasSearched && reason ? (
                    <div className="mb-6 bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3 text-sm">
                      <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-foreground/90 font-medium leading-relaxed">{reason}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground line-clamp-2 mb-6 text-base leading-relaxed">
                      {coach.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <div className="flex flex-wrap gap-2">
                      {coach.highlights.slice(0, 2).map((highlight, i) => (
                        <span key={i} className="text-xs font-bold px-3 py-1.5 bg-accent/60 rounded-full text-foreground/80">
                          {highlight}
                        </span>
                      ))}
                    </div>
                    <Button variant="secondary" className="rounded-full hidden md:flex items-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors font-bold shadow-sm">
                      View Coach <ArrowRight className="w-4 h-4" />
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
