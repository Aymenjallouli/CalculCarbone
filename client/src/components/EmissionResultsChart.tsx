import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmissionResult } from "@shared/schema";

interface EmissionResultsChartProps {
  data: EmissionResult;
}

export function EmissionResultsChart({ data }: EmissionResultsChartProps) {
  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "#4BC0C0",  // Couleur pour Restauration
    "#9966FF",  // Couleur pour Événements
    "#36A2EB",  // Couleur pour Voyages d'étude
  ];

  const barData = [
    {
      name: "Marchandises",
      emissions: data?.merchandise?.totalEmissions || 0,
    },
    {
      name: "Transport",
      emissions: data?.transport?.totalEmissions || 0,
    },
    {
      name: "Restauration",
      emissions: data?.restauration?.totalEmissions || 0,
    },
    {
      name: "Événements",
      emissions: data?.event?.totalEmissions || 0,
    },
    {
      name: "Voyages d'étude",
      emissions: data?.studyTrip?.totalEmissions || 0,
    },
    {
      name: "Total",
      emissions: data?.totalEmissions || 0,
    },
  ];

  const pieData = [
    { name: "Marchandises", value: data?.merchandise?.totalEmissions || 0 },
    { name: "Transport", value: data?.transport?.totalEmissions || 0 },
    { name: "Restauration", value: data?.restauration?.totalEmissions || 0 },
    { name: "Événements", value: data?.event?.totalEmissions || 0 },
    { name: "Voyages d'étude", value: data?.studyTrip?.totalEmissions || 0 },
  ].filter(item => item.value > 0); // Filtrer pour n'afficher que les éléments avec des valeurs positives

  const transportBreakdown = data?.transport?.breakdown 
    ? Object.entries(data.transport.breakdown).map(
        ([key, value]) => ({
          name: key,
          value,
        })
      )
    : [];

  const merchandiseBreakdown = data?.merchandise?.breakdown
    ? Object.entries(data.merchandise.breakdown).map(
        ([key, value]) => ({
          name: key,
          value,
        })
      )
    : [];

  const restaurationBreakdown = data?.restauration?.breakdown
    ? Object.entries(data.restauration.breakdown)
        .filter(([, value]) => typeof value === 'number' && value > 0)
        .map(([key, value]) => ({
          name: key === "viandeRouge" ? "Viande rouge" :
               key === "viandePoulet" ? "Poulet" :
               key === "poisson" ? "Poisson" :
               key === "pates" ? "Pâtes" :
               key === "couscous" ? "Couscous" :
               key === "sauce" ? "Sauce" :
               key === "petitsPois" ? "Petits pois" :
               key === "haricot" ? "Haricot" :
               key === "fromage" ? "Fromage" :
               key === "beurre" ? "Beurre" :
               key === "yaourt" ? "Yaourt" :
               key === "lait" ? "Lait" :
               key === "confiture" ? "Confiture" :
               key === "oeuf" ? "Œufs" :
               key === "legume" ? "Légumes" :
               key === "fruit" ? "Fruits" :
               key === "cake" ? "Cake" :
               key === "chocolat" ? "Chocolat" :
               key === "pain" ? "Pain" :
               key === "pizza" ? "Pizza" :
               key === "cafe" ? "Café" :
               key === "distance" ? "Distance d'approvisionnement" :
               key === "allerRetour" ? "Aller-retour d'approvisionnement" :
               key === "foodWaste" ? "Déchets alimentaires" :
               key === "packagingWaste" ? "Déchets d'emballage" :
               key,
          value,
        }))
    : [];

  const eventBreakdown = data?.event?.breakdown
    ? Object.entries(data.event.breakdown)
        .filter(([, value]) => typeof value === 'number' && value > 0)
        .map(([key, value]) => ({
          name: key,
          value,
        }))
    : [];

  const studyTripBreakdown = data?.studyTrip?.breakdown
    ? Object.entries(data.studyTrip.breakdown)
        .filter(([, value]) => typeof value === 'number' && value > 0)
        .map(([key, value]) => ({
          name: key,
          value,
        }))
    : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Résultats des Émissions de Carbone</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="comparison">Comparaison</TabsTrigger>
            <TabsTrigger value="merchandise">Marchandises</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="restauration">Restauration</TabsTrigger>
            <TabsTrigger value="event">Événements</TabsTrigger>
            <TabsTrigger value="studyTrip">Voyages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="mt-4 flex justify-center mb-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold">Émissions totales</h3>
                <p className="text-4xl font-bold text-primary mt-2">
                  {data?.totalEmissions ? data.totalEmissions.toFixed(2) : "0.00"}{" "}
                  <span className="text-lg font-normal text-muted-foreground">
                    kg CO₂e
                  </span>
                </p>
              </div>
            </div>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(2)} kg CO₂e`,
                      "Émissions",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="comparison">
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    label={{
                      value: "kg CO₂e",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(2)} kg CO₂e`,
                      "Émissions",
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="emissions"
                    fill="hsl(var(--chart-1))"
                    name="Émissions (kg CO₂e)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="merchandise">
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={merchandiseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {merchandiseBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(2)} kg CO₂e`,
                      "Émissions",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="transport">
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transportBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {transportBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(2)} kg CO₂e`,
                      "Émissions",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="restauration">
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={restaurationBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#4BC0C0"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {restaurationBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(2)} kg CO₂e`,
                      "Émissions",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="event">
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#9966FF"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {eventBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(2)} kg CO₂e`,
                      "Émissions",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="studyTrip">
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studyTripBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#36A2EB"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {studyTripBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(2)} kg CO₂e`,
                      "Émissions",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
