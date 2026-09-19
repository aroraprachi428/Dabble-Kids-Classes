import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AuthProvider } from '@/hooks/use-auth';

import Home from '@/pages/home';
import Results from '@/pages/results';
import CoachDetails from '@/pages/coach';
import Checkout from '@/pages/checkout';
import Confirmation from '@/pages/confirmation';
import NotFound from '@/pages/not-found';
import Login from '@/pages/login';
import Signup from '@/pages/signup';
import ParentBookings from '@/pages/account/bookings';
import ParentKids from '@/pages/account/kids';
import CoachDashboard from '@/pages/coach-dashboard';
import Ops from '@/pages/ops';

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <RoutedErrorBoundary>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/results" component={Results} />
            <Route path="/coach/:id" component={CoachDetails} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/confirmation/:bookingId" component={Confirmation} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/account/bookings" component={ParentBookings} />
            <Route path="/account/kids" component={ParentKids} />
            <Route path="/coach" component={CoachDashboard} />
            <Route path="/ops" component={Ops} />
            <Route component={NotFound} />
          </Switch>
        </RoutedErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
