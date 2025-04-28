import { EMISSION_FACTORS, MEAL_TYPES } from "./constants";
import { 
  MerchandiseInput, 
  TransportInput, 
  TransportCSVData,
  EventInput,
  StudyTripInput,
  EmissionResult 
} from "@shared/schema";

// Helper function to get emission factor based on fuel type
function getFuelEmissionFactor(fuelType: string | undefined): number {
  // Default emission factor for diesel
  let factor = 0.2;
  
  // If fuel type is not provided, return default
  if (!fuelType) {
    return factor;
  }
  
  // Adjust based on fuel type (actual values should be researched)
  const fuelTypeLower = fuelType.toLowerCase();
  if (fuelTypeLower.includes('essence')) {
    factor = 0.22; // Higher for gas/petrol
  } else if (fuelTypeLower.includes('diesel')) {
    factor = 0.2; // Standard for diesel
  } else if (fuelTypeLower.includes('électrique') || fuelTypeLower.includes('electrique')) {
    factor = 0.04; // Much lower for electric vehicles
  } else if (fuelTypeLower.includes('hybride')) {
    factor = 0.14; // Medium for hybrid vehicles
  }
  
  return factor;
}

// Calculate emissions based on CSV transport data
export function calculateCSVTransportEmissions(data: TransportCSVData[]) {
  const breakdown: Record<string, number> = {};
  let totalEmissions = 0;

  // Process data for each student
  data.forEach(student => {
    // Skip calculations for on-campus students if daily commute is concerned
    const isOffCampus = !student.isOnCampus;
    
    // Daily commute emissions (only for off-campus students)
    if (isOffCampus) {
      // Calculate commute emissions based on distance, months per year, and days per month
      const commuteEmissions = student.distanceAllerRetour * student.nbMoisEcole * student.nbJoursEcoleMois * 0.15;
      totalEmissions += commuteEmissions;
      breakdown.commuteTravel = (breakdown.commuteTravel || 0) + commuteEmissions;
      
      // Calculate bus emissions for daily commute
      const busEmissions = student.kmBus * EMISSION_FACTORS.transport.bus;
      totalEmissions += busEmissions;
      breakdown.bus = (breakdown.bus || 0) + busEmissions;
      
      // Calculate train emissions
      const trainEmissions = student.kmTrain * EMISSION_FACTORS.transport.train;
      totalEmissions += trainEmissions;
      breakdown.train = (breakdown.train || 0) + trainEmissions;
      
      // Calculate motorcycle/scooter emissions with fuel type consideration
      const motoFactor = getFuelEmissionFactor(student.typeCarburantMoto);
      const motoEmissions = student.kmMotoScooter * motoFactor;
      totalEmissions += motoEmissions;
      breakdown.motoScooter = (breakdown.motoScooter || 0) + motoEmissions;
      
      // Calculate car emissions with fuel type consideration
      const carFactor = getFuelEmissionFactor(student.typeCarburantVoiture);
      const carEmissions = student.kmVoiture * carFactor;
      totalEmissions += carEmissions;
      breakdown.car = (breakdown.car || 0) + carEmissions;
      
      // Calculate personal car emissions
      const personalCarFactor = getFuelEmissionFactor(student.typeCarburantPerso);
      const personalCarEmissions = student.kmVoiturePerso * personalCarFactor;
      totalEmissions += personalCarEmissions;
      breakdown.personalCar = (breakdown.personalCar || 0) + personalCarEmissions;
    }
    
    // Emissions from deliveries (applies to all students)
    if (student.nbLivraisonsSemaine && student.distanceMoyenneLivraison) {
      const deliveryEmissions = student.nbLivraisonsSemaine * student.distanceMoyenneLivraison * 0.2 * 40; // 40 weeks per year
      totalEmissions += deliveryEmissions;
      breakdown.deliveries = (breakdown.deliveries || 0) + deliveryEmissions;
    }
    
    // Family visits (applies to all students)
    if (student.frequenceRetourFamille && student.distanceMoyenneRetourFamille) {
      // Base family visit distance
      const familyVisitBaseDistance = student.frequenceRetourFamille * student.distanceMoyenneRetourFamille;
      
      // Calculate emissions for each transport mode used for family visits
      const busFamilyEmissions = student.kmBusRetourFamille * EMISSION_FACTORS.transport.bus;
      const trainFamilyEmissions = student.kmTrainRetourFamille * EMISSION_FACTORS.transport.train;
      
      // Motorcycle with fuel consideration
      const motoFamilyFactor = getFuelEmissionFactor(student.typeCarburantMotoRetour);
      const motoFamilyEmissions = student.kmMotoRetourFamille * motoFamilyFactor;
      
      // Car with fuel consideration
      const carFamilyFactor = getFuelEmissionFactor(student.typeCarburantVoitureRetour);
      const carFamilyEmissions = student.kmVoitureRetourFamille * carFamilyFactor;
      
      // Calculate total family visit emissions
      const totalFamilyVisitEmissions = busFamilyEmissions + trainFamilyEmissions + 
                                       motoFamilyEmissions + carFamilyEmissions;
      
      // If no specific transport modes were filled in, use a default calculation
      const familyVisitEmissions = totalFamilyVisitEmissions > 0 
                                 ? totalFamilyVisitEmissions 
                                 : familyVisitBaseDistance * 0.15;
      
      totalEmissions += familyVisitEmissions;
      breakdown.familyVisits = (breakdown.familyVisits || 0) + familyVisitEmissions;
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