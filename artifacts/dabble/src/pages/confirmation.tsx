import { useParams, Link } from "wouter";
import { useGetBooking } from "@workspace/api-client-react";
import { Check, Calendar, MapPin, ArrowRight, User, Heart, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupee } from "@/lib/utils";
import coachPlaceholder from "@assets/generated_images/coach_placeholder.jpg";

export default function Confirmation() {
  const { bookingId } = useParams();
  const { data: booking, isLoading, isError } = useGetBooking(bookingId!, {
    query: { enabled: !!bookingId, queryKey: ['getBooking', bookingId] }
  });

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 sm:p-12 text-center rounded-[3rem] space-y-8 border-2 shadow-2xl">
          <Skeleton className="w-24 h-24 rounded-full mx-auto" />
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <Skeleton className="h-48 w-full rounded-[2rem]" />
        </Card>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-black">!</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-4">Something went wrong</h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-md">We couldn't load your booking details. If you just made a payment, please check your email.</p>
        <Link href="/">
          <Button size="lg" className="rounded-full font-bold h-14 px-8 shadow-lg">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const parentFirstName = booking.parentName.split(' ')[0];
  const seats = booking.seats || 1;

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 md:py-20 flex flex-col items-center p-4 relative overflow-hidden">
      
      {/* Background confetti/blobs */}
      <div className="absolute top-20 left-1/4 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>

      <div className="w-full max-w-2xl mb-12 text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="w-28 h-28 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30 border-4 border-white relative z-10">
            <Check className="w-14 h-14 stroke-[3]" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight leading-tight">Payment Complete!</h1>
        <p className="text-xl text-muted-foreground font-medium max-w-lg mx-auto">
          Your trial session for {booking.childName} is confirmed, {parentFirstName}. We've sent the details to <span className="text-foreground font-bold">{booking.parentEmail}</span>.
        </p>
      </div>

      <Card className="w-full max-w-2xl rounded-[3rem] border-2 shadow-2xl shadow-primary/5 overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-150 fill-mode-both bg-white">
        <div className="p-8 sm:p-10 border-b border-border/50 bg-accent/30 relative">
          <div className="absolute top-6 right-6 flex gap-2">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-foreground hover:text-primary transition-colors shadow-sm"><Share2 className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-6 items-center pr-12">
            <img 
              src={booking.coach.imageUrl || coachPlaceholder} 
              alt={booking.coach.name} 
              className="w-24 h-24 rounded-[1.5rem] object-cover bg-white shadow-lg border-2 border-white" 
              onError={(e) => { (e.target as HTMLImageElement).src = coachPlaceholder; }}
            />
            <div>
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full mb-2 uppercase tracking-widest">{booking.coach.activity}</div>
              <h2 className="font-black text-2xl text-foreground mb-1 leading-tight">Trial with {booking.coach.name}</h2>
              <p className="text-muted-foreground font-bold" data-testid="text-booking-id">Booking #{booking.id}</p>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 space-y-8 bg-white">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-accent/40 p-5 rounded-[2rem] border border-transparent">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">When</p>
              <div className="flex items-start gap-3 text-foreground">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <div className="font-extrabold text-lg">{booking.slot.day} · {booking.slot.date}</div>
                  <div className="text-sm font-bold text-muted-foreground">{booking.slot.time}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-accent/40 p-5 rounded-[2rem] border border-transparent">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Where</p>
              <div className="flex items-start gap-3 text-foreground">
                <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <div className="font-extrabold text-lg">{booking.coach.venue}</div>
                  <div className="text-sm font-bold text-muted-foreground">{booking.coach.area}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-5 bg-white border-2 rounded-[2rem] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                {seats > 1 ? <Users className="w-5 h-5 text-muted-foreground" /> : <User className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-0.5">Student{seats > 1 ? 's' : ''}</p>
                <div className="font-extrabold text-lg">{booking.childName} <span className="text-muted-foreground ml-1">({booking.childAge} yrs)</span> {seats > 1 && <span className="text-primary ml-1 text-sm bg-primary/10 px-2 py-0.5 rounded-full">+{seats - 1} more</span>}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-5 bg-white border-2 rounded-[2rem] shadow-sm" data-testid="summary-parent">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-0.5">Parent contact</p>
                <div className="font-extrabold text-lg">{booking.parentName}</div>
                <div className="text-sm font-bold text-muted-foreground">{booking.parentEmail} · {booking.parentPhone}</div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-border/50 pt-8">
             <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm font-bold text-muted-foreground">
                  <span>Coach fee ({seats} {seats === 1 ? 'student' : 'students'})</span>
                  <span>{formatRupee(booking.coachFee || (booking.total - (booking.dabbleFee || booking.serviceFee || 0)))}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-muted-foreground">
                  <span>Dabble fee</span>
                  <span>{formatRupee(booking.dabbleFee || booking.serviceFee || 0)}</span>
                </div>
             </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Amount Paid</p>
                <span className="text-3xl font-black text-foreground">{formatRupee(booking.total)}</span>
              </div>
              <Button variant="outline" className="rounded-full font-bold h-10">Download Receipt</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-12 flex flex-col sm:flex-row gap-4 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both w-full sm:w-auto">
        <Link href="/" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full rounded-full h-16 px-10 text-lg font-extrabold border-2">
            Explore more classes
          </Button>
        </Link>
        <Button className="w-full sm:w-auto rounded-full h-16 px-10 text-lg font-extrabold shadow-xl shadow-primary/20">
          Add to Calendar <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
