import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { TRANSPORT_MODES, TOOLTIPS } from "@/lib/constants";
import { transportSchema, type TransportInput, type TransportCSVData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useFormData } from "@/context/FormContext";
import { CSVUploader } from "@/components/CSVUploader";
import { 
  calculateTransportEmissions, 
  calculateCSVTransportEmissions,
  calculateTotalEmissions 
} from "@/lib/calculations";
import { Separator } from "@/components/ui/separator";

export default function Transport() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formData, updateFormData } = useFormData();

  // Generate default values for all transport modes
  const defaultValues: TransportInput = {
    ...formData.transport as TransportInput || {
      car: { distance: 0, frequency: 0, passengers: 1 },
      bus: { distance: 0, frequency: 0, passengers: 1 },
      train: { distance: 0, frequency: 0, passengers: 1 },
      bicycle: { distance: 0, frequency: 0, passengers: 1 },
      walking: { distance: 0, frequency: 0, passengers: 1 },
      schoolBus: { distance: 0, frequency: 0, passengers: 1 },
      isCSVImport: false
    }
  };

  const form = useForm<TransportInput>({
    resolver: zodResolver(transportSchema),
    defaultValues
  });

  // Mettre à jour le contexte lorsque le formulaire change
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData('transport', value);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  async function onSubmit(data: TransportInput) {
    setIsSubmitting(true);
    try {
      // Log input data for debugging
      console.log('DEBUG - Transport form submitted with data:', JSON.stringify(data));
      
      // Utiliser les données réelles saisies par l'utilisateur
      // au lieu de données fictives
      
      // Calculate emissions on the client side
      const transportEmissions = calculateTransportEmissions(data);
      console.log('DEBUG - Transport emissions calculated:', transportEmissions);
      
      // Save data to server
      await apiRequest("POST", "/api/transport", data);

      // Store emissions in localStorage for the results page
      localStorage.setItem("transportEmissions", JSON.stringify(transportEmissions));
      localStorage.setItem("transportInput", JSON.stringify(data));
      
      // Check if we already have merchandise data
      const storedMerchandiseEmissions = localStorage.getItem("merchandiseEmissions");
      if (storedMerchandiseEmissions) {
        // If we have merchandise data, calculate total and store it
        const merchandiseEmissions = JSON.parse(storedMerchandiseEmissions);
        const totalEmissions = calculateTotalEmissions(merchandiseEmissions, transportEmissions);
        console.log('DEBUG - Total emissions calculated:', totalEmissions);
        localStorage.setItem("totalEmissions", JSON.stringify(totalEmissions));
      }

      toast({
        title: "Données sauvegardées",
        description: "Vos données de transport ont été enregistrées avec succès.",
      });

      // Navigate to restauration
      navigate("/restauration");
    } catch (error) {
      console.error("Error submitting transport data:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de l'enregistrement des données.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle CSV data received from the uploader
  const [csvData, setCsvData] = useState<TransportCSVData[]>([]);
  const [isProcessingCSV, setIsProcessingCSV] = useState(false);

  const handleCSVData = async (data: any[]) => {
    setIsProcessingCSV(true);
    
    try {
      // Process and save the CSV data
      // Convert the raw CSV data to our structured format
      const structuredData: TransportCSVData[] = data.map(row => {
        // Check if student lives on campus
        const residenceType = row["Résidence principale :"] || "";
        const isOnCampus = residenceType.includes("campus") || residenceType.includes("foyer");
        
        return {
          // Basic information
          id: row.ID?.toString() || "",
          email: row["Adresse de messagerie"] || "",
          nom: row.Nom || "",
          lastModified: row["Heure de la dernière modification"] || "",
          statut: row.Statut || "",
          residence: residenceType,
          isOnCampus,
          
          // Daily commute (only relevant for off-campus students)
          distanceAllerRetour: Number(row["Distance aller-retour domicile ↔ école (km/jour)  prend en considération le nombre d'aller-retour par jour :"]) || 0,
          nbMoisEcole: Number(row["Nombre de mois par an où vous vous rendez à l'école (entre 1 et 12 ):"]) || 0,
          nbJoursEcoleMois: Number(row["Nombre de jours par mois où vous vous rendez à l'école (entre 1 et 30) :"]) || 0,
          
          // Transportation modes
          kmBus: Number(row["Combien de km en bus ?"]) || 0,
          kmTrain: Number(row["Combien de km en Train ?"]) || 0,
          kmMotoScooter: Number(row["Combien de km en Moto/Scooter ?"]) || 0,
          typeCarburantMoto: row["Type de carburant :2"] || "",
          consommationMoto: Number(row["Consommation journalière de carburant (en L):1"]) || 0,
          
          kmVoiture: Number(row["Combien de km en Voiture ?"]) || 0,
          typeCarburantVoiture: row["Type de carburant :3"] || "",
          consommationVoiture: Number(row["Consommation journalière de carburant (en L):2"]) || 0,
          
          // Personal transport
          kmVoiturePerso: Number(row["Combien de km en Voiture personnelle/Covoiturage/Taxi?"]) || 0,
          typeCarburantPerso: row["Type de carburant :4"] || "",
          consommationCarburantSemaine: Number(row["Consommation de carburant en moyenne par semaine (en L) :"]) || 0,
          consommationElectriciteSemaine: Number(row["Consommation d'électricité en moyenne par semaine (en kWh) :"]) || 0,
          
          // Deliveries
          nbLivraisonsSemaine: Number(row["Nombre moyen de livraisons (repas, colis) reçues par semaine :"]) || 0,
          distanceMoyenneLivraison: Number(row["Distance moyenne pour une livraison (Km) :"]) || 0,
          
          // Family visits and return transport
          frequenceRetourFamille: Number(row["Fréquence des retours en famille pendant une semestre :"]) || 0,
          distanceMoyenneRetourFamille: Number(row["Distance moyenne en (Km) d'aller-retour :"]) || 0,
          kmBusRetourFamille: Number(row["Combien de km en Bus ?3"]) || 0,
          kmTrainRetourFamille: Number(row["Combien de km en Train ?3"]) || 0,
          kmMotoRetourFamille: Number(row["Combien de km en Moto ?2"]) || 0,
          typeCarburantMotoRetour: row["Type de carburant :5"] || "",
          consommationMotoRetour: Number(row["Consommation journalière de carburant (en L):3"]) || 0,
          kmVoitureRetourFamille: Number(row["Combien de km en Voiture ?2"]) || 0,
          typeCarburantVoitureRetour: row["Type de carburant :6"] || "",
          consommationVoitureRetour: Number(row["Consommation journalière de carburant (en L):4"]) || 0,
          
          // Keep all original data
          rawData: row,
        };
      });

      // Update state with the CSV data
      setCsvData(structuredData);
      
      // Update form data to include CSV data
      form.setValue("csvData", structuredData);
      form.setValue("isCSVImport", true);
      
      toast({
        title: "Données CSV importées avec succès",
        description: `${structuredData.length} enregistrements ont été importés.`,
      });
    } catch (error) {
      console.error("Error processing CSV data:", error);
      toast({
        title: "Erreur lors du traitement des données",
        description: "Le format du fichier CSV n'est pas compatible.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingCSV(false);
    }
  };

  // Submit handler for CSV data
  const handleCSVSubmit = async () => {
    if (csvData.length === 0) {
      toast({
        title: "Aucune donnée à soumettre",
        description: "Veuillez d'abord importer un fichier CSV.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a transport input with CSV data
      const dataToSubmit: TransportInput = {
        ...defaultValues,
        isCSVImport: true,
        csvData: csvData
      };

      // Save data to server
      await apiRequest("POST", "/api/transport", dataToSubmit);

      // Calculate emissions using our specialized function
      const estimatedEmissions = calculateCSVTransportEmissions(csvData);

      // Store emissions in localStorage for the results page
      localStorage.setItem("transportEmissions", JSON.stringify(estimatedEmissions));
      localStorage.setItem("transportInput", JSON.stringify(dataToSubmit));
      
      // Check if we already have merchandise data
      const storedMerchandiseEmissions = localStorage.getItem("merchandiseEmissions");
      if (storedMerchandiseEmissions) {
        // If we have merchandise data, calculate total and store it
        const merchandiseEmissions = JSON.parse(storedMerchandiseEmissions);
        const totalEmissions = calculateTotalEmissions(merchandiseEmissions, estimatedEmissions);
        localStorage.setItem("totalEmissions", JSON.stringify(totalEmissions));
      }

      toast({
        title: "Données CSV sauvegardées",
        description: "Les données de transport importées ont été enregistrées avec succès.",
      });

      // Navigate to results
      navigate("/results");
    } catch (error) {
      console.error("Error submitting CSV transport data:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de l'enregistrement des données CSV.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Calculateur de{" "}
          <span className="eco-gradient-text">Transport</span>
        </h1>
        <p className="text-muted-foreground">
          Saisissez les informations concernant les modes de transport utilisés.
        </p>
      </div>

      <Tabs defaultValue="csv-import" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="csv-import">Import CSV</TabsTrigger>
          <TabsTrigger value="manual-entry">Saisie Manuelle</TabsTrigger>
        </TabsList>
        
        <TabsContent value="csv-import" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Importation des données du formulaire de transport</CardTitle>
              <CardDescription>
                Importez le fichier CSV exporté du formulaire de collecte des données de transport
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CSVUploader onDataReceived={handleCSVData} isLoading={isProcessingCSV} />
              
              {csvData.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Aperçu des données importées</h3>
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted px-4 py-2 flex">
                      <div className="font-medium w-1/3">Nom</div>
                      <div className="font-medium w-1/3">Statut</div>
                      <div className="font-medium w-1/3">Distance (km)</div>
                    </div>
                    <div className="divide-y max-h-60 overflow-auto">
                      {csvData.slice(0, 5).map((item, index) => (
                        <div key={index} className="px-4 py-2 flex hover:bg-muted/50">
                          <div className="w-1/3 truncate">{item.nom || "Anonyme"}</div>
                          <div className="w-1/3">{item.statut || "Non spécifié"}</div>
                          <div className="w-1/3">{item.distanceAllerRetour} km</div>
                        </div>
                      ))}
                      {csvData.length > 5 && (
                        <div className="px-4 py-2 text-muted-foreground">
                          + {csvData.length - 5} autres enregistrements
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/merchandise")}
                    >
                      Retour aux marchandises
                    </Button>
                    <Button 
                      onClick={handleCSVSubmit} 
                      disabled={isSubmitting || csvData.length === 0}
                    >
                      {isSubmitting ? "Enregistrement..." : "Continuer"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manual-entry" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de Transport</CardTitle>
              <CardDescription>
                Remplissez manuellement les informations concernant vos modes de transport
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {TRANSPORT_MODES.map((mode) => (
                    <div key={mode.id}>
                      <h3 className="text-lg font-medium mb-4">
                        <TooltipWrapper
                          content={
                            TOOLTIPS.transport[
                              mode.id as keyof typeof TOOLTIPS.transport
                            ]
                          }
                          infoIcon
                        >
                          {mode.label}
                        </TooltipWrapper>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <FormField
                          control={form.control}
                          name={`${mode.id}.distance` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Distance par trajet</FormLabel>
                              <FormControl>
                                <NumericInput
                                  minValue={0}
                                  placeholder="0"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription>En kilomètres</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`${mode.id}.frequency` as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fréquence hebdomadaire</FormLabel>
                              <FormControl>
                                <NumericInput
                                  minValue={0}
                                  placeholder="0"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormDescription>Trajets par semaine</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {mode.id === 'car' && (
                          <FormField
                            control={form.control}
                            name={`${mode.id}.passengers` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre de passagers</FormLabel>
                                <FormControl>
                                  <NumericInput
                                    minValue={1}
                                    placeholder="1"
                                    value={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Pour le covoiturage
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}

                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/merchandise")}
                    >
                      Retour aux marchandises
                    </Button>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => form.reset()}
                      >
                        Réinitialiser
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Enregistrement..." : "Continuer"}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 bg-muted/40 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-3">À propos des calculs d'émissions de transport</h3>
        <p className="text-muted-foreground mb-3">
          Les calculs de CO₂ pour le transport prennent en compte :
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>La distance parcourue par chaque mode de transport</li>
          <li>La fréquence hebdomadaire des trajets</li>
          <li>Le nombre de passagers (pour le covoiturage)</li>
          <li>Une estimation sur 40 semaines d'école par an</li>
        </ul>
        <p className="text-muted-foreground mt-3">
          Ces estimations vous permettent d'identifier les modes de transport les plus
          écologiques et de prendre des décisions pour réduire votre empreinte carbone.
        </p>
      </div>
    </div>
  );
}
