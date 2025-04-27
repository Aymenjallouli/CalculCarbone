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
  ];

  const barData = [
    {
      name: "Marchandises",
      emissions: data.merchandise.totalEmissions,
    },
    {
      name: "Transport",
      emissions: data.transport.totalEmissions,
    },
    {
      name: "Total",
      emissions: data.totalEmissions,
    },
  ];

  const pieData = [
    { name: "Marchandises", value: data.merchandise.totalEmissions },
    { name: "Transport", value: data.transport.totalEmissions },
  ];

  const transportBreakdown = Object.entries(data.transport.breakdown).map(
    ([key, value]) => ({
      name: key,
      value,
    })
  );

  const merchandiseBreakdown = Object.entries(data.merchandise.breakdown).map(
    ([key, value]) => ({
      name: key,
      value,
    })
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Résultats des Émissions de Carbone</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="comparison">Comparaison</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="merchandise">Marchandises</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="mt-4 flex justify-center mb-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold">Émissions totales</h3>
                <p className="text-4xl font-bold text-primary mt-2">
                  {data.totalEmissions.toFixed(2)}{" "}
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
        </Tabs>
      </CardContent>
    </Card>
  );
}
