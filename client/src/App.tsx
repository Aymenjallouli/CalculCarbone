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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/merchandise" component={Merchandise} />
      <Route path="/transport" component={Transport} />
      <Route path="/event" component={Event} />
      <Route path="/study-trip" component={StudyTrip} />
      <Route path="/results" component={Results} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
