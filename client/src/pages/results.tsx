import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmissionResultsChart } from "@/components/EmissionResultsChart";
import { Link } from "wouter";
import { EmissionResult } from "@shared/schema";
import { 
  calculateMerchandiseEmissions, 
  calculateTransportEmissions, 
  calculateRestaurantEmissions, 
  calculateTotalEmissions 
} from "@/lib/calculations";

export default function Results() {
  const { toast } = useToast();
  const [localResults, setLocalResults] = useState<EmissionResult | null>(null);

  // Fetch the saved results from the server
  const { data: serverResults, isLoading, error } = useQuery({
    queryKey: ["/api/results"],    // Return null if 401 (results not found)
    queryFn: ({ signal }) => {
      // Use the correct API URL based on environment (same logic as in queryClient.ts)
      const apiUrl = import.meta.env.DEV 
        ? `http://localhost:5001/api/results` // Development server
        : "/api/results"; // Production (relative URLs work)
      
      return fetch(apiUrl, { signal, credentials: "include" })
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
        });
    }
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
        const restaurationEmissionsStr = localStorage.getItem("restaurationEmissions");
        const eventEmissionsStr = localStorage.getItem("eventEmissions");
        const studyTripEmissionsStr = localStorage.getItem("studyTripEmissions");
        
        if (merchandiseEmissionsStr && transportEmissionsStr) {
          const merchandiseEmissions = JSON.parse(merchandiseEmissionsStr);
          const transportEmissions = JSON.parse(transportEmissionsStr);
          const restaurationEmissions = restaurationEmissionsStr ? JSON.parse(restaurationEmissionsStr) : undefined;
          const eventEmissions = eventEmissionsStr ? JSON.parse(eventEmissionsStr) : undefined;
          const studyTripEmissions = studyTripEmissionsStr ? JSON.parse(studyTripEmissionsStr) : undefined;
          
          const totalEmissions = calculateTotalEmissions(
            merchandiseEmissions,
            transportEmissions,
            eventEmissions,
            studyTripEmissions,
            restaurationEmissions
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
  }, [toast]);  // Prioritize local results if they exist, otherwise use server results
  // This ensures we use our reliable localStorage data if available
  console.log('DEBUG - Server results:', JSON.stringify(serverResults));
  console.log('DEBUG - Local results:', JSON.stringify(localResults));
  
  // Analyze server results structure
  const serverResultsData = serverResults?.results || serverResults?.data?.results;
  console.log('DEBUG - Server results data extracted:', JSON.stringify(serverResultsData));
  
  const results = localResults || serverResultsData || null;

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

      {results && (
        <div className="grid gap-8 mb-8">
          <EmissionResultsChart data={results} />
        </div>
      )}      <div className="grid gap-8 md:grid-cols-2 mb-8">
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
                  {results?.merchandise?.totalEmissions 
                    ? results.merchandise.totalEmissions.toFixed(2) 
                    : "0.00"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    kg CO₂e
                  </span>
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Répartition par catégorie</h3>
                <ul className="space-y-2">
                  {results?.merchandise?.breakdown ? (
                    Object.entries(results.merchandise.breakdown).map(
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
                            {typeof value === 'number' 
                              ? value.toFixed(2) 
                              : "0.00"}{" "}
                            <span className="text-xs text-muted-foreground">
                              kg CO₂e
                            </span>
                          </span>
                        </li>
                      )
                    )
                  ) : (
                    <li>Aucune donnée disponible</li>
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
                  {results?.transport?.totalEmissions
                    ? results.transport.totalEmissions.toFixed(2) 
                    : "0.00"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    kg CO₂e
                  </span>
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Répartition par mode</h3>
                <ul className="space-y-2">
                  {results?.transport?.breakdown ? (
                    Object.entries(results.transport.breakdown).map(
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
                            {typeof value === 'number' 
                              ? value.toFixed(2) 
                              : "0.00"}{" "}
                            <span className="text-xs text-muted-foreground">
                              kg CO₂e
                            </span>
                          </span>
                        </li>
                      )
                    )
                  ) : (
                    <li>Aucune donnée disponible</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>      <div className="grid gap-8 md:grid-cols-3 mb-8">
        {/* Restauration Card */}
        {results?.restauration && (
          <Card>
            <CardHeader>
              <CardTitle>Analyse de la Restauration</CardTitle>
              <CardDescription>
                Bilan des émissions de CO₂ liées à l'alimentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Émissions totales</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {results.restauration.totalEmissions.toFixed(2)}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      kg CO₂e
                    </span>
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Principales sources</h3>
                  <ul className="space-y-2">
                    {Object.entries(results.restauration.breakdown)
                      .filter(([, value]) => typeof value === 'number' && value > 0)
                      .sort((a, b) => Number(b[1]) - Number(a[1]))
                      .slice(0, 5)
                      .map(([category, value]) => (
                        <li
                          key={category}
                          className="flex justify-between items-center"
                        >                          <span className="capitalize">
                            {category === "viandeRouge" ? "Viande rouge" :
                             category === "viandePoulet" ? "Poulet" :
                             category === "poisson" ? "Poisson" :
                             category === "pates" ? "Pâtes" :
                             category === "couscous" ? "Couscous" :
                             category === "sauce" ? "Sauce" :
                             category === "petitsPois" ? "Petits pois" :
                             category === "haricot" ? "Haricot" :
                             category === "fromage" ? "Fromage" :
                             category === "beurre" ? "Beurre" :
                             category === "yaourt" ? "Yaourt" :
                             category === "lait" ? "Lait" :
                             category === "confiture" ? "Confiture" :
                             category === "oeuf" ? "Œufs" :
                             category === "legume" ? "Légumes" :
                             category === "fruit" ? "Fruits" :
                             category === "cake" ? "Cake" :
                             category === "chocolat" ? "Chocolat" :
                             category === "pain" ? "Pain" :
                             category === "pizza" ? "Pizza" :
                             category === "cafe" ? "Café" :
                             category === "distance" ? "Distance d'approvisionnement" :
                             category === "allerRetour" ? "Aller-retour d'approvisionnement" :
                             category === "foodWaste" ? "Déchets alimentaires" :
                             category === "packagingWaste" ? "Déchets d'emballage" :
                             category}
                          </span>
                          <span className="font-medium">
                            {typeof value === 'number' ? value.toFixed(2) : "0.00"}{" "}
                            <span className="text-xs text-muted-foreground">kg CO₂e</span>
                          </span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Événements Card */}
        {results?.event && (
          <Card>
            <CardHeader>
              <CardTitle>Analyse des Événements</CardTitle>
              <CardDescription>
                Bilan des émissions de CO₂ liées aux événements scolaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Émissions totales</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {results.event.totalEmissions.toFixed(2)}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      kg CO₂e
                    </span>
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Principales sources</h3>
                  <ul className="space-y-2">
                    {Object.entries(results.event.breakdown)
                      .filter(([, value]) => typeof value === 'number' && value > 0)
                      .sort((a, b) => Number(b[1]) - Number(a[1]))
                      .slice(0, 5)
                      .map(([category, value]) => (
                        <li
                          key={category}
                          className="flex justify-between items-center"
                        >
                          <span className="capitalize">
                            {category === "venue" ? "Lieu de l'événement" :
                             category === "marketingMaterials" ? "Matériels marketing" :
                             category === "printedDocuments" ? "Documents imprimés" :
                             category === "banners" ? "Bannières" :
                             category === "meals" ? "Repas" :
                             category === "beverages" ? "Boissons" :
                             category === "waste" ? "Déchets" :
                             category === "energy" ? "Énergie" :
                             category}
                          </span>
                          <span className="font-medium">
                            {typeof value === 'number' ? value.toFixed(2) : "0.00"}{" "}
                            <span className="text-xs text-muted-foreground">kg CO₂e</span>
                          </span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Voyages d'Étude Card */}
        {results?.studyTrip && (
          <Card>
            <CardHeader>
              <CardTitle>Analyse des Voyages d'Étude</CardTitle>
              <CardDescription>
                Bilan des émissions de CO₂ liées aux voyages scolaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Émissions totales</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {results.studyTrip.totalEmissions.toFixed(2)}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      kg CO₂e
                    </span>
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Principales sources</h3>
                  <ul className="space-y-2">
                    {Object.entries(results.studyTrip.breakdown)
                      .filter(([, value]) => typeof value === 'number' && value > 0)
                      .sort((a, b) => Number(b[1]) - Number(a[1]))
                      .slice(0, 5)
                      .map(([category, value]) => (
                        <li
                          key={category}
                          className="flex justify-between items-center"
                        >
                          <span className="capitalize">
                            {category === "transport" ? "Transport" :
                             category === "accommodation" ? "Hébergement" :
                             category === "localTransport" ? "Transport local" :
                             category === "meals" ? "Repas" :
                             category}
                          </span>
                          <span className="font-medium">
                            {typeof value === 'number' ? value.toFixed(2) : "0.00"}{" "}
                            <span className="text-xs text-muted-foreground">kg CO₂e</span>
                          </span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recommandations pour réduire votre empreinte</CardTitle>
        </CardHeader>
        <CardContent>          <div className="grid gap-6 md:grid-cols-2">
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

            <div className="space-y-3">              <h3 className="font-medium text-green-600">Restauration</h3>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Privilégiez les protéines végétales plutôt que la viande rouge</li>
                <li>Augmentez la part des aliments d'origine végétale dans vos menus</li>
                <li>Utilisez des produits locaux et de saison</li>
                <li>Réduisez les emballages en privilégiant les grands conditionnements</li>
                <li>Mettez en place un compost pour les déchets alimentaires</li>
                <li>Favorisez les aliments issus de l'agriculture biologique</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-purple-600">Événements</h3>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Organisez des événements virtuels quand c'est possible</li>
                <li>Choisissez des lieux accessibles en transport en commun</li>
                <li>Utilisez des supports de communication numériques</li>
                <li>Proposez des options de repas à faible empreinte carbone</li>
                <li>Mettez en place un tri sélectif efficace</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-blue-600">Voyages d'étude</h3>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Privilégiez le train pour les moyennes distances</li>
                <li>Optimisez le nombre de participants par véhicule</li>
                <li>Choisissez des hébergements éco-responsables</li>
                <li>Utilisez les transports en commun sur place</li>
                <li>Compensez les émissions inévitables par des actions de reboisement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/merchandise">
          <Button variant="outline">Modifier marchandises</Button>
        </Link>        
        <Link href="/transport">
          <Button variant="outline">Modifier transport</Button>
        </Link>
        <Link href="/restauration">
          <Button variant="outline">Modifier restauration</Button>
        </Link>
        <Link href="/event">
          <Button variant="outline">Modifier événements</Button>
        </Link>
        <Link href="/study-trip">
          <Button variant="outline">Modifier voyages</Button>
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
