import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Merchandise from "@/pages/merchandise";
import Transport from "@/pages/transport";
import Results from "@/pages/results";
import Navbar from "@/components/layout/Navbar";
import Event from "@/pages/event";
import StudyTrip from "@/pages/study-trip";
import AuthPage from "@/pages/auth-page";
import History from "@/pages/history";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { EPTProverdyBanner } from "@/components/layout/EPTProverdyBanner";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/merchandise" component={Merchandise} />
      <Route path="/transport" component={Transport} />
      <Route path="/event" component={Event} />
      <Route path="/study-trip" component={StudyTrip} />
      <Route path="/results" component={Results} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/history" component={History} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col relative overflow-hidden">
              <Navbar />
              <main className="flex-1 container mx-auto px-4 py-6">
                {/* Bannière EPT-Proverdy en haut de chaque page */}
                <EPTProverdyBanner />
                
                <Router />
              </main>
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
