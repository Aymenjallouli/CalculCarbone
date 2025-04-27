import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmissionResultsChart } from "@/components/EmissionResultsChart";
import { Link } from "wouter";
import { EmissionResult } from "@shared/schema";
import { calculateMerchandiseEmissions, calculateTransportEmissions, calculateTotalEmissions } from "@/lib/calculations";

export default function Results() {
  const { toast } = useToast();
  const [localResults, setLocalResults] = useState<EmissionResult | null>(null);

  // Fetch the saved results from the server
  const { data: serverResults, isLoading, error } = useQuery({
    queryKey: ["/api/results"],
    // Return null if 401 (results not found)
    queryFn: ({ signal }) =>
      fetch("/api/results", { signal, credentials: "include" })
        .then((res) => {
          if (!res.ok) {
            if (res.status === 401) return null;
            throw new Error("Failed to fetch results");
          }
          return res.json();
        })
        .catch((err) => {
          console.error("Error fetching results:", err);
          throw err;
        }),
  });

  // Try to load results from localStorage if not available from server
  useEffect(() => {
    try {
      // Check for stored emissions data
      const storedTotalEmissions = localStorage.getItem("totalEmissions");
      
      if (storedTotalEmissions) {
        // If we have the combined total, use it
        setLocalResults(JSON.parse(storedTotalEmissions));
      } else {
        // Try to combine individual components if available
        const merchandiseEmissionsStr = localStorage.getItem("merchandiseEmissions");
        const transportEmissionsStr = localStorage.getItem("transportEmissions");
        
        if (merchandiseEmissionsStr && transportEmissionsStr) {
          const merchandiseEmissions = JSON.parse(merchandiseEmissionsStr);
          const transportEmissions = JSON.parse(transportEmissionsStr);
          const totalEmissions = calculateTotalEmissions(
            merchandiseEmissions,
            transportEmissions
          );
          setLocalResults(totalEmissions);
          
          // Save the combined emissions for future use
          localStorage.setItem("totalEmissions", JSON.stringify(totalEmissions));
        } else if (merchandiseEmissionsStr) {
          // Try to reconstruct from inputs if detailed emissions not available
          const merchandiseInputStr = localStorage.getItem("merchandiseInput");
          
          if (merchandiseInputStr) {
            const merchandiseInput = JSON.parse(merchandiseInputStr);
            const merchandiseEmissions = calculateMerchandiseEmissions(merchandiseInput);
            const emptyTransportEmissions = {
              totalEmissions: 0,
              breakdown: {}
            };
            const totalEmissions = calculateTotalEmissions(
              merchandiseEmissions,
              emptyTransportEmissions
            );
            setLocalResults(totalEmissions);
          }
        } else if (transportEmissionsStr) {
          // Try with just transport data
          const transportInputStr = localStorage.getItem("transportInput");
          
          if (transportInputStr) {
            const transportInput = JSON.parse(transportInputStr);
            const transportEmissions = calculateTransportEmissions(transportInput);
            const emptyMerchandiseEmissions = {
              totalEmissions: 0,
              breakdown: {}
            };
            const totalEmissions = calculateTotalEmissions(
              emptyMerchandiseEmissions,
              transportEmissions
            );
            setLocalResults(totalEmissions);
          }
        }
      }
    } catch (e) {
      console.error("Error loading stored emissions:", e);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les résultats enregistrés localement.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Use server results if available, otherwise use local results
  const results = serverResults || localResults;

  // Check if we have no data
  const noData = !isLoading && !results;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl text-center">
        <h1 className="text-3xl font-bold mb-6">Chargement des résultats...</h1>
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-muted w-64 rounded mb-4"></div>
          <div className="h-64 bg-muted w-full rounded-md max-w-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
            <CardDescription>
              Une erreur s'est produite lors du chargement des résultats.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Veuillez réessayer ou revenir aux étapes précédentes pour saisir à
              nouveau vos données.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/merchandise">
                <Button variant="outline">Retour aux marchandises</Button>
              </Link>
              <Link href="/transport">
                <Button variant="outline">Retour au transport</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (noData) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Aucune donnée disponible</CardTitle>
            <CardDescription>
              Vous n'avez pas encore saisi toutes les informations nécessaires.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Pour visualiser les résultats, veuillez d'abord compléter les
              informations sur les marchandises et le transport.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/merchandise">
                <Button variant="default">Saisir les marchandises</Button>
              </Link>
              <Link href="/transport">
                <Button variant="outline">Saisir le transport</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Résultats d'<span className="eco-gradient-text">Empreinte Carbone</span>
        </h1>
        <p className="text-muted-foreground">
          Visualisez et analysez votre impact environnemental
        </p>
      </div>

      <div className="grid gap-8 mb-8">
        <EmissionResultsChart data={results} />
      </div>

      <div className="grid gap-8 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Analyse des Marchandises</CardTitle>
            <CardDescription>
              Bilan des émissions de CO₂ liées aux matériels et fournitures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Émissions totales</h3>
                <p className="text-2xl font-bold text-primary">
                  {results.merchandise.totalEmissions.toFixed(2)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    kg CO₂e
                  </span>
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Répartition par catégorie</h3>
                <ul className="space-y-2">
                  {Object.entries(results.merchandise.breakdown).map(
                    ([category, value]) => (
                      <li
                        key={category}
                        className="flex justify-between items-center"
                      >
                        <span className="capitalize">
                          {category === "paper"
                            ? "Papier"
                            : category === "notebook"
                            ? "Cahiers"
                            : category === "textbook"
                            ? "Manuels scolaires"
                            : category === "computer"
                            ? "Ordinateurs"
                            : category === "furniture"
                            ? "Mobilier"
                            : category}
                        </span>
                        <span className="font-medium">
                          {value.toFixed(2)}{" "}
                          <span className="text-xs text-muted-foreground">
                            kg CO₂e
                          </span>
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analyse du Transport</CardTitle>
            <CardDescription>
              Bilan des émissions de CO₂ liées aux déplacements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Émissions totales</h3>
                <p className="text-2xl font-bold text-secondary">
                  {results.transport.totalEmissions.toFixed(2)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    kg CO₂e
                  </span>
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Répartition par mode</h3>
                <ul className="space-y-2">
                  {Object.entries(results.transport.breakdown).map(
                    ([mode, value]) => (
                      <li
                        key={mode}
                        className="flex justify-between items-center"
                      >
                        <span className="capitalize">
                          {mode === "car"
                            ? "Voiture"
                            : mode === "bus"
                            ? "Bus public"
                            : mode === "train"
                            ? "Train"
                            : mode === "bicycle"
                            ? "Vélo"
                            : mode === "walking"
                            ? "Marche"
                            : mode === "schoolBus"
                            ? "Bus scolaire"
                            : mode}
                        </span>
                        <span className="font-medium">
                          {value.toFixed(2)}{" "}
                          <span className="text-xs text-muted-foreground">
                            kg CO₂e
                          </span>
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recommandations pour réduire votre empreinte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-medium text-primary">Marchandises</h3>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Réutilisez les fournitures scolaires quand c'est possible</li>
                <li>Privilégiez les manuels numériques aux versions papier</li>
                <li>Prolongez la durée de vie des équipements informatiques</li>
                <li>Utilisez du papier recyclé</li>
                <li>Achetez du mobilier éco-responsable et durable</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-secondary">Transport</h3>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Encouragez le covoiturage pour les trajets scolaires</li>
                <li>Mettez en place un système de "pédibus" pour les courtes distances</li>
                <li>Favorisez l'utilisation du vélo avec des parkings sécurisés</li>
                <li>Optimisez les itinéraires des bus scolaires</li>
                <li>Réduisez les déplacements inutiles avec des outils numériques</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/merchandise">
          <Button variant="outline">Modifier marchandises</Button>
        </Link>
        <Link href="/transport">
          <Button variant="outline">Modifier transport</Button>
        </Link>
        <Button
          onClick={() => window.print()}
          variant="secondary"
        >
          Imprimer les résultats
        </Button>
      </div>
    </div>
  );
}
