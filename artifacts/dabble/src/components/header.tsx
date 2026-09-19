import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const { user, isLoading, logout, isLoggingOut } = useAuth();
  const isHome = location === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:rotate-12 transition-transform duration-300 shadow-sm">
            <span className="font-bold text-xl leading-none">d</span>
          </div>
          <span className="font-bold text-2xl tracking-tight text-foreground">Dabble</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {!isHome && (
            <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors" data-testid="link-find-coach">
              Find classes
            </Link>
          )}

          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-6 border-l pl-6 border-border/50">
                  <div className="text-sm">
                    <span className="font-bold block text-foreground leading-tight" data-testid="text-user-name">{user.name}</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest" data-testid="text-user-role">{user.role}</span>
                  </div>
                  
                  {user.role === 'parent' && (
                    <>
                      <Link href="/account/bookings" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors" data-testid="link-parent-bookings">My Bookings</Link>
                      <Link href="/account/kids" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors" data-testid="link-parent-kids">Kids</Link>
                    </>
                  )}

                  <Button 
                    variant="ghost" 
                    onClick={() => logout()} 
                    disabled={isLoggingOut}
                    className="font-bold rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    data-testid="button-logout"
                  >
                    {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : "Logout"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4 border-l pl-6 border-border/50">
                  <Link href="/login">
                    <Button variant="ghost" className="font-bold rounded-full" data-testid="link-login">Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="font-bold rounded-full shadow-lg shadow-primary/20" data-testid="link-signup">Sign up</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center">
          {!isLoading && (
            <>
              {user ? (
                 <div className="flex items-center gap-3">
                    {user.role === 'parent' && (
                      <Link href="/account/bookings" className="text-sm font-bold bg-accent px-4 py-2 rounded-full text-foreground" data-testid="link-mobile-dashboard">
                        Account
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => logout()} 
                      disabled={isLoggingOut}
                      className="font-bold rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                      data-testid="button-mobile-logout"
                    >
                      {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : "Logout"}
                    </Button>
                 </div>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm" className="font-bold rounded-full" data-testid="link-mobile-login">Log in</Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
