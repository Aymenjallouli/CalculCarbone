import { EMISSION_FACTORS } from "./constants";
import { MerchandiseInput, TransportInput, EmissionResult } from "@shared/schema";

// Calculate emissions for merchandise
export function calculateMerchandiseEmissions(input: MerchandiseInput) {
  const breakdown: Record<string, number> = {};
  let totalEmissions = 0;

  Object.entries(input).forEach(([key, quantity]) => {
    if (key in EMISSION_FACTORS.merchandise) {
      const category = key as keyof typeof EMISSION_FACTORS.merchandise;
      const emissions = quantity * EMISSION_FACTORS.merchandise[category];
      breakdown[key] = emissions;
      totalEmissions += emissions;
    }
  });

  return {
    totalEmissions,
    breakdown,
  };
}

// Calculate emissions for transport
export function calculateTransportEmissions(input: TransportInput) {
  const breakdown: Record<string, number> = {};
  let totalEmissions = 0;

  Object.entries(input).forEach(([key, value]) => {
    if (key in EMISSION_FACTORS.transport) {
      const mode = key as keyof typeof EMISSION_FACTORS.transport;
      const { distance, frequency, passengers } = value;
      
      // Weekly emissions calculation
      const weeklyDistance = distance * frequency;
      
      // Annual emissions (assuming 40 school weeks)
      const annualDistance = weeklyDistance * 40;
      
      // Calculate emissions based on distance and passenger count
      let emissions = annualDistance * EMISSION_FACTORS.transport[mode];
      
      // For shared transport, divide by number of passengers if applicable
      if (mode === 'car' && passengers > 1) {
        emissions = emissions / passengers;
      }
      
      breakdown[key] = emissions;
      totalEmissions += emissions;
    }
  });

  return {
    totalEmissions,
    breakdown,
  };
}

// Calculate total emissions
export function calculateTotalEmissions(
  merchandiseEmissions: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  },
  transportEmissions: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  }
): EmissionResult {
  return {
    merchandise: merchandiseEmissions,
    transport: transportEmissions,
    totalEmissions: merchandiseEmissions.totalEmissions + transportEmissions.totalEmissions,
  };
}
