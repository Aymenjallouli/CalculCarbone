import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { TRANSPORT_MODES, TOOLTIPS } from "@/lib/constants";
import { transportSchema, type TransportInput } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  calculateTransportEmissions, 
  calculateTotalEmissions 
} from "@/lib/calculations";
import { Separator } from "@/components/ui/separator";

export default function Transport() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate default values for all transport modes
  const defaultValues: TransportInput = {};
  TRANSPORT_MODES.forEach(mode => {
    defaultValues[mode.id as keyof TransportInput] = {
      distance: 0,
      frequency: 0,
      passengers: 1
    };
  });

  const form = useForm<TransportInput>({
    resolver: zodResolver(transportSchema),
    defaultValues
  });

  async function onSubmit(data: TransportInput) {
    setIsSubmitting(true);
    try {
      // Calculate emissions on the client side
      const transportEmissions = calculateTransportEmissions(data);
      
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
        localStorage.setItem("totalEmissions", JSON.stringify(totalEmissions));
      }

      toast({
        title: "Données sauvegardées",
        description: "Vos données de transport ont été enregistrées avec succès.",
      });

      // Navigate to results
      navigate("/results");
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

      <Card>
        <CardHeader>
          <CardTitle>Informations de Transport</CardTitle>
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
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) || 0)
                              }
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
                            <Input
                              type="number"
                              min="0"
                              max="14"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) || 0)
                              }
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
                              <Input
                                type="number"
                                min="1"
                                max="8"
                                placeholder="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value) || 1)
                                }
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
                    {isSubmitting ? "Enregistrement..." : "Voir les résultats"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

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
