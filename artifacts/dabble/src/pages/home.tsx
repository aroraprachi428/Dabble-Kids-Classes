import { HeroSearch } from "@/components/hero-search";
import heroKidsPainting from "@assets/generated_images/hero_kids_painting.jpg";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center py-10 md:py-20 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 md:left-1/4 w-[30rem] h-[30rem] bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute top-1/4 right-0 md:right-1/4 w-[30rem] h-[30rem] bg-secondary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 md:left-1/3 w-[30rem] h-[30rem] bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>
      
      <div className="w-full max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center z-10">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          {user?.role === 'parent' && (
            <div className="mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black mb-4">Hi {user.name.split(' ')[0]} 👋</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/account/bookings" className="block w-full">
                  <Card className="p-4 rounded-[1.5rem] border-2 shadow-sm hover:border-primary/20 transition-all bg-white flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-left">My Bookings</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                  </Card>
                </Link>
                <Link href="/results" className="block w-full">
                  <Card className="p-4 rounded-[1.5rem] border-2 shadow-sm hover:border-secondary/20 transition-all bg-white flex items-center justify-between group">
                    <div className="font-bold text-left">✨ Plan my child's month</div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-transform" />
                  </Card>
                </Link>
              </div>
            </div>
          )}
          <HeroSearch />
        </div>
        <div className="hidden lg:block relative w-full h-[600px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[3rem] transform rotate-3 scale-105"></div>
          <img 
            src={heroKidsPainting} 
            alt="Kids enjoying painting class" 
            className="absolute inset-0 w-full h-full object-cover rounded-[3rem] shadow-2xl shadow-primary/10 border-4 border-white transform -rotate-2 hover:rotate-0 transition-transform duration-500"
            data-testid="img-hero-illustration"
          />
        </div>
      </div>
    </div>
  );
}
