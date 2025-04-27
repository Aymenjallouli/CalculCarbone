import { EMISSION_FACTORS, MEAL_TYPES } from "./constants";
import { 
  MerchandiseInput, 
  TransportInput, 
  EventInput,
  StudyTripInput,
  EmissionResult 
} from "@shared/schema";

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

// Calculate emissions for events
export function calculateEventEmissions(input: EventInput) {
  const breakdown: Record<string, number> = {};
  let totalEmissions = 0;

  // Venue emissions
  const venueEmissions = input.venueSizeM2 * EMISSION_FACTORS.event.venue * input.duration;
  breakdown.venue = venueEmissions;
  totalEmissions += venueEmissions;

  // Materials emissions
  const marketingEmissions = input.marketingMaterials * EMISSION_FACTORS.event.marketingMaterials;
  breakdown.marketingMaterials = marketingEmissions;
  totalEmissions += marketingEmissions;

  const documentsEmissions = input.printedDocuments * EMISSION_FACTORS.event.printedDocuments;
  breakdown.printedDocuments = documentsEmissions;
  totalEmissions += documentsEmissions;

  const bannersEmissions = input.banners * EMISSION_FACTORS.event.banners;
  breakdown.banners = bannersEmissions;
  totalEmissions += bannersEmissions;

  // Food & beverages
  let mealEmissionFactor = EMISSION_FACTORS.event.standardMeal;
  if (input.mealType === 'vegetarian') {
    mealEmissionFactor = EMISSION_FACTORS.event.vegetarianMeal;
  } else if (input.mealType === 'vegan') {
    mealEmissionFactor = EMISSION_FACTORS.event.veganMeal;
  }

  const mealsEmissions = input.mealsCount * mealEmissionFactor;
  breakdown.meals = mealsEmissions;
  totalEmissions += mealsEmissions;

  const beveragesEmissions = input.beverages * EMISSION_FACTORS.event.beverage;
  breakdown.beverages = beveragesEmissions;
  totalEmissions += beveragesEmissions;

  // Waste emissions (adjust based on recycling percentage)
  const wasteEmissions = input.wasteGenerated * EMISSION_FACTORS.event.waste * (1 - (input.recyclingPercentage / 100));
  breakdown.waste = wasteEmissions;
  totalEmissions += wasteEmissions;

  // Energy emissions
  const energyEmissions = input.energyConsumption * EMISSION_FACTORS.event.energy;
  breakdown.energy = energyEmissions;
  totalEmissions += energyEmissions;

  return {
    totalEmissions,
    breakdown,
  };
}

// Calculate emissions for study trips
export function calculateStudyTripEmissions(input: StudyTripInput) {
  const breakdown: Record<string, number> = {};
  let totalEmissions = 0;

  // Transportation emissions
  if (input.transportMode in EMISSION_FACTORS.studyTrip) {
    const transportMode = input.transportMode as keyof typeof EMISSION_FACTORS.studyTrip;
    const transportEmissions = input.distanceKm * EMISSION_FACTORS.studyTrip[transportMode] * input.participants;
    
    // Adjust for vehicle count if applicable
    const adjustedTransportEmissions = (input.transportMode === 'car' || input.transportMode === 'bus') && input.vehicleCount > 0
      ? transportEmissions * (input.vehicleCount / Math.ceil(input.participants / 4)) // assuming 4 passengers per vehicle
      : transportEmissions;
    
    breakdown.transport = adjustedTransportEmissions;
    totalEmissions += adjustedTransportEmissions;
  }

  // Accommodation emissions
  let accommodationEmissionFactor = 0;
  switch(input.accommodationType) {
    case 'hotel':
      accommodationEmissionFactor = EMISSION_FACTORS.studyTrip.hotel;
      break;
    case 'hostel':
      accommodationEmissionFactor = EMISSION_FACTORS.studyTrip.hostel;
      break;
    case 'campsite':
      accommodationEmissionFactor = EMISSION_FACTORS.studyTrip.campsite;
      break;
    case 'other':
      accommodationEmissionFactor = EMISSION_FACTORS.studyTrip.otherAccommodation;
      break;
  }
  
  const accommodationEmissions = input.nightsStay * accommodationEmissionFactor * input.participants;
  breakdown.accommodation = accommodationEmissions;
  totalEmissions += accommodationEmissions;

  // Local transport emissions
  if (input.localTransport && input.localTransportKm > 0) {
    const localTransportEmissions = input.localTransportKm * EMISSION_FACTORS.studyTrip.localTransport * input.participants;
    breakdown.localTransport = localTransportEmissions;
    totalEmissions += localTransportEmissions;
  }

  // Meals emissions
  let mealEmissionFactor = EMISSION_FACTORS.studyTrip.standardMeal;
  if (input.mealType === 'vegetarian') {
    mealEmissionFactor = EMISSION_FACTORS.studyTrip.vegetarianMeal;
  } else if (input.mealType === 'vegan') {
    mealEmissionFactor = EMISSION_FACTORS.studyTrip.veganMeal;
  }

  const mealsEmissions = input.mealsCount * mealEmissionFactor * input.participants;
  breakdown.meals = mealsEmissions;
  totalEmissions += mealsEmissions;

  return {
    totalEmissions,
    breakdown,
  };
}

// Calculate total emissions with all components
export function calculateTotalEmissions(
  merchandiseEmissions: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  },
  transportEmissions: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  },
  eventEmissions?: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  },
  studyTripEmissions?: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  }
): EmissionResult {
  let total = merchandiseEmissions.totalEmissions + transportEmissions.totalEmissions;
  
  if (eventEmissions) {
    total += eventEmissions.totalEmissions;
  }
  
  if (studyTripEmissions) {
    total += studyTripEmissions.totalEmissions;
  }
  
  return {
    merchandise: merchandiseEmissions,
    transport: transportEmissions,
    event: eventEmissions,
    studyTrip: studyTripEmissions,
    totalEmissions: total,
  };
}
