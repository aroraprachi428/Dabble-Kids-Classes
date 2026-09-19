import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetCoach, TrialSlot } from "@workspace/api-client-react";
import { Star, MapPin, Clock, ShieldCheck, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatRupee } from "@/lib/utils";

export default function CoachDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { data: coach, isLoading, isError } = useGetCoach(id!);
  
  const [selectedSlot, setSelectedSlot] = useState<TrialSlot | null>(null);

  const handleContinue = () => {
    if (selectedSlot && coach) {
      // Store minimal selection info in sessionStorage to pick up on checkout
      sessionStorage.setItem('dabble_checkout', JSON.stringify({
        coachId: coach.id,
        slotId: selectedSlot.id
      }));
      setLocation('/checkout');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-24 mb-6 rounded-full" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !coach) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Coach not found</h2>
        <Button onClick={() => setLocation('/')} variant="outline" className="rounded-full">Return Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button 
        onClick={() => history.back()} 
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to results
      </button>

      <div className="grid md:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Left Column: Details */}
        <div className="space-y-8">
          <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden relative bg-accent">
            <img src={coach.imageUrl} alt={coach.name} className="w-full h-full object-cover" />
            {coach.verified && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-green-700 shadow-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Verified Coach
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-primary text-primary-foreground text-sm px-4 py-1.5">{coach.activity}</Badge>
              <span className="flex items-center font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full text-sm">
                <Star className="w-4 h-4 fill-amber-500 mr-1.5" /> {coach.rating} ({coach.reviews} reviews)
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">{coach.name}</h1>
            
            <div className="flex flex-wrap items-center text-muted-foreground gap-x-6 gap-y-2 mb-6 font-medium">
              <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-secondary" /> {coach.venue}, {coach.area}</span>
              <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-secondary" /> {coach.experience} experience</span>
            </div>

            <p className="text-lg leading-relaxed text-foreground/80 mb-8 border-l-4 border-primary/20 pl-4">
              {coach.description}
            </p>

            <h3 className="text-xl font-bold mb-4">Why parents love {coach.name.split(' ')[0]}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {coach.highlights.map((highlight, i) => (
                <div key={i} className="flex items-start gap-3 bg-accent/50 p-4 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span className="font-medium text-foreground">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="md:sticky md:top-28">
          <Card className="p-6 md:p-8 border-2 shadow-xl shadow-primary/5 rounded-[2rem]">
            <div className="flex justify-between items-start mb-6 pb-6 border-b">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Standard Price</p>
                <div className="text-3xl font-extrabold text-foreground">{formatRupee(coach.price)}</div>
                <div className="text-sm font-medium text-muted-foreground mt-1">{coach.priceLabel}</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                Book a Trial <Badge variant="secondary" className="bg-secondary/15 text-secondary text-xs">Low cost</Badge>
              </h3>
              
              {coach.slots.length > 0 ? (
                <div className="space-y-3">
                  {coach.slots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group",
                        selectedSlot?.id === slot.id 
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/5 scale-[1.02]" 
                          : "border-border hover:border-primary/40 hover:bg-accent/50"
                      )}
                    >
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">{slot.day}, {slot.date}</div>
                        <div className="text-sm text-muted-foreground font-medium mt-0.5">{slot.time} • {slot.label}</div>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        selectedSlot?.id === slot.id ? "border-primary bg-primary" : "border-muted-foreground/30 group-hover:border-primary/50"
                      )}>
                        {selectedSlot?.id === slot.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-accent rounded-2xl text-center text-muted-foreground">
                  No trial slots available currently.
                </div>
              )}
            </div>

            <Button 
              size="lg" 
              className="w-full rounded-full h-14 text-lg shadow-lg shadow-primary/20 font-bold"
              disabled={!selectedSlot}
              onClick={handleContinue}
            >
              Continue to Book {selectedSlot && <ChevronRight className="w-5 h-5 ml-1" />}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground mt-4 font-medium flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Secure payment on next step
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
