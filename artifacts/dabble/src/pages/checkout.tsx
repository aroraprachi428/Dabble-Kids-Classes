import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGetCoach, useCreateBooking, BookingInput } from "@workspace/api-client-react";
import { ArrowLeft, ShieldCheck, CheckCircle2, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupee } from "@/lib/utils";

const checkoutSchema = z.object({
  parentName: z.string().min(2, "Name is required"),
  parentEmail: z.string().email("Valid email required"),
  parentPhone: z.string().min(10, "Valid phone required"),
  childName: z.string().min(2, "Child name is required"),
  childAge: z.coerce.number().min(3, "Min age 3").max(18, "Max age 18"),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<{coachId: string, slotId: string} | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('dabble_checkout');
    if (data) {
      setSessionData(JSON.parse(data));
    } else {
      setLocation('/'); // Redirect if no checkout data
    }
  }, [setLocation]);

  const { data: coach, isLoading } = useGetCoach(sessionData?.coachId || "", { 
    query: { enabled: !!sessionData?.coachId } 
  });

  const createBooking = useCreateBooking();

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      childName: "",
      childAge: undefined,
    },
  });

  if (!sessionData) return null;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl grid md:grid-cols-2 gap-8">
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (!coach) {
    return <div>Failed to load checkout details.</div>;
  }

  const slot = coach.slots.find(s => s.id === sessionData.slotId);
  if (!slot) {
    return <div>Invalid slot selected.</div>;
  }

  // Demo static fees
  const trialFee = 200;
  const serviceFee = 49;
  const total = trialFee + serviceFee;

  const onSubmit = (values: CheckoutValues) => {
    const bookingInput: BookingInput = {
      coachId: coach.id,
      slotId: slot.id,
      ...values,
    };

    createBooking.mutate({ data: bookingInput }, {
      onSuccess: (booking) => {
        sessionStorage.removeItem('dabble_checkout');
        setLocation(`/confirmation/${booking.id}`);
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button 
        onClick={() => history.back()} 
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to coach
      </button>

      <div className="grid md:grid-cols-[1fr_380px] gap-8 md:gap-12 items-start">
        
        {/* Left: Form */}
        <div>
          <h1 className="text-3xl font-extrabold mb-8">Complete your booking</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                  Parent Details
                </h2>
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="parentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Your Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Priya Sharma" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="parentEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="priya@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parentPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+91" type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-sm">2</span>
                  Child Details
                </h2>
                <div className="grid md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="childName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Child's First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Aryan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="childAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="7" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full rounded-full h-16 text-xl shadow-lg shadow-primary/20 font-bold"
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? "Processing..." : `Pay ${formatRupee(total)} & Book`}
              </Button>
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground mt-4">
                <ShieldCheck className="w-5 h-5 text-green-600" /> Safe & secure payments via UPI/Cards
              </div>
            </form>
          </Form>
        </div>

        {/* Right: Summary */}
        <div className="md:sticky md:top-28">
          <Card className="rounded-[2rem] overflow-hidden border-2 shadow-xl shadow-primary/5">
            <div className="p-6 bg-accent/50 border-b">
              <h3 className="font-bold text-lg mb-4">Booking Summary</h3>
              <div className="flex gap-4">
                <img src={coach.imageUrl} alt={coach.name} className="w-16 h-16 rounded-2xl object-cover shrink-0 bg-white" />
                <div>
                  <div className="font-bold text-foreground leading-tight mb-1">{coach.activity} Trial</div>
                  <div className="text-sm font-medium text-muted-foreground">with {coach.name}</div>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                  {slot.date.split(' ')[0]}
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm">{slot.day}, {slot.date}</div>
                  <div className="text-sm text-muted-foreground font-medium">{slot.time} • {slot.label}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border">
                <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm">{coach.venue}</div>
                  <div className="text-sm text-muted-foreground font-medium">{coach.area}</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-accent/30 space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">Trial Session Fee</span>
                <span className="text-foreground">{formatRupee(trialFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground flex items-center gap-1">Dabble Service Fee <span className="w-3 h-3 rounded-full bg-muted flex items-center justify-center text-[10px] cursor-help" title="Helps us keep the platform running and provide support">?</span></span>
                <span className="text-foreground">{formatRupee(serviceFee)}</span>
              </div>
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-extrabold text-2xl text-primary">{formatRupee(total)}</span>
              </div>
            </div>
          </Card>
          
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-start gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> Free cancellation up to 24hrs before
            </div>
            <div className="flex items-start gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> Full refund if coach doesn't show
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
