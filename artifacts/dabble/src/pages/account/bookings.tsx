import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { useListParentBookings, getListParentBookingsQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight, User } from "lucide-react";
import { formatRupee } from "@/lib/utils";
import coachPlaceholder from "@assets/generated_images/coach_placeholder.jpg";
import { parse } from "date-fns";

export default function ParentBookings() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'parent')) {
      setLocation("/");
    }
  }, [user, isAuthLoading, setLocation]);

  const { data: bookings, isLoading } = useListParentBookings({
    query: { enabled: !!user && user.role === 'parent', queryKey: getListParentBookingsQueryKey() }
  });

  if (isAuthLoading || !user) return null;

  const now = new Date();
  
  const upcoming: typeof bookings = [];
  const past: typeof bookings = [];
  
  if (bookings) {
    bookings.forEach(b => {
      let isPast = false;
      try {
        const d = new Date(b.slot.date);
        if (!isNaN(d.getTime())) {
          if (d < now) isPast = true;
        } else {
          // simple fallback for "Feb 10" format
          const currentYear = now.getFullYear();
          const parsed = parse(`${b.slot.date} ${currentYear}`, "MMM d yyyy", new Date());
          if (!isNaN(parsed.getTime())) {
            if (parsed < now) isPast = true;
          }
        }
      } catch (e) {
        // assume upcoming if parse fails
      }
      if (isPast) {
        past.push(b);
      } else {
        upcoming.push(b);
      }
    });
  }

  const renderBookingCard = (booking: NonNullable<typeof bookings>[0], isPast: boolean) => (
    <Card key={booking.id} className="overflow-hidden rounded-[2rem] border-2 shadow-lg shadow-primary/5 hover:border-primary/20 transition-all group bg-white">
      <div className="flex flex-col sm:flex-row gap-6 p-6">
        <img 
          src={booking.coach.imageUrl || coachPlaceholder} 
          alt={booking.coach.name}
          className="w-24 h-24 rounded-[1.5rem] object-cover shrink-0 bg-accent border-2 border-white shadow-md"
          onError={(e) => { (e.target as HTMLImageElement).src = coachPlaceholder; }}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{booking.coach.activity}</div>
              <h3 className="text-xl font-extrabold leading-tight mb-1">Trial with {booking.coach.name}</h3>
              <div className="text-sm font-bold text-muted-foreground">Booking #{booking.id}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xl font-black text-foreground">{formatRupee(booking.total)}</div>
              <div className={`text-xs font-bold uppercase tracking-widest ${((booking as any).status || 'paid') === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{(booking as any).status || 'Paid'}</div>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">{booking.slot.day}, {booking.slot.date}</div>
                <div className="text-xs font-medium text-muted-foreground">{booking.slot.time}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2.5">
              <User className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">{booking.childName} ({booking.childAge} yrs)</div>
                {booking.seats && booking.seats > 1 && (
                  <div className="text-xs font-bold text-primary">+{booking.seats - 1} more student(s)</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-accent/40 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <MapPin className="w-4 h-4" /> {booking.coach.venue} • {booking.coach.area}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!isPast ? (
            <>
              <Button variant="ghost" size="sm" className="font-bold w-full sm:w-auto text-destructive hover:bg-destructive/10 hover:text-destructive">
                Cancel
              </Button>
              <Link href={`/confirmation/${booking.id}`}>
                <Button variant="outline" size="sm" className="rounded-full font-bold w-full sm:w-auto bg-white hover:bg-white hover:border-primary">
                  View Details
                </Button>
              </Link>
            </>
          ) : (
            <Link href={`/coach/${booking.coach.id}`}>
              <Button variant="outline" size="sm" className="rounded-full font-bold w-full sm:w-auto bg-white hover:bg-white hover:border-primary">
                Book again
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[80vh]">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-2">My Bookings</h1>
        <p className="text-muted-foreground text-lg font-medium">Manage your trial sessions</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map(i => (
            <Card key={i} className="p-6 rounded-[2rem]">
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <Card className="p-12 rounded-[3rem] text-center border-2 border-dashed bg-accent/30 shadow-none">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Calendar className="w-10 h-10 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-2xl font-bold mb-4">No bookings yet — find a class.</h2>
          <Link href="/">
            <Button size="lg" className="mt-4 rounded-full font-bold shadow-lg shadow-primary/20">Find Classes</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-12">
          {upcoming && upcoming.length > 0 && (
            <div>
              <h2 className="text-2xl font-extrabold mb-6">Upcoming Trials</h2>
              <div className="space-y-6">
                {upcoming.map(b => renderBookingCard(b, false))}
              </div>
            </div>
          )}
          
          {past && past.length > 0 && (
            <div>
              <h2 className="text-2xl font-extrabold mb-6 text-muted-foreground">Past Trials</h2>
              <div className="space-y-6 opacity-75 hover:opacity-100 transition-opacity">
                {past.map(b => renderBookingCard(b, true))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
