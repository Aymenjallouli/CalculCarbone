import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useFormData } from "@/context/FormContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NumericInput } from "@/components/ui/numeric-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { RESTAURATION_CATEGORIES, TOOLTIPS } from "@/lib/constants";
import { restaurationSchema, type RestaurationType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { 
  calculateRestaurantEmissions,
  calculateTotalEmissions 
} from "@/lib/calculations";

export default function Restauration() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formData, updateFormData } = useFormData();

  const form = useForm<RestaurationType>({
    resolver: zodResolver(restaurationSchema),
    defaultValues: formData.restauration as RestaurationType || {
      viandeRouge: 0,
      viandePoulet: 0,
      poisson: 0,
      pates: 0,
      couscous: 0,
      sauce: 0,
      petitsPois: 0,
      haricot: 0,
      fromage: 0,
      beurre: 0,
      yaourt: 0,
      lait: 0,
      confiture: 0,
      oeuf: 0,
      legume: 0,
      fruit: 0,
      cake: 0,
      chocolat: 0,
      pain: 0,
      pizza: 0,
      cafe: 0,
      distance: 0,
      allerRetour: 0,
      foodWasteKg: 0,
      packagingWasteKg: 0,
      recyclingPercentage: 0,
    },
  });

  // Mettre à jour le contexte lorsque le formulaire change
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData('restauration', value);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  async function onSubmit(data: RestaurationType) {
    setIsSubmitting(true);
    try {
      // Log input data for debugging
      console.log('DEBUG - Restauration form submitted with data:', JSON.stringify(data));
      
      // Calculate emissions on the client side
      const restaurationEmissions = calculateRestaurantEmissions(data);
      console.log('DEBUG - Restauration emissions calculated:', restaurationEmissions);
      
      // Save data to server
      await apiRequest("POST", "/api/restauration", data);

      // Store emissions in localStorage for the results page
      localStorage.setItem("restaurationEmissions", JSON.stringify(restaurationEmissions));
      localStorage.setItem("restaurationInput", JSON.stringify(data));
      
      // Check if we already have other data
      const storedMerchandiseEmissions = localStorage.getItem("merchandiseEmissions");
      const storedTransportEmissions = localStorage.getItem("transportEmissions");
      
      if (storedMerchandiseEmissions && storedTransportEmissions) {
        // If we have other data, calculate total and store it
        const merchandiseEmissions = JSON.parse(storedMerchandiseEmissions);
        const transportEmissions = JSON.parse(storedTransportEmissions);
        
        // Check for event and study trip data
        const storedEventEmissions = localStorage.getItem("eventEmissions");
        const storedStudyTripEmissions = localStorage.getItem("studyTripEmissions");
        
        const eventEmissions = storedEventEmissions ? JSON.parse(storedEventEmissions) : undefined;
        const studyTripEmissions = storedStudyTripEmissions ? JSON.parse(storedStudyTripEmissions) : undefined;
        
        const totalEmissions = calculateTotalEmissions(
          merchandiseEmissions, 
          transportEmissions, 
          eventEmissions, 
          studyTripEmissions,
          restaurationEmissions
        );
        
        localStorage.setItem("totalEmissions", JSON.stringify(totalEmissions));
      }

      toast({
        title: "Données sauvegardées",
        description: "Vos données de restauration ont été enregistrées avec succès.",      });

      // Navigate to the event page
      navigate("/event");
    } catch (error) {
      console.error("Error submitting restauration data:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de l'enregistrement des données.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  // Grouper les catégories par type
  const categoriesByType: Record<string, typeof RESTAURATION_CATEGORIES> = 
    RESTAURATION_CATEGORIES.reduce((acc: Record<string, typeof RESTAURATION_CATEGORIES>, category) => {
      if (!acc[category.category]) {
        acc[category.category] = [];
      }
      acc[category.category].push(category);
      return acc;
    }, {} as Record<string, typeof RESTAURATION_CATEGORIES>);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Calculateur de{" "}
          <span className="eco-gradient-text">Restauration</span>
        </h1>
        <p className="text-muted-foreground">
          Saisissez les informations concernant la restauration dans votre
          établissement scolaire.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consommation et Gestion des Déchets</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Générer les champs par catégorie */}                {Object.entries(categoriesByType).map(([categoryName, categoryItems]) => (
                <div key={categoryName}>
                  <h3 className="text-lg font-medium mb-4">{categoryName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {categoryItems.map((category: any) => (
                      <FormField
                        key={category.id}
                        control={form.control}
                        name={category.id as keyof RestaurationType}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <TooltipWrapper
                                content={
                                  TOOLTIPS.restauration[
                                    category.id as keyof typeof TOOLTIPS.restauration
                                  ]
                                }
                                infoIcon
                              >
                                {category.label}
                              </TooltipWrapper>
                            </FormLabel>                            <FormControl>
                              <NumericInput
                                minValue={0}
                                placeholder="0"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormDescription>
                              {category.unit}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/transport")}
                >
                  Retour
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

      <div className="mt-8 bg-muted/40 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-3">À propos des calculs d'émissions pour la restauration</h3>
        <p className="text-muted-foreground mb-3">
          Les calculs d'émissions de CO₂ sont basés sur les facteurs d'émission moyens
          pour chaque type de nourriture et boisson. Ces estimations prennent en compte :
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>La production des aliments et leur transport</li>
          <li>La transformation et la préparation des repas</li>
          <li>Les emballages et les déchets générés</li>
          <li>L'impact positif des produits locaux et biologiques</li>
          <li>La réduction d'impact liée au recyclage</li>
        </ul>
        <p className="text-muted-foreground mt-3">
          Ces calculs vous donnent une approximation de l'impact carbone lié à la
          restauration dans votre établissement.
        </p>
      </div>
    </div>
  );
}
