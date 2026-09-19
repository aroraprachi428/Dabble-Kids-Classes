import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useGetCoach, useCreatePaymentOrder, useVerifyPayment, BookingInput, PaymentOrder } from "@workspace/api-client-react";
import { ArrowLeft, ShieldCheck, CheckCircle2, MapPin, Calendar, Clock, CreditCard, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupee } from "@/lib/utils";
import coachPlaceholder from "@assets/generated_images/coach_placeholder.jpg";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const checkoutSchema = z.object({
  parentName: z.string().min(2, "Name is required"),
  parentEmail: z.string().email("Valid email required"),
  parentPhone: z.string().min(10, "Valid phone required").regex(/^[0-9+\-\s()]+$/, "Invalid phone format"),
  childName: z.string().min(2, "Child name is required"),
  childAge: z.coerce.number().min(4, "Child must be at least 4").max(18, "Max age 18"),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<{coachId: string, slotId: string, seats: number} | null>(null);
  
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [savedValues, setSavedValues] = useState<CheckoutValues | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('dabble_checkout');
    if (!data) {
      setLocation('/');
      return;
    }
    
    try {
      const parsed = JSON.parse(data);
      if (typeof parsed.coachId !== 'string' || typeof parsed.slotId !== 'string' || typeof parsed.seats !== 'number') {
        throw new Error('Invalid shape');
      }
      setSessionData({ coachId: parsed.coachId, slotId: parsed.slotId, seats: parsed.seats });
    } catch (err) {
      sessionStorage.removeItem('dabble_checkout');
      setLocation('/');
    }
  }, [setLocation]);

  const { data: coach, isLoading } = useGetCoach(sessionData?.coachId || "", { 
    query: { enabled: !!sessionData?.coachId, queryKey: ['getCoach', sessionData?.coachId] } 
  });

  const createOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyPayment();

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      childName: "",
      childAge: 4,
    },
  });

  if (!sessionData) return null;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl grid lg:grid-cols-[1fr_420px] gap-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48 mb-8 rounded-full" />
          <Skeleton className="h-[300px] rounded-[3rem]" />
          <Skeleton className="h-[250px] rounded-[3rem]" />
        </div>
        <Skeleton className="h-[500px] rounded-[3rem] lg:mt-[72px]" />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Checkout error</h2>
        <p className="text-muted-foreground mb-6">We couldn't load the details for this booking.</p>
        <Button onClick={() => setLocation('/')} variant="outline" className="rounded-full h-12 px-6">Return Home</Button>
      </div>
    );
  }

  const slot = coach.slots.find(s => s.id === sessionData.slotId);
  if (!slot) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Invalid slot</h2>
        <p className="text-muted-foreground mb-6">The selected time slot is no longer available.</p>
        <Button onClick={() => setLocation(`/coach/${coach.id}`)} variant="outline" className="rounded-full h-12 px-6">Back to Coach</Button>
      </div>
    );
  }

  const seats = sessionData.seats;
  const basePrice = coach.price * seats;
  const dabbleFee = Math.round(basePrice * 0.10);
  const total = basePrice + dabbleFee;

  const handleVerify = (orderId: string, paymentId?: string, signature?: string, values?: CheckoutValues) => {
    const finalValues = values || savedValues;
    if (!finalValues) return;
    
    setPaymentError(null);
    verifyPayment.mutate({
      data: {
        orderId,
        paymentId,
        signature,
        coachId: coach.id,
        slotId: slot.id,
        seats,
        ...finalValues
      }
    }, {
      onSuccess: (booking) => {
        sessionStorage.removeItem('dabble_checkout');
        setLocation(`/confirmation/${booking.id}`);
      },
      onError: () => {
        setPaymentError("Payment verification failed. If money was deducted, please contact support.");
      }
    });
  };

  const handleRazorpayFlow = async (order: PaymentOrder, values: CheckoutValues) => {
    setPaymentError(null);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setPaymentError("Could not load payment gateway. Please check your connection and try again.");
      return;
    }

    const options = {
      key: order.keyId,
      amount: order.amountPaise,
      currency: order.currency,
      name: "Dabble",
      description: `Trial with ${coach.name}`,
      order_id: order.orderId,
      handler: function (response: any) {
        handleVerify(order.orderId, response.razorpay_payment_id, response.razorpay_signature, values);
      },
      prefill: {
        name: values.parentName,
        email: values.parentEmail,
        contact: values.parentPhone,
      },
      theme: {
        color: "#e6733c" // Primary color hex
      }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setPaymentError(response.error.description || "Payment failed or was cancelled.");
      });
      rzp.open();
    } catch (err) {
      setPaymentError("Failed to initialize payment gateway.");
    }
  };

  const onSubmit = (values: CheckoutValues) => {
    setPaymentError(null);
    setSavedValues(values);
    
    createOrder.mutate({ 
      data: { coachId: coach.id, slotId: slot.id, seats } 
    }, {
      onSuccess: (order) => {
        if (order.mode === 'simulated') {
          setPaymentOrder(order);
        } else {
          handleRazorpayFlow(order, values);
        }
      },
      onError: () => {
        setPaymentError("Could not create payment order. Please try again.");
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <button 
        onClick={() => history.back()} 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-bold text-sm bg-accent/50 hover:bg-accent px-4 py-2 rounded-full"
        data-testid="button-back-coach"
      >
        <ArrowLeft className="w-4 h-4" /> Back to coach
      </button>

      <div className="grid lg:grid-cols-[1fr_420px] gap-8 xl:gap-12 items-start">
        
        {/* Left: Form / Payment state */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 tracking-tight">Complete booking</h1>
          
          {paymentError && (
            <div className="mb-8 bg-destructive/10 border-2 border-destructive/20 text-destructive p-5 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-lg mb-1">Payment Issue</h3>
                <p className="font-medium text-destructive/80">{paymentError}</p>
              </div>
            </div>
          )}

          {paymentOrder?.mode === 'simulated' ? (
            <div className="bg-white p-8 sm:p-12 rounded-[3rem] border-2 shadow-xl shadow-primary/5 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
               <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6">
                 <CreditCard className="w-10 h-10 text-muted-foreground" />
               </div>
               <h2 className="text-3xl font-extrabold mb-4">Payment Simulation</h2>
               <p className="text-lg text-muted-foreground mb-8 max-w-sm">The backend has authorized a simulated checkout flow for this session.</p>
               <Button 
                 onClick={() => handleVerify(paymentOrder.orderId)}
                 size="lg"
                 className="rounded-full h-16 px-10 text-xl font-extrabold shadow-xl shadow-primary/20"
                 disabled={verifyPayment.isPending}
                 data-testid="button-simulate-payment"
               >
                 {verifyPayment.isPending ? "Verifying..." : "Simulate successful payment"}
               </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" data-testid="form-checkout">
                
                <div className="bg-white p-6 sm:p-8 rounded-[3rem] border-2 shadow-xl shadow-primary/5">
                  <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg shadow-md">1</div>
                    Parent Details
                  </h2>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="parentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold">Your Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Priya Sharma" className="h-14 rounded-2xl bg-accent/40 border-transparent focus-visible:border-primary px-4 text-base" {...field} data-testid="input-parent-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="parentEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-bold">Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="priya@example.com" type="email" className="h-14 rounded-2xl bg-accent/40 border-transparent focus-visible:border-primary px-4 text-base" {...field} data-testid="input-parent-email" />
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
                            <FormLabel className="text-base font-bold">Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+91" type="tel" className="h-14 rounded-2xl bg-accent/40 border-transparent focus-visible:border-primary px-4 text-base" {...field} data-testid="input-parent-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-[3rem] border-2 shadow-xl shadow-primary/5">
                  <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-lg shadow-md">2</div>
                    Child Details
                  </h2>
                  <div className="grid sm:grid-cols-[1fr_120px] gap-6">
                    <FormField
                      control={form.control}
                      name="childName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold">Child's First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Aryan" className="h-14 rounded-2xl bg-accent/40 border-transparent focus-visible:border-secondary px-4 text-base" {...field} data-testid="input-child-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="childAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-bold">Age</FormLabel>
                          <FormControl>
                            <Input type="number" min={4} max={18} placeholder="7" className="h-14 rounded-2xl bg-accent/40 border-transparent focus-visible:border-secondary px-4 text-base text-center" {...field} data-testid="input-child-age" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="hidden lg:block">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full rounded-[2rem] h-20 text-2xl shadow-2xl shadow-primary/20 font-extrabold transition-transform active:scale-[0.98]"
                    disabled={createOrder.isPending || verifyPayment.isPending}
                    data-testid="button-submit-booking-desktop"
                  >
                    {createOrder.isPending ? "Preparing secure checkout..." : verifyPayment.isPending ? "Verifying..." : `Pay ${formatRupee(total)} & Confirm`}
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground mt-6">
                    <ShieldCheck className="w-5 h-5 text-green-600" /> Safe & secure payments via UPI / Cards
                  </div>
                </div>
                
                {/* Mobile fixed bottom bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t z-50 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full rounded-[2rem] h-16 text-xl shadow-lg shadow-primary/20 font-extrabold active:scale-[0.98]"
                    disabled={createOrder.isPending || verifyPayment.isPending}
                    data-testid="button-submit-booking-mobile"
                  >
                    {createOrder.isPending ? "Processing..." : verifyPayment.isPending ? "Verifying..." : `Pay ${formatRupee(total)} & Confirm`}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>

        {/* Right: Summary */}
        <div className="lg:sticky lg:top-28 pb-24 lg:pb-0">
          <Card className="rounded-[3rem] overflow-hidden border-2 shadow-2xl shadow-primary/5 bg-white">
            <div className="p-6 sm:p-8 bg-accent/30 border-b border-border/50">
              <h3 className="font-extrabold text-xl mb-6">Booking Summary</h3>
              <div className="flex gap-5 items-center">
                <img 
                  src={coach.imageUrl || coachPlaceholder} 
                  alt={coach.name} 
                  className="w-20 h-20 rounded-[1.5rem] object-cover shrink-0 bg-white shadow-md border-2 border-white"
                  onError={(e) => { (e.target as HTMLImageElement).src = coachPlaceholder; }}
                />
                <div>
                  <div className="font-extrabold text-lg text-foreground leading-tight mb-1">{coach.activity} Trial</div>
                  <div className="text-sm font-bold text-muted-foreground">with {coach.name}</div>
                </div>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 space-y-4 bg-white">
              <div className="flex items-start gap-4 p-4 rounded-[2rem] border-2 border-transparent bg-accent/20">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="pt-1">
                  <div className="font-extrabold text-foreground">{slot.day} · {slot.date}</div>
                  <div className="text-sm text-muted-foreground font-bold mt-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {slot.time}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-[2rem] border-2 border-transparent bg-accent/20">
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="pt-1">
                  <div className="font-extrabold text-foreground">{coach.venue}</div>
                  <div className="text-sm text-muted-foreground font-bold mt-1">{coach.area}</div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-accent/40 border-t border-border/50 space-y-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center mb-6">Coach fee ₹{basePrice} + Dabble fee ₹{dabbleFee} (10%) = Total ₹{total}</p>
              
              <div className="flex justify-between text-base font-bold">
                <span className="text-muted-foreground">Coach fee <span className="font-medium text-sm ml-1">({seats} {seats === 1 ? 'student' : 'students'})</span></span>
                <span className="text-foreground">{formatRupee(basePrice)}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span className="text-muted-foreground flex items-center gap-1.5">Dabble fee (10%) <span className="w-4 h-4 rounded-full bg-border flex items-center justify-center text-[10px] cursor-help" title="Helps us keep the platform running safely">?</span></span>
                <span className="text-foreground">{formatRupee(dabbleFee)}</span>
              </div>
              <div className="pt-4 border-t-2 border-border/50 flex justify-between items-center mt-2">
                <span className="font-extrabold text-xl">Total</span>
                <span className="font-extrabold text-3xl text-primary">{formatRupee(total)}</span>
              </div>
            </div>
          </Card>
          
          <div className="mt-8 flex flex-col gap-4 px-2">
            <div className="flex items-start gap-3 text-sm font-bold text-muted-foreground bg-white p-4 rounded-2xl border shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> 
              <span>Free cancellation up to 24 hours before the session starts.</span>
            </div>
            <div className="flex items-start gap-3 text-sm font-bold text-muted-foreground bg-white p-4 rounded-2xl border shadow-sm">
              <CreditCard className="w-5 h-5 text-secondary shrink-0" /> 
              <span>Secure checkout. We do not store your card details.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
