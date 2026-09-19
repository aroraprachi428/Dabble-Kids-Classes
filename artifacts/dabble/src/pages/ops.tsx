import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useGetOpsAnalytics, getGetOpsAnalyticsQueryKey } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, DollarSign, Award, AlertCircle } from "lucide-react";
import { formatRupee } from "@/lib/utils";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function Ops() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== 'employee')) {
      setLocation(`/login?returnTo=${encodeURIComponent("/ops")}`);
    }
  }, [user, isAuthLoading, setLocation]);

  const { data: analytics, isLoading, isError } = useGetOpsAnalytics({
    query: { enabled: !!user && user.role === 'employee', retry: false, queryKey: getGetOpsAnalyticsQueryKey() }
  });

  if (isAuthLoading || !user) return null;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {[1, 2].map(i => <Skeleton key={i} className="h-80 rounded-[2rem]" />)}
        </div>
        <Skeleton className="h-96 rounded-[2rem]" />
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="w-24 h-24 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold mb-4">Analytics Unavailable</h2>
        <p className="text-lg text-muted-foreground mb-8">We couldn't load the analytics data at this time.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-900 text-slate-50 py-3 px-4 text-center font-bold tracking-widest uppercase text-sm w-full top-0 left-0">
        Internal — Dabble team only
      </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl min-h-[80vh]">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">Ops Dashboard</h1>
          <p className="text-muted-foreground text-lg font-medium">{analytics.periodLabel || "Platform Overview"}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">GMV</p>
            <div className="text-2xl font-black">{formatRupee(analytics.GMV)}</div>
          </Card>
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-primary/10 border-primary/20">
            <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Revenue</p>
            <div className="text-2xl font-black text-primary">{formatRupee(analytics.dabbleRevenue)}</div>
          </Card>
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Total Bookings</p>
            <div className="text-2xl font-black">{analytics.totalBookings}</div>
          </Card>
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Pending Bookings</p>
            <div className="text-2xl font-black">{analytics.pendingBookings}</div>
          </Card>
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Avg Value</p>
            <div className="text-2xl font-black">{formatRupee(analytics.avgBookingValue)}</div>
          </Card>
          
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Active Coaches</p>
            <div className="text-2xl font-black">{analytics.activeCoaches}</div>
          </Card>
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Searches</p>
            <div className="text-2xl font-black">{analytics.searches}</div>
          </Card>
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Conversion</p>
            <div className="text-2xl font-black">{analytics.conversion.toFixed(1)}%</div>
          </Card>
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Parent Signups</p>
            <div className="text-2xl font-black">{analytics.newParentSignups}</div>
          </Card>
          <Card className="p-5 rounded-[1.5rem] border-2 shadow-sm bg-white">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Societies Live</p>
            <div className="text-2xl font-black">{analytics.societiesLive}</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <Card className="p-6 rounded-[2rem] border-2 shadow-sm bg-white col-span-1">
            <h3 className="text-lg font-extrabold mb-6">By Category</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.bookingsByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="bookings" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 rounded-[2rem] border-2 shadow-sm bg-white col-span-1">
            <h3 className="text-lg font-extrabold mb-6">By Area</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.bookingsByArea} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="bookings" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 rounded-[2rem] border-2 shadow-sm bg-white col-span-1">
            <h3 className="text-lg font-extrabold mb-6">Over Time</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.bookingsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                  <Tooltip cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2"><Award className="w-6 h-6 text-amber-500" /> Top Coaches</h2>
            {analytics.topCoaches.length === 0 ? (
              <Card className="p-12 rounded-[2rem] text-center border-2 border-dashed bg-accent/30 shadow-none">
                <p className="text-muted-foreground">More booking data is needed.</p>
              </Card>
            ) : (
              <div className="grid gap-3">
                {analytics.topCoaches.map((coach, index) => (
                  <Card key={coach.coachId} className="p-4 rounded-[1.5rem] border shadow-sm bg-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-accent text-foreground flex items-center justify-center font-black text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm">{coach.coachName}</h3>
                        <div className="text-xs font-bold text-muted-foreground flex gap-3 mt-0.5">
                          <span>{coach.bookings} Bookings</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-6 text-right">
                      <div>
                        <div className="text-sm font-black text-foreground">{formatRupee(coach.GMV)}</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">GMV</div>
                      </div>
                      <div>
                        <div className="text-sm font-black text-primary">{formatRupee(coach.revenue)}</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rev</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-extrabold mb-6">Recent Bookings Feed</h2>
            {analytics.recentBookings && analytics.recentBookings.length === 0 ? (
              <Card className="p-12 rounded-[2rem] text-center border-2 border-dashed bg-accent/30 shadow-none">
                <p className="text-muted-foreground">No recent bookings.</p>
              </Card>
            ) : (
              <div className="grid gap-3">
                {analytics.recentBookings && analytics.recentBookings.map((b, i) => (
                  <Card key={i} className="p-4 rounded-[1.5rem] border shadow-sm bg-white flex justify-between">
                    <div>
                      <div className="text-xs font-black uppercase text-muted-foreground mb-1">{b.time} • {b.activity}</div>
                      <div className="font-extrabold text-sm">{b.parent} booked {b.coach}</div>
                      <div className="text-xs font-medium text-muted-foreground mt-0.5">for {b.child}</div>
                    </div>
                    <div className="text-right flex flex-col justify-between items-end">
                      <div className="text-sm font-black text-foreground">{formatRupee(b.amount)}</div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${b.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {b.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
