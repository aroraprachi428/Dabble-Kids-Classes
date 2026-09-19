import { HeroSearch } from "@/components/hero-search";
import heroKidsPainting from "@assets/generated_images/hero_kids_painting.jpg";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center py-10 md:py-20 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 md:left-1/4 w-[30rem] h-[30rem] bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute top-1/4 right-0 md:right-1/4 w-[30rem] h-[30rem] bg-secondary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 md:left-1/3 w-[30rem] h-[30rem] bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>
      
      <div className="w-full max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center z-10">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
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
