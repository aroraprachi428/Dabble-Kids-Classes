import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetCoach, TrialSlot, Coach } from "@workspace/api-client-react";
import { Star, MapPin, Clock, ShieldCheck, CheckCircle2, ChevronRight, ArrowLeft, Heart, Share2, Info, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatRupee } from "@/lib/utils";
import coachPlaceholder from "@assets/generated_images/coach_placeholder.jpg";

export default function CoachDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { data: coach, isLoading, isError } = useGetCoach(id!);
  
  const [selectedSlot, setSelectedSlot] = useState<TrialSlot | null>(null);
  const [seats, setSeats] = useState(1);

  const handleContinue = () => {
    if (selectedSlot && coach) {
      sessionStorage.setItem('dabble_checkout', JSON.stringify({
        coachId: coach.id,
        slotId: selectedSlot.id,
        seats
      }));
      setLocation('/checkout');
    }
  };

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-10 w-32 mb-8 rounded-full" />
        <div className="grid lg:grid-cols-[1fr_420px] gap-8 xl:gap-12">
          <div className="space-y-8">
            <Skeleton className="h-[400px] w-full rounded-[3rem]" />
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div>
            <Skeleton className="h-[600px] w-full rounded-[3rem]" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !coach) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-md">
        <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
          <Info className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold mb-4">Coach not found</h2>
        <p className="text-lg text-muted-foreground mb-8">This coach profile might have been moved or is no longer available.</p>
        <Button onClick={() => setLocation('/')} size="lg" className="rounded-full font-bold h-14 px-8 shadow-lg shadow-primary/20">Return Home</Button>
      </div>
    );
  }

  const basePrice = coach.price * seats;
  const dabbleFee = Math.round(basePrice * 0.10);
  const total = basePrice + dabbleFee;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl relative">
      <button 
        onClick={() => history.back()} 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-bold text-sm bg-accent/50 hover:bg-accent px-4 py-2 rounded-full"
        data-testid="button-back-results"
      >
        <ArrowLeft className="w-4 h-4" /> Back to results
      </button>

      <div className="grid lg:grid-cols-[1fr_420px] gap-8 xl:gap-12 items-start">
        {/* Left Column: Details */}
        <div className="space-y-10">
          <div className="aspect-[4/3] sm:aspect-[16/9] w-full rounded-[3rem] overflow-hidden relative bg-accent border-4 border-white shadow-2xl shadow-primary/10">
            <img 
              src={coach.imageUrl || coachPlaceholder} 
              alt={coach.name} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = coachPlaceholder;
              }}
              data-testid="img-coach-profile"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent"></div>
            
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
              {coach.verified && (
                <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-sm font-extrabold text-green-700 shadow-xl flex items-center gap-2 tracking-wide border border-white/20">
                  <ShieldCheck className="w-5 h-5" /> VETTED
                </div>
              )}
              <div className="flex gap-2 ml-auto">
                <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:text-primary hover:scale-105 transition-all shadow-xl"><Share2 className="w-5 h-5" /></button>
                <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:text-destructive hover:scale-105 transition-all shadow-xl"><Heart className="w-5 h-5" /></button>
              </div>
            </div>
            
            <div className="absolute bottom-6 left-6 right-6 flex flex-col items-start">
              <div className="flex gap-2 mb-3">
                <Badge className="bg-primary text-primary-foreground text-sm font-bold px-4 py-1.5 shadow-lg">
                  {coach.activity}
                </Badge>
                {getFormatString(coach.sessionFormats) && (
                  <Badge variant="outline" className="bg-white/90 backdrop-blur-md text-foreground text-sm font-bold px-4 py-1.5 shadow-lg border-none">
                    {getFormatString(coach.sessionFormats)}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md">{coach.name}</h1>
            </div>
          </div>

          <div className="px-2">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-8 pb-8 border-b border-border/50">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <div>{coach.rating} Rating</div>
                  <div className="text-xs text-muted-foreground font-medium">{coach.reviews} reviews</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-foreground font-bold">
                <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div>{getLocationString(coach)}</div>
                  {coach.venueType === 'at_studio' && <div className="text-xs text-muted-foreground font-medium">{coach.venue}</div>}
                </div>
              </div>

              <div className="flex items-center gap-2 text-foreground font-bold">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div>Ages {coach.ageMin}–{coach.ageMax}</div>
                  <div className="text-xs text-muted-foreground font-medium">{coach.parentAccompanied ? 'Parent joins' : 'Drop-off'}</div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-2xl font-extrabold mb-4 text-foreground">About the coach</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {coach.description}
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-extrabold mb-6 text-foreground">Why parents love {coach.name.split(' ')[0]}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {coach.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-start gap-4 bg-accent/40 p-5 rounded-[2rem] border border-transparent hover:border-border transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-bold text-foreground text-base pt-2">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="lg:sticky lg:top-28">
          <Card className="p-6 sm:p-8 border-2 shadow-2xl shadow-primary/10 rounded-[3rem] bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-secondary"></div>
            
            <div className="mb-8">
              <h3 className="text-xl font-extrabold mb-4 flex items-center justify-between">
                Select a Time
              </h3>
              
              {coach.slots.length > 0 ? (
                <div className="flex flex-wrap gap-3" data-testid="list-trial-slots">
                  {coach.slots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "text-left px-5 py-3 rounded-[1.5rem] border-2 transition-all duration-300 relative overflow-hidden",
                        selectedSlot?.id === slot.id 
                          ? "border-primary bg-primary/5 shadow-sm scale-105" 
                          : "border-border hover:border-primary/40 hover:bg-accent/50"
                      )}
                      data-testid={`button-slot-${slot.id}`}
                    >
                      <div className={cn("font-bold transition-colors", selectedSlot?.id === slot.id ? "text-primary" : "text-foreground")}>
                        {slot.day}, {slot.time}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">{slot.date}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-accent rounded-3xl text-center text-muted-foreground border-2 border-dashed border-border">
                  <Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <div className="font-bold text-foreground">No slots currently available</div>
                  <div className="text-sm mt-1">Check back later for new schedules.</div>
                </div>
              )}
            </div>

            <div className="mb-8 pb-8 border-b border-border/50">
               <h3 className="text-base font-bold mb-4 flex items-center justify-between text-muted-foreground uppercase tracking-widest">
                Students
              </h3>
              <div className="flex items-center gap-4 bg-accent/40 w-fit p-2 rounded-full border border-border/50">
                <button 
                  onClick={() => setSeats(s => Math.max(1, s - 1))}
                  className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-foreground hover:text-primary transition-colors disabled:opacity-50"
                  disabled={seats <= 1}
                  data-testid="button-seats-minus"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="w-8 text-center font-extrabold text-xl" data-testid="text-seats-count">{seats}</div>
                <button 
                  onClick={() => setSeats(s => Math.min(10, s + 1))}
                  className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-foreground hover:text-primary transition-colors disabled:opacity-50"
                  disabled={seats >= 10}
                  data-testid="button-seats-plus"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mb-6 space-y-2 text-sm font-bold">
               <div className="flex justify-between text-muted-foreground">
                 <span>Coach fee</span>
                 <span>{formatRupee(basePrice)}</span>
               </div>
               <div className="flex justify-between text-muted-foreground">
                 <span>Dabble fee (10%)</span>
                 <span>{formatRupee(dabbleFee)}</span>
               </div>
               <div className="flex justify-between text-foreground text-lg pt-2">
                 <span>Total</span>
                 <span className="text-primary font-black text-2xl">{formatRupee(total)}</span>
               </div>
            </div>

            <Button 
              size="lg" 
              className="w-full rounded-full h-16 text-lg shadow-xl shadow-primary/20 font-bold transition-transform active:scale-[0.98]"
              disabled={!selectedSlot}
              onClick={handleContinue}
              data-testid="button-continue-booking"
            >
              Book a trial {selectedSlot && <ChevronRight className="w-5 h-5 ml-1" />}
            </Button>
            
            <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
              <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600" /> Secure payment on next step
              </p>
              <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary" /> Free cancellation before 24h
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
