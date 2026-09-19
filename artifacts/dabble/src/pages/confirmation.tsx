import { useParams, Link } from "wouter";
import { useGetBooking } from "@workspace/api-client-react";
import { Check, Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupee } from "@/lib/utils";

export default function Confirmation() {
  const { bookingId } = useParams();
  const { data: booking, isLoading, isError } = useGetBooking(bookingId!, {
    query: { enabled: !!bookingId }
  });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center rounded-[2rem] space-y-6">
          <Skeleton className="w-20 h-20 rounded-full mx-auto" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </Card>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">We couldn't load your booking details.</p>
        <Link href="/">
          <Button variant="outline" className="rounded-full">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 flex flex-col items-center p-4">
      
      <div className="w-full max-w-lg mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100/50">
          <Check className="w-12 h-12 stroke-[3]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 tracking-tight">Booking Confirmed!</h1>
        <p className="text-lg text-muted-foreground">
          You're all set, <span className="font-semibold text-foreground">{booking.parentName.split(' ')[0]}</span>. We've sent the details to your email.
        </p>
      </div>

      <Card className="w-full max-w-lg rounded-[2rem] border-2 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
        <div className="p-6 md:p-8 border-b bg-accent/30">
          <div className="flex gap-4 items-center">
            <img src={booking.coach.imageUrl} alt={booking.coach.name} className="w-16 h-16 rounded-2xl object-cover bg-white shadow-sm" />
            <div>
              <h2 className="font-bold text-xl text-foreground mb-1">{booking.coach.activity} Trial</h2>
              <p className="text-muted-foreground font-medium">with Coach {booking.coach.name}</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">When</p>
              <div className="flex items-start gap-2 text-foreground font-medium">
                <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">{booking.slot.date}</div>
                  <div className="text-sm">{booking.slot.time}</div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Where</p>
              <div className="flex items-start gap-2 text-foreground font-medium">
                <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">{booking.coach.venue}</div>
                  <div className="text-sm">{booking.coach.area}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent/50 p-4 rounded-2xl">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">For</p>
            <div className="font-bold text-foreground">
              {booking.childName} <span className="text-muted-foreground font-medium">(Age {booking.childAge})</span>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">
              <span>Amount Paid</span>
              <span>Booking ID</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-extrabold text-foreground">{formatRupee(booking.total)}</span>
              <span className="font-mono text-muted-foreground bg-accent px-3 py-1 rounded-md">{booking.id.split('-')[0].toUpperCase()}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-12 flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
        <Link href="/">
          <Button variant="outline" className="rounded-full h-14 px-8 font-bold">
            Explore more classes
          </Button>
        </Link>
        <Button className="rounded-full h-14 px-8 font-bold shadow-lg shadow-primary/20">
          Manage Booking <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
