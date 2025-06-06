import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EventInput, eventSchema } from "@shared/schema";
import { TOOLTIPS, MEAL_TYPES } from "@/lib/constants";
import { calculateEventEmissions } from "@/lib/calculations";
import { useFormData } from "@/context/FormContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";

export default function Event() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { formData, updateFormData } = useFormData();

  // Define default values to initialize the form
  const defaultValues: EventInput = {
    ...(formData.event as EventInput || {
      name: "",
      attendees: 1,
      duration: 1,
      venueSizeM2: 0,
      marketingMaterials: 0,
      printedDocuments: 0,
      banners: 0,
      mealsCount: 0,
      mealType: "standard",
      beverages: 0,
      wasteGenerated: 0,
      recyclingPercentage: 0,
      energyConsumption: 0,
    })
  };

  // Initialize form with validation schema
  const form = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  // Mettre à jour le contexte lorsque le formulaire change
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData('event', value);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  // Handle form submission
  async function onSubmit(data: EventInput) {
    setIsSubmitting(true);

    try {
      // Calculate emissions on the client side
      const eventEmissions = calculateEventEmissions(data);
      console.log('DEBUG - Event emissions calculated:', eventEmissions);
      
      // Save data to server
      await apiRequest("POST", "/api/event", data);

      // Store emissions in localStorage for the results page
      localStorage.setItem("eventEmissions", JSON.stringify(eventEmissions));
      localStorage.setItem("eventInput", JSON.stringify(data));

      toast({
        title: "Données d'événement enregistrées",
        description: "Les informations sur l'événement ont été sauvegardées avec succès.",
      });

      // Navigate to the next page (study trip)
      setLocation("/study-trip");
    } catch (error) {
      console.error("Error submitting event data:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Un problème est survenu lors de l'enregistrement des données.",
      });
    }

    setIsSubmitting(false);
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 gradient-text">Calcul d'émissions d'événement</h1>
      <p className="text-muted-foreground mb-6">
        Entrez les détails de l'événement scolaire pour calculer son empreinte carbone.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Les détails généraux de l'événement organisé par l'école
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nom de l'événement{" "}
                        <TooltipWrapper content={TOOLTIPS.event.name} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Journée portes ouvertes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="attendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre de participants{" "}
                        <TooltipWrapper content={TOOLTIPS.event.attendees} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <NumericInput
                          minValue={1}
                          placeholder="100"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Durée (jours){" "}
                        <TooltipWrapper content={TOOLTIPS.event.duration} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <NumericInput
                          minValue={0.5}
                          placeholder="1"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>Peut être un nombre décimal (ex: 0.5 pour une demi-journée)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venueSizeM2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Superficie du lieu (m²){" "}
                        <TooltipWrapper content={TOOLTIPS.event.venueSizeM2} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <NumericInput
                          minValue={0}
                          placeholder="200"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matériels et documents</CardTitle>
              <CardDescription>
                Les supports de communication et documents produits pour l'événement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="marketingMaterials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Matériels promotionnels{" "}
                        <TooltipWrapper content={TOOLTIPS.event.marketingMaterials} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="printedDocuments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Documents imprimés{" "}
                        <TooltipWrapper content={TOOLTIPS.event.printedDocuments} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="banners"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Bannières et affiches{" "}
                        <TooltipWrapper content={TOOLTIPS.event.banners} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Restauration</CardTitle>
              <CardDescription>
                Les repas et boissons servis pendant l'événement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="mealsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre de repas{" "}
                        <TooltipWrapper content={TOOLTIPS.event.mealsCount} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Type de repas{" "}
                        <TooltipWrapper content={TOOLTIPS.event.mealType} infoIcon />
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type de repas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MEAL_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="beverages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre de boissons{" "}
                        <TooltipWrapper content={TOOLTIPS.event.beverages} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Déchets et énergie</CardTitle>
              <CardDescription>
                Informations sur les déchets générés et l'énergie consommée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="wasteGenerated"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Déchets générés (kg){" "}
                        <TooltipWrapper content={TOOLTIPS.event.wasteGenerated} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="energyConsumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Consommation d'énergie (kWh){" "}
                        <TooltipWrapper content={TOOLTIPS.event.energyConsumption} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="recyclingPercentage"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>
                        Pourcentage de recyclage{" "}
                        <TooltipWrapper content={TOOLTIPS.event.recyclingPercentage} infoIcon />
                      </FormLabel>
                      <span className="w-12 p-1 text-center border rounded-md text-sm">
                        {field.value}%
                      </span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button" 
              variant="outline"
              onClick={() => setLocation("/restauration")}
            >
              Précédent
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Traitement en cours..." : "Continuer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}