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
import { MERCHANDISE_CATEGORIES, TOOLTIPS } from "@/lib/constants";
import { merchandiseSchema, type MerchandiseInput } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  calculateMerchandiseEmissions,
  calculateTotalEmissions 
} from "@/lib/calculations";

export default function Merchandise() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MerchandiseInput>({
    resolver: zodResolver(merchandiseSchema),
    defaultValues: {
      paper: 0,
      notebook: 0,
      textbook: 0,
      computer: 0,
      furniture: 0,
    },
  });

  async function onSubmit(data: MerchandiseInput) {
    setIsSubmitting(true);
    try {
      // Calculate emissions on the client side
      const merchandiseEmissions = calculateMerchandiseEmissions(data);
      
      // Save data to server
      await apiRequest("POST", "/api/merchandise", data);

      // Store emissions in localStorage for the results page
      localStorage.setItem("merchandiseEmissions", JSON.stringify(merchandiseEmissions));
      localStorage.setItem("merchandiseInput", JSON.stringify(data));
      
      // Check if we already have transport data
      const storedTransportEmissions = localStorage.getItem("transportEmissions");
      if (storedTransportEmissions) {
        // If we have transport data, calculate total and store it
        const transportEmissions = JSON.parse(storedTransportEmissions);
        const totalEmissions = calculateTotalEmissions(merchandiseEmissions, transportEmissions);
        localStorage.setItem("totalEmissions", JSON.stringify(totalEmissions));
      }

      toast({
        title: "Données sauvegardées",
        description: "Vos données de marchandises ont été enregistrées avec succès.",
      });

      // Navigate to the next step
      navigate("/transport");
    } catch (error) {
      console.error("Error submitting merchandise data:", error);
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
          <span className="eco-gradient-text">Marchandises</span>
        </h1>
        <p className="text-muted-foreground">
          Saisissez les quantités de matériels et fournitures utilisés dans votre
          établissement scolaire.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fournitures et Équipements</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MERCHANDISE_CATEGORIES.map((category) => (
                  <FormField
                    key={category.id}
                    control={form.control}
                    name={category.id as keyof MerchandiseInput}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <TooltipWrapper
                            content={
                              TOOLTIPS.merchandise[
                                category.id as keyof typeof TOOLTIPS.merchandise
                              ]
                            }
                            infoIcon
                          >
                            {category.label}
                          </TooltipWrapper>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Nombre de {category.unit}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Retour à l'accueil
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
        <h3 className="text-lg font-medium mb-3">À propos des calculs d'émissions</h3>
        <p className="text-muted-foreground mb-3">
          Les calculs d'émissions de CO₂ sont basés sur les facteurs d'émission moyens
          pour chaque type de matériel. Ces estimations prennent en compte :
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Le cycle de production complet des matériaux</li>
          <li>Le transport des marchandises</li>
          <li>L'emballage</li>
        </ul>
        <p className="text-muted-foreground mt-3">
          Ces calculs vous donnent une approximation de l'impact carbone lié aux
          marchandises de votre établissement.
        </p>
      </div>
    </div>
  );
}
