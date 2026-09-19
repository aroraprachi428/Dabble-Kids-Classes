import { Search, MapPin, Activity, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function Header() {
  const [location] = useLocation();
  const isHome = location === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:rotate-12 transition-transform duration-300 shadow-sm">
            <span className="font-bold text-xl leading-none">d</span>
          </div>
          <span className="font-bold text-2xl tracking-tight text-foreground">Dabble</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {!isHome && (
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Find a coach
            </Link>
          )}
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            For coaches
          </Link>
          <Button variant="outline" className="rounded-full h-10 border-input bg-white shadow-sm">
            Sign In
          </Button>
        </nav>
      </div>
    </header>
  );
}
