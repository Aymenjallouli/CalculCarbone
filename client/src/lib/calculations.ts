import { EMISSION_FACTORS, MEAL_TYPES } from "./constants";
import { 
  MerchandiseInput, 
  TransportInput, 
  TransportCSVData,
  EventInput,
  StudyTripInput,
  EmissionResult 
} from "@shared/schema";

// Calculate emissions based on CSV transport data
export function calculateCSVTransportEmissions(data: TransportCSVData[]) {
  const breakdown: Record<string, number> = {};
  let totalEmissions = 0;

  // Process daily commute data
  data.forEach(student => {
    // Calculate commute emissions based on distance, months per year, and days per month
    const commuteEmissions = student.distanceAllerRetour * student.nbMoisEcole * student.nbJoursEcoleMois * 0.15; // Using average emission factor
    
    // Calculate bus emissions
    const busEmissions = student.kmBus * 0.05; // Lower emission factor for public transport
    
    // Calculate car emissions (both regular car use and personal car)
    const carEmissions = (student.kmVoiture + student.kmVoiturePerso) * 0.2; // Higher emission factor for cars
    
    // Add to total and breakdown
    totalEmissions += commuteEmissions + busEmissions + carEmissions;
    
    // Update breakdown
    breakdown.commuteTravel = (breakdown.commuteTravel || 0) + commuteEmissions;
    breakdown.bus = (breakdown.bus || 0) + busEmissions;
    breakdown.car = (breakdown.car || 0) + carEmissions;
    
    // Add family visit emissions if available
    if (student.frequenceRetourFamille && student.distanceMoyenneRetourFamille) {
      const familyVisitEmissions = student.frequenceRetourFamille * student.distanceMoyenneRetourFamille * 0.15;
      totalEmissions += familyVisitEmissions;
      breakdown.familyVisits = (breakdown.familyVisits || 0) + familyVisitEmissions;
    }
    
    // Add delivery emissions if available
    if (student.nbLivraisonsSemaine && student.distanceMoyenneLivraison) {
      const deliveryEmissions = student.nbLivraisonsSemaine * student.distanceMoyenneLivraison * 0.2 * 40; // 40 weeks per year
      totalEmissions += deliveryEmissions;
      breakdown.deliveries = (breakdown.deliveries || 0) + deliveryEmissions;
    }
  });

  return {
    totalEmissions,
    breakdown,
  };
}

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

  // Check if we're using CSV import data
  if (input.isCSVImport && input.csvData && input.csvData.length > 0) {
    // Calculate emissions from CSV data
    return calculateCSVTransportEmissions(input.csvData);
  }

  // Otherwise calculate with manual input
  Object.entries(input).forEach(([key, value]) => {
    if (key in EMISSION_FACTORS.transport && typeof value === 'object' && value !== null && !Array.isArray(value) && 'distance' in value) {
      const mode = key as keyof typeof EMISSION_FACTORS.transport;
      const transportData = value as { distance: number; frequency: number; passengers: number };
      
      // Weekly emissions calculation
      const weeklyDistance = transportData.distance * transportData.frequency;
      
      // Annual emissions (assuming 40 school weeks)
      const annualDistance = weeklyDistance * 40;
      
      // Calculate emissions based on distance and passenger count
      let emissions = annualDistance * EMISSION_FACTORS.transport[mode];
      
      // For shared transport, divide by number of passengers if applicable
      if (mode === 'car' && transportData.passengers > 1) {
        emissions = emissions / transportData.passengers;
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
  
  // Get trip count with default of 1 if not provided
  const tripCount = input.tripCount || 1;

  // Transportation emissions
  if (input.transportMode in EMISSION_FACTORS.studyTrip) {
    const transportMode = input.transportMode as keyof typeof EMISSION_FACTORS.studyTrip;
    const transportEmissions = input.distanceKm * EMISSION_FACTORS.studyTrip[transportMode] * input.participants;
    
    // Adjust for vehicle count if applicable
    const adjustedTransportEmissions = (input.transportMode === 'car' || input.transportMode === 'bus') && input.vehicleCount > 0
      ? transportEmissions * (input.vehicleCount / Math.ceil(input.participants / 4)) // assuming 4 passengers per vehicle
      : transportEmissions;
    
    // Multiply by the number of trips
    const totalTransportEmissions = adjustedTransportEmissions * tripCount;
    
    breakdown.transport = totalTransportEmissions;
    totalEmissions += totalTransportEmissions;
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
  
  const accommodationEmissions = input.nightsStay * accommodationEmissionFactor * input.participants * tripCount;
  breakdown.accommodation = accommodationEmissions;
  totalEmissions += accommodationEmissions;

  // Local transport emissions
  if (input.localTransport && input.localTransportKm > 0) {
    const localTransportEmissions = input.localTransportKm * EMISSION_FACTORS.studyTrip.localTransport * input.participants * tripCount;
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

  const mealsEmissions = input.mealsCount * mealEmissionFactor * input.participants * tripCount;
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
