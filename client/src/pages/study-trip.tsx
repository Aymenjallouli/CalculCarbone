import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useFormData } from "@/context/FormContext";
import { apiRequest } from "@/lib/queryClient";
import { 
  TOOLTIPS, 
  STUDY_TRIP_TRANSPORT_MODES, 
  STUDY_TRIP_ACCOMMODATION_TYPES,
  MEAL_TYPES 
} from "@/lib/constants";
import { calculateStudyTripEmissions } from "@/lib/calculations";
import { StudyTripInput, studyTripSchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";

export default function StudyTrip() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { formData, updateFormData } = useFormData();

  const defaultValues: StudyTripInput = formData.studyTrip as StudyTripInput || {
    destination: "",
    tripCount: 1,
    distanceKm: 0,
    duration: 1,
    participants: 1,
    transportMode: "train",
    vehicleCount: 0,
    accommodationType: "hotel",
    nightsStay: 0,
    localTransport: false,
    localTransportKm: 0,
    mealsCount: 0,
    mealType: "standard",
  };

  const form = useForm<StudyTripInput>({
    resolver: zodResolver(studyTripSchema),
    defaultValues,
  });

  // Mettre à jour le contexte lorsque le formulaire change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value) {
        updateFormData('studyTrip', value);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  // Watch for form values that trigger conditional fields
  const transportMode = form.watch("transportMode");
  const localTransport = form.watch("localTransport");

  // Handle form submission
  async function onSubmit(data: StudyTripInput) {
    setIsSubmitting(true);

    try {
      // Calculate emissions on the client side
      const studyTripEmissions = calculateStudyTripEmissions(data);
      console.log('DEBUG - Study Trip emissions calculated:', studyTripEmissions);
      
      // Save data to server
      await apiRequest("POST", "/api/study-trip", data);

      // Store emissions in localStorage for the results page
      localStorage.setItem("studyTripEmissions", JSON.stringify(studyTripEmissions));
      localStorage.setItem("studyTripInput", JSON.stringify(data));

      toast({
        title: "Données de voyage d'étude enregistrées",
        description: "Les informations sur le voyage d'étude ont été sauvegardées avec succès.",
      });

      // Navigate to the results page
      setLocation("/results");
    } catch (error) {
      console.error("Error submitting study trip data:", error);
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
      <h1 className="text-3xl font-bold mb-6 gradient-text">Calcul d'émissions de voyage d'étude</h1>
      <p className="text-muted-foreground mb-6">
        Entrez les détails des voyages d'étude organisés par l'école pour calculer leur empreinte carbone.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Les détails généraux du voyage d'étude
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Destination{" "}
                        <TooltipWrapper content={TOOLTIPS.studyTrip.destination} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Paris" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tripCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre de voyages{" "}
                        <TooltipWrapper content={TOOLTIPS.studyTrip.tripCount} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <NumericInput
                          minValue={1}
                          placeholder="1"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>Nombre de fois que ce voyage est effectué dans l'année</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="distanceKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Distance totale (km){" "}
                        <TooltipWrapper content={TOOLTIPS.studyTrip.distanceKm} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <NumericInput
                          minValue={0}
                          placeholder="0"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>Distance aller-retour totale</FormDescription>
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
                        <TooltipWrapper content={TOOLTIPS.studyTrip.duration} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <NumericInput
                          minValue={1}
                          placeholder="1"
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
                  name="participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre de participants{" "}
                        <TooltipWrapper content={TOOLTIPS.studyTrip.participants} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <NumericInput
                          minValue={1}
                          placeholder="20"
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
              <CardTitle>Transport</CardTitle>
              <CardDescription>
                Les moyens de transport utilisés pour le voyage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="transportMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mode de transport{" "}
                        <TooltipWrapper content={TOOLTIPS.studyTrip.transportMode} infoIcon />
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un mode de transport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STUDY_TRIP_TRANSPORT_MODES.map((mode) => (
                            <SelectItem key={mode.id} value={mode.id}>
                              {mode.label} ({form.watch("distanceKm") || 0} {mode.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(transportMode === "car" || transportMode === "bus") && (
                  <FormField
                    control={form.control}
                    name="vehicleCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nombre de véhicules{" "}
                          <TooltipWrapper content={TOOLTIPS.studyTrip.vehicleCount} infoIcon />
                        </FormLabel>
                        <FormControl>
                          <NumericInput
                            minValue={0}
                            placeholder="0"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hébergement</CardTitle>
              <CardDescription>
                Détails sur l'hébergement pendant le voyage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="accommodationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Type d'hébergement{" "}
                        <TooltipWrapper content={TOOLTIPS.studyTrip.accommodationType} infoIcon />
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type d'hébergement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STUDY_TRIP_ACCOMMODATION_TYPES.map((type) => (
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
                  name="nightsStay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre de nuits{" "}
                        <TooltipWrapper content={TOOLTIPS.studyTrip.nightsStay} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <NumericInput
                          minValue={0}
                          placeholder="0"
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
              <CardTitle>Transport local et repas</CardTitle>
              <CardDescription>
                Déplacements sur place et alimentation pendant le séjour
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="localTransport"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0">
                    <FormLabel>
                      Transport local{" "}
                      <TooltipWrapper content={TOOLTIPS.studyTrip.localTransport} infoIcon />
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {localTransport && (
                <FormField
                  control={form.control}
                  name="localTransportKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Distance en transport local (km){" "}
                        <TooltipWrapper content={TOOLTIPS.studyTrip.localTransportKm} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <NumericInput
                          minValue={0}
                          placeholder="0"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="mealsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre de repas{" "}
                        <TooltipWrapper content={TOOLTIPS.studyTrip.mealsCount} infoIcon />
                      </FormLabel>
                      <FormControl>
                        <NumericInput
                          minValue={0}
                          placeholder="0"
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
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Type de repas{" "}
                        <TooltipWrapper content={TOOLTIPS.studyTrip.mealType} infoIcon />
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
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button" 
              variant="outline"
              onClick={() => setLocation("/event")}
            >
              Précédent
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Voir les résultats"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}