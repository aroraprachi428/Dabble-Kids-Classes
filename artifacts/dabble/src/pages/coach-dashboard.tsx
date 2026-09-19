import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useGetCoachDashboard, getGetCoachDashboardQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, TrendingUp, AlertCircle, ShieldCheck, Star, MapPin, Clock } from "lucide-react";
import { formatRupee } from "@/lib/utils";
import coachPlaceholder from "@assets/generated_images/coach_placeholder.jpg";
import { parse } from "date-fns";

export default function CoachDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'coach')) {
      setLocation("/");
    }
  }, [user, isAuthLoading, setLocation]);

  const { data: dashboard, isLoading, isError, error } = useGetCoachDashboard({
    query: { enabled: !!user && user.role === 'coach', retry: false, queryKey: getGetCoachDashboardQueryKey() }
  });

  if (isAuthLoading || !user) return null;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Skeleton className="h-24 w-full mb-8 rounded-[2rem]" />
        <div className="grid sm:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
        </div>
        <Skeleton className="h-96 rounded-[3rem]" />
      </div>
    );
  }

  if (isError) {
    const apiError = error as any;
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="w-24 h-24 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold mb-4">Dashboard Unavailable</h2>
        <p className="text-lg text-muted-foreground mb-8">
          {apiError.response?.status === 404 
            ? "Your account is not linked to a coach profile yet. Please contact support to complete your setup."
            : "We couldn't load your dashboard. Please try again later."}
        </p>
      </div>
    );
  }

  if (!dashboard) return null;

  if (!dashboard.coach) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="w-24 h-24 bg-accent/50 text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold mb-4">Welcome to Dabble!</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Your coach profile is currently being reviewed and set up by our team. Once approved, your metrics and bookings will appear here.
        </p>
        
        <div className="grid sm:grid-cols-4 gap-4 mb-10 text-left">
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white relative overflow-hidden opacity-50">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Upcoming Sessions</p>
            <div className="text-3xl font-black">0</div>
          </Card>
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white relative overflow-hidden opacity-50">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Total Bookings</p>
            <div className="text-3xl font-black">0</div>
          </Card>
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-primary/10 border-primary/20 relative overflow-hidden opacity-50">
            <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Total Earnings</p>
            <div className="text-3xl font-black text-primary">{formatRupee(0)}</div>
          </Card>
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white relative overflow-hidden opacity-50">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Pending Confirms</p>
            <div className="text-3xl font-black">0</div>
          </Card>
        </div>
      </div>
    );
  }

  const now = new Date();
  
  const upcoming: typeof dashboard.bookings = [];
  const past: typeof dashboard.bookings = [];
  
  if (dashboard.bookings) {
    dashboard.bookings.forEach(b => {
      let isPast = false;
      try {
        const d = new Date(b.slot.date);
        if (!isNaN(d.getTime())) {
          if (d < now) isPast = true;
        } else {
          const currentYear = now.getFullYear();
          const parsed = parse(`${b.slot.date} ${currentYear}`, "MMM d yyyy", new Date());
          if (!isNaN(parsed.getTime())) {
            if (parsed < now) isPast = true;
          }
        }
      } catch (e) {}
      if (isPast) past.push(b);
      else upcoming.push(b);
    });
  }

  const coach = dashboard.coach;

  const totals = dashboard.totals as any;
  const upcomingSessions = totals?.upcomingSessions ?? upcoming.length;
  const pendingConfirmations = totals?.pendingConfirmations ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[80vh]">
      
      {/* Coach Header Profile */}
      <Card className="mb-8 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border-2 shadow-xl shadow-primary/5 bg-white flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-center">
        <img 
          src={coach.imageUrl || coachPlaceholder} 
          alt={coach.name}
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shrink-0 bg-accent border-4 border-white shadow-md"
          onError={(e) => { (e.target as HTMLImageElement).src = coachPlaceholder; }}
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{coach.name}</h1>
            {coach.verified && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Vetted
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-muted-foreground">
            <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {coach.rating}</div>
            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {coach.area}</div>
            <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1 rounded-full">{coach.activity}</div>
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-4 gap-4 mb-10">
        <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white relative overflow-hidden">
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Upcoming Sessions</p>
          <div className="text-3xl font-black">{upcomingSessions}</div>
        </Card>
        <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white relative overflow-hidden">
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Total Bookings</p>
          <div className="text-3xl font-black">{dashboard.totals.bookingCount}</div>
        </Card>
        <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-primary/10 border-primary/20 relative overflow-hidden">
          <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Total Earnings</p>
          <div className="text-3xl font-black text-primary">{formatRupee(dashboard.totals.coachEarnings)}</div>
        </Card>
        <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white relative overflow-hidden">
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Pending Confirms</p>
          <div className="text-3xl font-black">{pendingConfirmations}</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-8">
        <div>
          <h2 className="text-2xl font-extrabold mb-6">Trial Bookings</h2>
          {dashboard.bookings.length === 0 ? (
            <Card className="p-12 rounded-[2rem] text-center border-2 border-dashed bg-accent/30 shadow-none">
              <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground">When parents book trials with you, they will appear here.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {[...upcoming, ...past].map(booking => {
                const isUpcoming = upcoming.includes(booking);
                const status = (booking as any).status || "paid"; // Fallback if missing
                const isPaid = status === "paid";
                return (
                  <Card key={booking.id} className={`p-5 rounded-[1.5rem] border shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between ${isUpcoming ? 'bg-white' : 'bg-accent/40 opacity-75'}`}>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isUpcoming ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-600'}`}>{booking.slot.day}, {booking.slot.date} • {booking.slot.time}</span>
                        <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{status}</span>
                      </div>
                      <div className="font-extrabold text-lg">
                        {booking.childName} ({booking.childAge} yrs)
                        {booking.seats && booking.seats > 1 && <span className="ml-2 text-primary text-sm font-bold">+{booking.seats - 1} more</span>}
                      </div>
                      <div className="text-sm font-bold text-muted-foreground mt-1">Parent: {booking.parentName}</div>
                      <div className="text-sm text-muted-foreground font-medium">{coach.activity}</div>
                    </div>
                    <div className="md:text-right pt-3 md:pt-0 border-t md:border-t-0 mt-3 md:mt-0">
                      <div className="text-xl font-black text-foreground">{formatRupee(booking.coachFee || 0)}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Earnings</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-2xl font-extrabold mb-6">My Offers</h2>
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white">
            <h3 className="font-extrabold text-lg mb-1">{coach.activity} Trial</h3>
            <div className="flex gap-2 mb-3">
              <span className="bg-accent px-2 py-0.5 rounded text-xs font-bold text-muted-foreground">{coach.venueType.replace(/_/g, ' ')}</span>
              {coach.sessionFormats?.map((f: string) => (
                <span key={f} className="bg-accent px-2 py-0.5 rounded text-xs font-bold text-muted-foreground">{f}</span>
              ))}
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-muted-foreground">
              <span>{coach.ageRange}</span>
              <span className="text-foreground">{formatRupee(coach.price)}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
