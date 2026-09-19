import { HeartHandshake, ShieldCheck, CreditCard } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-white mt-12 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left mb-12">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground text-lg">Every coach is vetted</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We personally verify qualifications, background check, and interview every single coach on Dabble.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground text-lg">Book a trial</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Not sure if it's the right fit? Book a low-cost trial session before committing to a full package.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-foreground text-lg">Pay securely</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Simple, transparent pricing with secure payments. No hidden fees or surprise charges.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
              <span className="font-bold leading-none">d</span>
            </div>
            <span className="font-semibold text-foreground">Dabble</span>
          </div>
          
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <Link href="/coach" className="text-sm font-medium text-muted-foreground hover:text-foreground">Coach Dashboard</Link>
            <Link href="/ops" className="text-sm font-medium text-muted-foreground hover:text-foreground">Team Analytics</Link>
          </div>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Dabble Bangalore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
