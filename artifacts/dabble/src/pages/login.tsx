import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const searchParams = new URLSearchParams(window.location.search);
  const returnTo = searchParams.get("returnTo") || "/";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }

    loginMutation.mutate({ data: { email, password } }, {
      onSuccess: (authUser) => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        if (authUser.role === 'employee') {
          setLocation("/ops");
        } else if (authUser.role === 'coach') {
          setLocation("/coach");
        } else {
          if (returnTo.startsWith("/") && !returnTo.startsWith("//") && returnTo !== "/") {
            setLocation(returnTo);
          } else {
            setLocation("/");
          }
        }
      },
      onError: (err: any) => {
        setError(err.error?.error || "Invalid credentials");
      }
    });
  };

  const handleDemo = (type: "parent" | "coach" | "employee") => {
    if (type === 'employee') setEmail('ops@demo.com');
    else setEmail(`${type}@demo.com`);
    setPassword("demo1234");
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-10 rounded-[3rem] border-2 shadow-2xl shadow-primary/5 bg-white">
        <h1 className="text-3xl font-extrabold mb-6 text-center">Welcome back</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive font-bold rounded-2xl border-2 border-destructive/20 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Email Address</label>
            <Input 
              type="email" 
              autoComplete="username"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="h-14 rounded-2xl bg-accent/40 border-transparent focus-visible:border-primary px-4 text-base"
              data-testid="input-login-email"
              disabled={loginMutation.isPending}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2">Password</label>
            <Input 
              type="password" 
              autoComplete="current-password"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="h-14 rounded-2xl bg-accent/40 border-transparent focus-visible:border-primary px-4 text-base"
              data-testid="input-login-password"
              disabled={loginMutation.isPending}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-16 rounded-[2rem] text-lg font-extrabold shadow-xl shadow-primary/20"
            disabled={loginMutation.isPending}
            data-testid="button-login-submit"
          >
            {loginMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign in"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground font-medium mb-4">Don't have an account?</p>
          <Link href={`/signup?returnTo=${encodeURIComponent(returnTo)}`}>
            <Button variant="outline" className="w-full h-14 rounded-full font-bold border-2" data-testid="link-signup">
              Create an account
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 text-center">
          <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Demo Credentials</p>
          <div className="flex gap-4 justify-center">
            <Button variant="secondary" size="sm" onClick={() => handleDemo('parent')} className="rounded-full font-bold" data-testid="button-demo-parent">Parent</Button>
            <Button variant="secondary" size="sm" onClick={() => handleDemo('coach')} className="rounded-full font-bold" data-testid="button-demo-coach">Coach</Button>
            <Button variant="secondary" size="sm" onClick={() => handleDemo('employee')} className="rounded-full font-bold" data-testid="button-demo-ops">Ops</Button>
          </div>
        </div>
      </Card>
      
      <div className="mt-8">
        <Button 
          variant="ghost" 
          onClick={() => {
             sessionStorage.removeItem("dabble_checkout");
             setLocation("/");
          }} 
          className="rounded-full font-bold text-muted-foreground hover:text-foreground"
          data-testid="button-login-guest"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Continue as guest
        </Button>
      </div>
    </div>
  );
}
