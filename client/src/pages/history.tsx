import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmissionResultsChart } from "@/components/EmissionResultsChart";
import { CalculationResult } from "@shared/schema";

export default function HistoryPage() {
  // Fetch calculation history
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/history"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Une erreur s'est produite lors de la récupération de l'historique : {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const history = data?.history || [];

  if (history.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Historique des calculs</CardTitle>
            <CardDescription>
              Vous n'avez pas encore effectué de calculs d'empreinte carbone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Utilisez les formulaires de calcul pour commencer à suivre votre empreinte carbone.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 eco-gradient-text">Historique des Calculs</h1>
      
      <div className="grid gap-6">
        {history.map((result: CalculationResult) => (
          <HistoryItem key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}

function HistoryItem({ result }: { result: CalculationResult }) {
  const date = new Date(result.createdAt);
  const formattedDate = format(date, "d MMMM yyyy à HH:mm", { locale: fr });
  
  // Calculate total emissions per category
  const totalMerchandise = result.results.merchandise.totalEmissions || 0;
  const totalTransport = result.results.transport.totalEmissions || 0;
  const totalEvent = result.results.event?.totalEmissions || 0; 
  const totalStudyTrip = result.results.studyTrip?.totalEmissions || 0;
  
  // Calculate percentage of each category
  const total = result.results.totalEmissions;
  const percentMerchandise = total > 0 ? (totalMerchandise / total * 100).toFixed(1) : "0";
  const percentTransport = total > 0 ? (totalTransport / total * 100).toFixed(1) : "0";
  const percentEvent = total > 0 ? (totalEvent / total * 100).toFixed(1) : "0";
  const percentStudyTrip = total > 0 ? (totalStudyTrip / total * 100).toFixed(1) : "0";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/40">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              Calcul du {formattedDate}
              <Badge variant="outline" className="ml-2">
                {total.toFixed(2)} kgCO₂e
              </Badge>
            </CardTitle>
            <CardDescription>
              Détails des émissions calculées par catégorie
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs defaultValue="chart">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Graphique</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="breakdown">Répartition</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="space-y-4">
            <div className="h-80">
              <EmissionResultsChart data={result.results} />
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CategoryCard 
                title="Équipement" 
                value={totalMerchandise} 
                percent={percentMerchandise} 
                color="chart-1"
              />
              <CategoryCard 
                title="Transport" 
                value={totalTransport} 
                percent={percentTransport} 
                color="chart-2"
              />
              {totalEvent > 0 && (
                <CategoryCard 
                  title="Événements" 
                  value={totalEvent} 
                  percent={percentEvent} 
                  color="chart-3"
                />
              )}
              {totalStudyTrip > 0 && (
                <CategoryCard 
                  title="Voyages d'étude" 
                  value={totalStudyTrip} 
                  percent={percentStudyTrip} 
                  color="chart-4"
                />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="breakdown" className="space-y-4">
            {/* Merchandise breakdown */}
            {Object.keys(result.results.merchandise.breakdown).length > 0 && (
              <BreakdownSection 
                title="Équipement" 
                breakdown={result.results.merchandise.breakdown} 
              />
            )}
            
            {/* Transport breakdown */}
            {Object.keys(result.results.transport.breakdown).length > 0 && (
              <BreakdownSection 
                title="Transport" 
                breakdown={result.results.transport.breakdown} 
              />
            )}
            
            {/* Event breakdown if exists */}
            {result.results.event && Object.keys(result.results.event.breakdown).length > 0 && (
              <BreakdownSection 
                title="Événements" 
                breakdown={result.results.event.breakdown} 
              />
            )}
            
            {/* Study trip breakdown if exists */}
            {result.results.studyTrip && Object.keys(result.results.studyTrip.breakdown).length > 0 && (
              <BreakdownSection 
                title="Voyages d'étude" 
                breakdown={result.results.studyTrip.breakdown} 
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function CategoryCard({ 
  title, 
  value, 
  percent, 
  color 
}: { 
  title: string; 
  value: number; 
  percent: string; 
  color: string;
}) {
  return (
    <div className="p-4 rounded-lg border">
      <h3 className="font-medium text-sm">{title}</h3>
      <p className={`text-xl font-bold mt-1 text-[hsl(var(--${color}))]`}>{value.toFixed(2)} kgCO₂e</p>
      <p className="text-xs text-muted-foreground mt-1">{percent}% du total</p>
    </div>
  );
}

function BreakdownSection({ title, breakdown }: { title: string; breakdown: Record<string, number> }) {
  // Sort breakdown by value (descending)
  const sortedBreakdown = Object.entries(breakdown)
    .sort(([, a], [, b]) => b - a)
    .filter(([, value]) => value > 0);
    
  return (
    <div className="space-y-2">
      <h3 className="font-medium">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {sortedBreakdown.map(([key, value]) => (
          <div key={key} className="p-2 rounded-md border bg-muted/20">
            <p className="text-xs capitalize">{formatBreakdownKey(key)}</p>
            <p className="font-medium">{value.toFixed(2)} kgCO₂e</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatBreakdownKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1') // Insert a space before all caps
    .replace(/^./, str => str.toUpperCase()) // Uppercase the first character
    .replace('C O 2', 'CO₂'); // Fix CO2 notation
}