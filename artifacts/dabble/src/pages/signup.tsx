import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSignUp, getGetCurrentUserQueryKey, SignupInputRole } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Signup() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const signupMutation = useSignUp();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<SignupInputRole>(SignupInputRole.parent);
  const [error, setError] = useState("");

  const searchParams = new URLSearchParams(window.location.search);
  const returnTo = searchParams.get("returnTo") || (role === SignupInputRole.parent ? "/" : "/coach");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    signupMutation.mutate({ data: { name, email, password, role } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        let target = returnTo;
        if (role === SignupInputRole.coach) {
          target = "/coach";
        }
        if (target.startsWith("/") && !target.startsWith("//")) {
          setLocation(target);
        } else {
          setLocation("/");
        }
      },
      onError: (err: any) => {
        setError(err.error?.error || "Registration failed");
      }
    });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-10 rounded-[3rem] border-2 shadow-2xl shadow-primary/5 bg-white">
        <h1 className="text-3xl font-extrabold mb-6 text-center">Create account</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive font-bold rounded-2xl border-2 border-destructive/20 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="flex bg-accent/40 p-1 rounded-[1.5rem] border border-border/50">
            <button
              type="button"
              onClick={() => setRole(SignupInputRole.parent)}
              className={cn(
                "flex-1 py-3 px-4 rounded-[1.2rem] text-sm font-bold transition-all",
                role === SignupInputRole.parent ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              I am a Parent
            </button>
            <button
              type="button"
              onClick={() => setRole(SignupInputRole.coach)}
              className={cn(
                "flex-1 py-3 px-4 rounded-[1.2rem] text-sm font-bold transition-all",
                role === SignupInputRole.coach ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              I am a Coach
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Full Name</label>
            <Input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="h-14 rounded-2xl bg-accent/40 border-transparent focus-visible:border-primary px-4 text-base"
              data-testid="input-signup-name"
              disabled={signupMutation.isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Email Address</label>
            <Input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="h-14 rounded-2xl bg-accent/40 border-transparent focus-visible:border-primary px-4 text-base"
              data-testid="input-signup-email"
              disabled={signupMutation.isPending}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2">Password (min 8 chars)</label>
            <Input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="h-14 rounded-2xl bg-accent/40 border-transparent focus-visible:border-primary px-4 text-base"
              data-testid="input-signup-password"
              disabled={signupMutation.isPending}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-16 rounded-[2rem] text-lg font-extrabold shadow-xl shadow-primary/20"
            disabled={signupMutation.isPending}
            data-testid="button-signup-submit"
          >
            {signupMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign up"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground font-medium mb-4">Already have an account?</p>
          <Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
            <Button variant="outline" className="w-full h-14 rounded-full font-bold border-2" data-testid="link-login">
              Sign in
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
